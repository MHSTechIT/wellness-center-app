// Run a .sql migration against the database in server/.env.
//
// There is no psql on the deploy machines and no ORM in this project, so this is THE way to apply
// anything in db/*.sql. Lives under server/ so `pg` and the .env resolve without any extra config.
//
//   node server/scripts/run-migration.mjs db/migration-user-multi-role.sql
//   npm run migrate -- db/migration-user-multi-role.sql
//
// Against production, point it at that database for the one command:
//   PGHOST=prod-host PGDATABASE=prod-db PGUSER=... PGPASSWORD=... node server/scripts/run-migration.mjs db/xxx.sql
//
// The whole file runs in ONE transaction: if any statement fails, everything rolls back and the
// database is left exactly as it was. The project's migrations are all written to be re-runnable
// (CREATE TABLE IF NOT EXISTS / ADD COLUMN IF NOT EXISTS / ON CONFLICT DO NOTHING), so running one
// twice is safe. Use --no-transaction for the rare statement Postgres forbids inside one
// (e.g. CREATE INDEX CONCURRENTLY).
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SERVER_DIR = path.resolve(HERE, '..');
const REPO_DIR = path.resolve(SERVER_DIR, '..');

// Load server/.env WITHOUT overwriting anything already exported, so the PGHOST=... prefix form
// above wins over the local file and can target another database for a single run.
function loadEnv() {
  const f = path.join(SERVER_DIR, '.env');
  if (!fs.existsSync(f)) return;
  for (const line of fs.readFileSync(f, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/);
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].trim();
  }
}

async function main() {
  const args = process.argv.slice(2).filter((a) => a !== '--');
  const noTx = args.includes('--no-transaction');
  const rel = args.find((a) => !a.startsWith('--'));
  if (!rel) {
    console.error('Usage: node server/scripts/run-migration.mjs <file.sql> [--no-transaction]');
    process.exit(2);
  }
  const file = path.isAbsolute(rel) ? rel : path.join(REPO_DIR, rel);
  if (!fs.existsSync(file)) { console.error('✖ No such file: ' + file); process.exit(2); }

  loadEnv();
  const sql = fs.readFileSync(file, 'utf8');
  const pool = new pg.Pool({
    host: process.env.PGHOST,
    port: Number(process.env.PGPORT || 5432),
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE,
    ssl: process.env.PGSSL === 'false' ? false : { rejectUnauthorized: false },
    max: 2,
  });

  // Say WHICH database is about to change — the #1 way this goes wrong is running it on the wrong one.
  console.log('Database : ' + (process.env.PGDATABASE || '?') + ' @ ' + (process.env.PGHOST || '?'));
  console.log('Migration: ' + path.relative(REPO_DIR, file));
  console.log(noTx ? 'Mode     : no transaction' : 'Mode     : single transaction (rolls back on any error)');

  const client = await pool.connect();
  try {
    if (!noTx) await client.query('BEGIN');
    await client.query(sql);
    if (!noTx) await client.query('COMMIT');
    console.log('\n✅ Applied successfully.');
  } catch (e) {
    if (!noTx) { try { await client.query('ROLLBACK'); } catch { /* connection already gone */ } }
    console.error('\n❌ FAILED — ' + e.message);
    if (!noTx) console.error('   Rolled back; the database is unchanged.');
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

main();
