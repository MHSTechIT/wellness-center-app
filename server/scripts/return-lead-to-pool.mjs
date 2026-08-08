// Send ONE lead back to Assign & approve → Unassigned pool, clearing the workflow state that makes
// it appear on Reception / Health advisor / Health coach. Scoped to a single phone number.
//
// DRY RUN BY DEFAULT — it prints exactly what it would change and touches nothing. Add --apply to
// commit. Everything runs in one transaction, so a failure leaves the database untouched.
//
//   Preview (safe):
//     PGHOST=... PGDATABASE=... PGUSER=... PGPASSWORD=... node server/scripts/return-lead-to-pool.mjs +917013326387
//   Apply:
//     PGHOST=... PGDATABASE=... PGUSER=... PGPASSWORD=... node server/scripts/return-lead-to-pool.mjs +917013326387 --apply
//
// REFUSES to touch a lead that has any payment rows: money means an enrolment/collection happened,
// and silently detaching that from its appointment would corrupt Accounts. Those need a human call.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SERVER_DIR = path.resolve(HERE, '..');

// server/.env fills only what the caller did NOT provide, so a PGDATABASE=... prefix always wins.
function loadEnv() {
  const f = path.join(SERVER_DIR, '.env');
  if (!fs.existsSync(f)) return;
  for (const line of fs.readFileSync(f, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/);
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].trim();
  }
}

const args = process.argv.slice(2).filter((a) => a !== '--');
const apply = args.includes('--apply');
const raw = args.find((a) => !a.startsWith('--'));
if (!raw) {
  console.error('Usage: node server/scripts/return-lead-to-pool.mjs <phone> [--apply]');
  process.exit(2);
}
const digits = raw.replace(/\D/g, '').slice(-10);   // match on the last 10 digits, ignoring +91 / spacing
if (digits.length !== 10) { console.error('✖ Need a 10-digit phone number, got: ' + raw); process.exit(2); }

loadEnv();
const pool = new pg.Pool({
  host: process.env.PGHOST, port: Number(process.env.PGPORT || 5432),
  user: process.env.PGUSER, password: process.env.PGPASSWORD, database: process.env.PGDATABASE,
  ssl: process.env.PGSSL === 'false' ? false : { rejectUnauthorized: false }, max: 2,
});

const show = (o) => JSON.stringify(o);

async function main() {
  console.log('Database : ' + (process.env.PGDATABASE || '?') + ' @ ' + (process.env.PGHOST || '?'));
  console.log('Phone    : ' + digits);
  console.log('Mode     : ' + (apply ? 'APPLY (writes, in one transaction)' : 'DRY RUN — nothing will change'));
  console.log('');

  const c = await pool.connect();
  try {
    await c.query('BEGIN');

    const leads = (await c.query(
      `select meta_lead_id, name, phone, source, service, assigned_to, is_assigned, in_pool,
              call_status, visited_at, enrolled_at
         from leads
        where right(regexp_replace(coalesce(phone,''), '\\D', '', 'g'), 10) = $1`, [digits])).rows;

    if (!leads.length) { console.log('No lead found with that number — nothing to do.'); await c.query('ROLLBACK'); return; }
    console.log('Matched ' + leads.length + ' lead row(s):');
    leads.forEach((l) => console.log('  ' + show(l)));
    console.log('');

    const ids = leads.map((l) => l.meta_lead_id);

    // Money is the hard stop.
    const pays = (await c.query(
      `select id, amount, status, service, program, appointment_id from payments where lead_id = any($1)`, [ids])).rows;
    if (pays.length) {
      console.log('✖ REFUSING — this lead has ' + pays.length + ' payment row(s):');
      pays.forEach((p) => console.log('   ' + show(p)));
      console.log('   Removing it would detach collected money from its appointment. Resolve in Accounts first.');
      await c.query('ROLLBACK');
      process.exitCode = 1;
      return;
    }
    console.log('Payments: none — safe to proceed.');

    const appts = (await c.query(
      `select id, service, status, stage, appt_date, visited_at from appointments where lead_id = any($1)`, [ids])).rows;
    console.log('Appointments to delete (' + appts.length + '):');
    appts.forEach((a) => console.log('   ' + show(a)));

    // 1. Appointments are what put the client on Reception / Blood test / Physio. Removing them is
    //    what takes the lead off those screens.
    const delA = await c.query(`delete from appointments where lead_id = any($1)`, [ids]);

    // 2. Reset the lead itself: unassigned + pooled (Assign & approve reads in_pool AND NOT is_assigned),
    //    and clear the journey markers that put it on the Advisor and Coach queues.
    const upd = await c.query(
      `update leads
          set assigned_to = null,
              is_assigned = false,
              in_pool     = true,
              pool_added_at = now(),
              call_status = null,
              visited_at  = null,
              enrolled_at = null,
              coach_profile = null
        where meta_lead_id = any($1)
        returning meta_lead_id, name, phone, assigned_to, is_assigned, in_pool, call_status, visited_at, enrolled_at`,
      [ids]);

    console.log('');
    console.log('Appointments deleted : ' + delA.rowCount);
    console.log('Leads reset to pool  : ' + upd.rowCount);
    upd.rows.forEach((r) => console.log('   ' + show(r)));

    if (apply) { await c.query('COMMIT'); console.log('\n✅ APPLIED — the lead is back in the Unassigned pool.'); }
    else { await c.query('ROLLBACK'); console.log('\n↩  DRY RUN — rolled back, nothing changed. Re-run with --apply to commit.'); }
  } catch (e) {
    try { await c.query('ROLLBACK'); } catch { /* connection already gone */ }
    console.error('\n❌ FAILED — ' + e.message + '\n   Rolled back; the database is unchanged.');
    process.exitCode = 1;
  } finally {
    c.release();
    await pool.end();
  }
}

main();
