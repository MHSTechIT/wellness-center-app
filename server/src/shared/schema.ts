import { pool } from './db';

// ============================================================================
// SELF-APPLYING SCHEMA
//
// Every column this app needs is declared here and ensured on boot. There is no
// separate .sql file to remember, and no pgAdmin step: whichever database the
// server is pointed at gets brought up to date the moment it starts.
//
// This exists because the alternative already broke production. `leads.confirmed_at`
// shipped as a hand-run migration, was applied to dev and never to production, and
// the Admin Report rendered every figure as 0 for days — the query naming that
// column was rejected outright. Dev and production had drifted with nothing to
// detect it. A boot-time ensure makes that drift impossible: deploy the code and
// the schema follows.
//
// RULES for anything added to this list:
//   * ADDITIVE AND IDEMPOTENT ONLY — ADD COLUMN IF NOT EXISTS, CREATE INDEX IF NOT
//     EXISTS. Never DROP, never ALTER TYPE, never rewrite a row. It must be safe to
//     run on every boot, forever, against a database full of live data.
//   * Nullable, no NOT NULL, no DEFAULT that would rewrite an existing table.
//   * A failure is logged and the server still starts. A missing nice-to-have column
//     must never stop the API from serving; the one thing worse than a degraded
//     report is no server at all.
// ============================================================================

type Step = { name: string; sql: string };

const STEPS: Step[] = [
  {
    // The advisor's manual "Confirmed" milestone (Open → Confirm → Visited). Set only by
    // the Confirm button; NULL means not confirmed, which is correct for every existing row.
    name: 'leads.confirmed_at',
    sql: `ALTER TABLE leads ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMPTZ`,
  },
  {
    name: 'leads.confirmed_at index',
    sql: `CREATE INDEX IF NOT EXISTS idx_leads_confirmed_at ON leads(confirmed_at) WHERE confirmed_at IS NOT NULL`,
  },
  {
    // Meta's adset behind a lead. campaign and ad_name were already stored; without the adset the
    // Campaign Tracker cannot roll up by adset and has to invent a key, which doubles every row.
    name: 'leads.adset_name',
    sql: `ALTER TABLE leads ADD COLUMN IF NOT EXISTS adset_name TEXT`,
  },
  {
    // Which reconciliation DAYS a Thyrocare payout settles, as a comma-separated list of YYYY-MM-DD
    // keys. Without it a payout is just an amount, and nothing stops the same day being sent for
    // payment twice — the ledger would still balance on totals while double-paying the lab.
    name: 'thyrocare_payouts.covers_days',
    sql: `ALTER TABLE thyrocare_payouts ADD COLUMN IF NOT EXISTS covers_days TEXT`,
  },
  {
    // A payout is now RAISED first (from reconciliation) and paid later, so it needs a state.
    // NULL means "paid" — rows created by the old manual form recorded money already sent, and
    // silently re-opening them would make the balance claim we still owe money we have paid.
    name: 'thyrocare_payouts.status',
    sql: `ALTER TABLE thyrocare_payouts ADD COLUMN IF NOT EXISTS status TEXT`,
  },
  {
    name: 'thyrocare_payouts.settled_at',
    sql: `ALTER TABLE thyrocare_payouts ADD COLUMN IF NOT EXISTS settled_at TIMESTAMPTZ`,
  },
  {
    // When a refund's money actually left. refund_processed_at records the CONFIRMATION;
    // this records the PAYOUT, so Accounts can tell "approved" from "actually sent".
    name: 'payments.refund_paid_at',
    sql: `ALTER TABLE payments ADD COLUMN IF NOT EXISTS refund_paid_at TIMESTAMPTZ`,
  },
  {
    name: 'payments.refund_paid_at index',
    sql: `CREATE INDEX IF NOT EXISTS idx_payments_refund_paid_at ON payments(refund_paid_at) WHERE refund_paid_at IS NOT NULL`,
  },
  {
    // Thyrocare payout ledger — Accounts & finance -> Blood test - Thyrocare tab. Real money
    // transfers to the lab partner; reconciled against the liability that tab computes LIVE from
    // appointment data (never stored here), so the two figures can never drift apart.
    name: 'thyrocare_payouts',
    sql: `CREATE TABLE IF NOT EXISTS thyrocare_payouts (
      id          BIGSERIAL PRIMARY KEY,
      amount      INT NOT NULL CHECK (amount > 0),
      paid_at     DATE NOT NULL,
      method      TEXT,
      txn_ref     TEXT,
      notes       TEXT,
      created_by  TEXT,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
    )`,
  },
  {
    name: 'thyrocare_payouts.paid_at index',
    sql: `CREATE INDEX IF NOT EXISTS idx_thyrocare_payouts_paid_at ON thyrocare_payouts(paid_at)`,
  },
];

