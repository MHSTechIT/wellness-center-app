// Pre-deploy DATA-INTEGRITY scan (read-only).
//
// WHY THIS EXISTS: dev and prod share ONE database. Most "works in dev, wrong in prod"
// reports about enrolled status / payment stage are NOT environment bugs — they are bad
// ROWS in the shared DB (duplicate paid installments, stale due rows) that make a stage
// read "Fully Paid" when only installment 1 is paid, etc. This script finds those rows
// BEFORE a deploy so they can be cleaned, and exits non-zero if any are found.
//
// It is 100% SELECT-only. It never writes. Run from repo root: `npm run predeploy:scan`.
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { Pool } from 'pg';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SERVER_DIR = path.resolve(__dirname, '..');        // server/
const REPO_ROOT = path.resolve(SERVER_DIR, '..');        // repo root
// Same load order as server/src/shared/env.ts (earlier wins; dotenv won't overwrite a set key).
dotenv.config({ path: path.join(SERVER_DIR, '.env') });
dotenv.config({ path: path.join(SERVER_DIR, '.env.local') });
dotenv.config({ path: path.join(REPO_ROOT, '.env.local') });

const pool = new Pool({
  host: process.env.PGHOST,
  port: Number(process.env.PGPORT || 5432),
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  ssl: process.env.PGSSL === 'false' ? false : { rejectUnauthorized: false },
  max: 4,
  connectionTimeoutMillis: 15000,
});

// Normalise program the SAME way the client does (norm() in app.ts): "L1 + L2" | "L2" | "L1".
const PROG = `case
  when lower(coalesce(program,'L1')) ~ 'l1\\s*\\+\\s*l2' then 'L1 + L2'
  when lower(coalesce(program,'L1')) like '%l2%' and lower(coalesce(program,'L1')) like '%l1%' then 'L1 + L2'
  when lower(coalesce(program,'L1')) like '%l2%' then 'L2'
  else 'L1' end`;

const CHECKS = [
  {
    id: 'DUP_PAID_INSTALLMENT',
    title: 'Duplicate PAID installment rows (same lead+program+installment#)',
    why: 'Two paid rows for the same installment make paid-row counts reach 2 → stage wrongly reads "Fully Paid".',
    sql: `select lead_id, ${PROG} as prog, installment_number, count(*) n
          from payments
          where status='paid' and payment_type='installment'
          group by lead_id, ${PROG}, installment_number
          having count(*) > 1
          order by n desc, lead_id`,
  },
  {
    id: 'DUP_PAID_FULL',
    title: 'Duplicate PAID full-payment rows (same lead+program)',
    why: 'Multiple paid full rows for one program → inflated totals / double-counted revenue.',
    sql: `select lead_id, ${PROG} as prog, count(*) n
          from payments
          where status='paid' and coalesce(payment_type,'full')='full'
          group by lead_id, ${PROG}
          having count(*) > 1
          order by n desc, lead_id`,
  },
  {
    id: 'STALE_DUE_ON_PAID_INSTALLMENT',
    title: 'Stale DUE row for an installment that is already PAID',
    why: 'Installment settled but its due row was never cleared → balance chasing + stage confusion.',
    sql: `select d.lead_id, ${PROG.replace(/program/g, 'd.program')} as prog, d.installment_number, count(*) n
          from payments d
          join payments p
            on p.lead_id=d.lead_id
           and coalesce(p.program,'L1')=coalesce(d.program,'L1')
           and p.installment_number=d.installment_number
           and p.status='paid' and p.payment_type='installment'
          where d.status='due' and d.payment_type='installment'
          group by d.lead_id, d.program, d.installment_number
          order by d.lead_id`,
  },
  {
    id: 'FULLYPAID_CONTRADICTION',
    title: 'Installment plan with BOTH installments paid AND an outstanding due',
    why: 'Directly the reported bug: shows "Fully Paid" while a balance is still open (or vice-versa).',
    sql: `with agg as (
            select lead_id, ${PROG} as prog,
              count(*) filter (where status='paid' and payment_type='installment') paid_inst,
              count(*) filter (where status='due') due_rows
            from payments
            group by lead_id, ${PROG})
          select lead_id, prog, paid_inst, due_rows
          from agg
          where paid_inst >= 2 and due_rows > 0
          order by lead_id`,
  },
  {
    id: 'DUE_WITHOUT_ANY_PAID',
    title: 'DUE installment-2 with NO paid installment-1 for the program',
    why: 'A balance request exists but installment 1 was never recorded paid → stage cannot be derived correctly.',
    sql: `with agg as (
            select lead_id, ${PROG} as prog,
              count(*) filter (where status='paid' and payment_type='installment') paid_inst,
              count(*) filter (where status='due'  and payment_type='installment') due_inst
            from payments
            group by lead_id, ${PROG})
          select lead_id, prog, paid_inst, due_inst
          from agg
          where due_inst > 0 and paid_inst = 0
          order by lead_id`,
  },
  {
    id: 'ENROLLED_NO_PAYMENT',
    title: 'Lead marked enrolled_at but has ZERO payment rows',
    why: 'Not always wrong (explicit consult enroll), but flags leads whose stage relies on consStatus only — review if a stage looks off.',
    level: 'info',
    sql: `select l.meta_lead_id as lead_id, l.enrolled_at
          from leads l
          left join payments p on p.lead_id = l.meta_lead_id
          where l.enrolled_at is not null and p.id is null
          order by l.enrolled_at desc
          limit 50`,
  },
];

async function main() {
  const missing = ['PGHOST', 'PGUSER', 'PGDATABASE'].filter((k) => !process.env[k]);
  if (missing.length) {
    console.error(`\n[predeploy-scan] Missing DB env: ${missing.join(', ')} — check server/.env / .env.local\n`);
    process.exit(2);
  }
  let problems = 0;
  console.log('\n────────────────────────────────────────────────────────');
  console.log(' PRE-DEPLOY DATA-INTEGRITY SCAN (payments / enrollment)');
  console.log('────────────────────────────────────────────────────────');
  for (const c of CHECKS) {
    let rows = [];
    try {
      const r = await pool.query(c.sql);
      rows = r.rows;
    } catch (e) {
      console.log(`\n⚠️  ${c.id}: query failed — ${e.message}`);
      continue;
    }
    const isInfo = c.level === 'info';
    if (!rows.length) {
      console.log(`\n✅ ${c.id} — ${c.title}: clean`);
      continue;
    }
    if (isInfo) {
      console.log(`\nℹ️  ${c.id} — ${c.title}: ${rows.length} row(s) [informational]`);
    } else {
      problems += rows.length;
      console.log(`\n❌ ${c.id} — ${c.title}: ${rows.length} PROBLEM ROW(S)`);
      console.log(`   why: ${c.why}`);
    }
    for (const row of rows.slice(0, 20)) {
      console.log('   ·', JSON.stringify(row));
    }
    if (rows.length > 20) console.log(`   … and ${rows.length - 20} more`);
  }
  console.log('\n────────────────────────────────────────────────────────');
  if (problems) {
    console.log(` RESULT: ${problems} data anomaly row(s) found — CLEAN THESE BEFORE DEPLOY.`);
    console.log('────────────────────────────────────────────────────────\n');
    await pool.end();
    process.exit(1);
  }
  console.log(' RESULT: no payment/enrollment data anomalies. Safe to deploy. ✅');
  console.log('────────────────────────────────────────────────────────\n');
  await pool.end();
  process.exit(0);
}

main().catch((e) => {
  console.error('[predeploy-scan] fatal:', e.message);
  process.exit(2);
});
