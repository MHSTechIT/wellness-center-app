// Regression test: PHYSIOTHERAPY LEADS ARE NEVER AUTO-ASSIGNED.
//
// Five physio leads were auto-assigned to the default advisor team because the Meta crawl writes
// leads.service = "Diabetes" for every campaign — so the allocator could not tell them apart from
// diabetes leads and fell through to the default team. This proves the rule holds and, just as
// importantly, that every other service still gets assigned exactly as before.
//
// Run:  node server/scripts/test-autoassign-physio.mjs      (needs `npm --prefix server run build`)
//
// Safe against the dev database: it seeds clearly-marked temporary leads, runs the allocator in
// DRY-RUN (which writes nothing), and deletes its own rows in a finally block.
import dotenv from 'dotenv';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import pg from 'pg';

dotenv.config({ path: path.resolve('server/.env') });
const pool = new pg.Pool({
  host: process.env.PGHOST, port: +(process.env.PGPORT || 5432), user: process.env.PGUSER,
  password: process.env.PGPASSWORD, database: process.env.PGDATABASE, ssl: false,
});

const PREFIX = 'ZZTEST-physio-';
let pass = 0, fail = 0;
const check = (name, ok, detail) => { (ok ? pass++ : fail++); console.log((ok ? '  PASS  ' : '  FAIL  ') + name + (detail ? '   ' + detail : '')); };

try {
  // The campaign the mapping files under Physiotherapy — the same one the five real leads came in on.
  const { rows: mrows } = await pool.query(`SELECT value FROM app_settings WHERE key='meta_campaign_services' LIMIT 1`);
  const map = mrows[0]?.value || {};
  const physioCampaign = (map['Physiotherapy'] || [])[0] || '';
  const diabetesCampaign = (map['Diabetes Counselling'] || [])[0] || '';
  if (!physioCampaign) { console.log('\n  SKIPPED — no campaign is mapped to Physiotherapy in this database.\n'); process.exit(0); }
  console.log('\nPhysiotherapy is manual-only');
  console.log('physio campaign: ' + physioCampaign + '\n');

  const seed = [
    // The bug, exactly: a physio campaign whose stored service still reads "Diabetes".
    { id: PREFIX + 'meta-mapped', name: 'T Meta physio', source: 'Meta Ads', campaign: physioCampaign, service: 'Diabetes', manual: true },
    // A walk-in typed straight in as physio — manual-only too, by its own stored service.
    { id: PREFIX + 'walkin', name: 'T Walk-in physio', source: 'Walk-in / Referral / Telecalling', campaign: 'Manual entry', service: 'Physio', manual: true },
    // Controls: these MUST still be assigned, or the fix has broken everything else.
    { id: PREFIX + 'meta-diab', name: 'T Meta diabetes', source: 'Meta Ads', campaign: diabetesCampaign || 'ZZ unmapped campaign', service: 'Diabetes', manual: false },
    { id: PREFIX + 'manual-diab', name: 'T Manual diabetes', source: 'Manual', campaign: 'Manual entry', service: 'Diabetes Counselling', manual: false },
  ];

  // Baseline first: whatever the allocator would already do without the test rows.
  const mod = await import(pathToFileURL(path.resolve('server/dist/services/autoassign.js')).href);
  const before = await mod.runAutoAssign({ dryRun: true, force: true, by: 'test' });

  for (const s of seed) {
    await pool.query(
      `INSERT INTO leads (meta_lead_id, name, phone, source, campaign, service, created_at, is_assigned, assigned_to)
       VALUES ($1,$2,'+910000000000',$3,$4,$5, now(), false, '')
       ON CONFLICT (meta_lead_id) DO UPDATE SET created_at = now(), is_assigned = false, assigned_to = ''`,
      [s.id, s.name, s.source, s.campaign, s.service]);
  }

  const after = await mod.runAutoAssign({ dryRun: true, force: true, by: 'test' });
  const expectManual = seed.filter((s) => s.manual).length;
  const expectAssigned = seed.filter((s) => !s.manual).length;

  check('physiotherapy leads are held back',
    (after.manualOnly || 0) - (before.manualOnly || 0) === expectManual,
    'manualOnly ' + (before.manualOnly || 0) + ' -> ' + (after.manualOnly || 0) + ', expected +' + expectManual);
  check('every other service is still assigned',
    after.assigned - before.assigned === expectAssigned,
    'assigned ' + before.assigned + ' -> ' + after.assigned + ', expected +' + expectAssigned);
  check('the held-back leads stay in the pool',
    after.poolLeft - before.poolLeft === expectManual,
    'poolLeft ' + before.poolLeft + ' -> ' + after.poolLeft);
  check('the run says why it placed fewer than it saw',
    /physiotherapy/i.test(String(after.reason || '')), String(after.reason || '(no reason given)'));
  check('a dry run wrote nothing',
    (await pool.query(`SELECT count(*)::int n FROM leads WHERE meta_lead_id LIKE $1 AND coalesce(btrim(assigned_to),'') <> ''`, [PREFIX + '%'])).rows[0].n === 0);
} finally {
  const { rowCount } = await pool.query(`DELETE FROM leads WHERE meta_lead_id LIKE $1`, [PREFIX + '%']);
  console.log('\ncleaned up ' + rowCount + ' temporary lead(s)');
  console.log(pass + ' passed, ' + fail + ' failed\n');
  await pool.end();
  process.exit(fail ? 1 : 0);
}