// ---------------------------------------------------------------------------
// One-off data repairs. Stricter rules than the DDL above: each must be
// idempotent, must only ever fill in something MISSING, and must never change a
// value that is already set. After the first successful run these match no rows.
// ---------------------------------------------------------------------------
const BACKFILLS: Step[] = [
  {
    // The advisor's Sugar level lived only inside advisor_profile, while leads.sugar_poll kept the
    // raw Meta poll answer — so a level the advisor CORRECTED on the call never reached the filter,
    // the dashboards or the Coach. Confirmed live: three leads read "150-250" in sugar_poll while
    // their profiles said "No Sugar", "No Sugar" and "150–250"; the Sugar 150-250 filter therefore
    // returned 3 where only 1 belonged.
    //
    // The profile is a POSITIONAL array, so this does not trust an index: it scans for the first
    // entry whose value is exactly one of the three dropdown labels. If the form ever changes shape
    // the scan simply finds nothing and no row is touched — it can never write a wrong field.
    // Only rows that actually disagree are updated, so this is a no-op from the second run on.
    name: 'leads.sugar_poll from advisor profile',
    sql: `
      UPDATE leads l
         SET sugar_poll = v.val
        FROM (
          SELECT x.meta_lead_id, e.val
            FROM (SELECT meta_lead_id, advisor_profile->'f' AS f
                    FROM leads
                   WHERE advisor_profile ? 'f'
                     AND jsonb_typeof(advisor_profile->'f') = 'array') x
            CROSS JOIN LATERAL (
              SELECT elem->>'v' AS val
                FROM jsonb_array_elements(x.f) WITH ORDINALITY AS t(elem, ord)
               WHERE elem->>'v' IN ('No Sugar', '150-250', '150–250', 'Above 250')
               ORDER BY t.ord
               LIMIT 1
            ) e
        ) v
       WHERE l.meta_lead_id = v.meta_lead_id
         AND coalesce(l.sugar_poll, '') IS DISTINCT FROM v.val`,
  },
  {
    // Refunds settled before refund_paid_at existed have no payout date and would show a
    // permanent "—". Under the old model there was no separate payout stage: "processed" WAS
    // the terminal state, i.e. the refund was done. So for those rows the confirmation
    // timestamp is the best record of when the money went, and a dated ledger row beats a
    // blank one. Only NULLs are touched, so a real payout date is never overwritten.
    name: 'payments.refund_paid_at backfill',
    sql: `UPDATE payments SET refund_paid_at = refund_processed_at
           WHERE refund_status = 'paid' AND refund_paid_at IS NULL AND refund_processed_at IS NOT NULL`,
  },
];

export async function ensureSchema(): Promise<void> {
  let applied = 0;
  let failed = 0;
  for (const step of STEPS) {
    try {
      // IF NOT EXISTS means this is a no-op on an up-to-date database, so the cost of
      // running the whole list on every boot is a handful of catalogue lookups.
      await pool.query(step.sql);
      applied++;
    } catch (e: any) {
      failed++;
      console.error(`[schema] ${step.name} FAILED: ${e?.message || e}`);
    }
  }
  // Backfills run AFTER the DDL, so a column added moments ago can be filled in the same boot.
  let repaired = 0;
  for (const step of BACKFILLS) {
    try {
      const res = await pool.query(step.sql);
      if (res.rowCount) {
        repaired += res.rowCount;
        console.log(`[schema] ${step.name}: filled ${res.rowCount} row(s)`);
      }
    } catch (e: any) {
      failed++;
      console.error(`[schema] ${step.name} FAILED: ${e?.message || e}`);
    }
  }
  const db = process.env.PGDATABASE || '(default)';
  const total = STEPS.length + BACKFILLS.length;
  if (failed) console.error(`[schema] ${db}: ${applied}/${total} ok, ${failed} FAILED — see above`);
  else console.log(`[schema] ${db}: up to date (${total} checks${repaired ? `, ${repaired} row(s) repaired` : ''})`);
}
