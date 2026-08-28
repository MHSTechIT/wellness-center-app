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
    // Smartflo's originate reference for a click-to-call. The provider returns ref_id (never a
    // call_id) when the call is queued, and /v1/call/hangup accepts it — so this is what lets the
    // app's own End Call button drop a live call, including after a page reload. Added
    // 28-Aug-2026; NULL on every historical row, which is correct — those calls are long over.
    name: 'call_recordings.provider_ref_id',
    sql: `ALTER TABLE call_recordings ADD COLUMN IF NOT EXISTS provider_ref_id TEXT`,
  },
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
  {
    // Physiotherapy payout ledger — Accounts & finance -> Physiotherapy tab. Same shape and the same
    // reasoning as thyrocare_payouts above: real transfers to the physio provider/team, reconciled
    // against a liability the tab computes LIVE from appointment data so the two cannot drift.
    // Created with every column present (the Thyrocare table predates covers_days/status/settled_at
    // and needed three ALTERs to catch up) — a new table has no legacy rows to protect.
    name: 'physio_payouts',
    sql: `CREATE TABLE IF NOT EXISTS physio_payouts (
      id          BIGSERIAL PRIMARY KEY,
      amount      INT NOT NULL CHECK (amount > 0),
      paid_at     DATE NOT NULL,
      method      TEXT,
      txn_ref     TEXT,
      notes       TEXT,
      covers_days TEXT,
      status      TEXT,
      settled_at  TIMESTAMPTZ,
      created_by  TEXT,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
    )`,
  },
  {
    name: 'physio_payouts.paid_at index',
    sql: `CREATE INDEX IF NOT EXISTS idx_physio_payouts_paid_at ON physio_payouts(paid_at)`,
  },
  {
    // DIRECT UPLOAD IN DP — the audit trail for every bulk lead update. One row per uploaded file.
    // Kept because a bulk update is the one operation that can change hundreds of records at once:
    // without a record of who ran what, an unexpected value weeks later is unanswerable.
    name: 'lead_import_batches',
    sql: `CREATE TABLE IF NOT EXISTS lead_import_batches (
      id             BIGSERIAL PRIMARY KEY,
      file_name      TEXT,
      uploaded_by    TEXT,
      uploaded_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
      lead_date_mode TEXT,
      total_rows     INT DEFAULT 0,
      matched        INT DEFAULT 0,
      updated_rows   INT DEFAULT 0,
      not_found      INT DEFAULT 0,
      ambiguous      INT DEFAULT 0,
      duplicate_rows INT DEFAULT 0,
      invalid_rows   INT DEFAULT 0,
      summary        JSONB
    )`,
  },
  {
    // Field-level old -> new for each batch. The preview shows this before anything is written; this
    // table is the same information kept afterwards, so a change can always be traced to its upload.
    name: 'lead_import_changes',
    sql: `CREATE TABLE IF NOT EXISTS lead_import_changes (
      id        BIGSERIAL PRIMARY KEY,
      batch_id  BIGINT,
      lead_id   TEXT,
      lead_name TEXT,
      field     TEXT,
      old_value TEXT,
      new_value TEXT
    )`,
  },
  {
    name: 'lead_import_changes.batch index',
    sql: `CREATE INDEX IF NOT EXISTS idx_lead_import_changes_batch ON lead_import_changes(batch_id)`,
  },
  {
    // AUTO-ASSIGNMENT ON/OFF, per DAY. One row per calendar day (IST) rather than a single flag,
    // because the requirement is date-based: a Super Admin stops it for today, or arms it for
    // tomorrow, and those two decisions must not overwrite each other.
    //
    // The engine reads the most recent row on or BEFORE today, so a setting persists forward until
    // something later changes it — set it once and it holds, and a row dated tomorrow cannot affect
    // today. No row at all means ON, which preserves the behaviour that existed before this switch.
    name: 'auto_assign_control',
    sql: `CREATE TABLE IF NOT EXISTS auto_assign_control (
      day        DATE PRIMARY KEY,
      enabled    BOOLEAN NOT NULL,
      updated_by TEXT,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`,
  },
  {
    // Per-advisor DAILY LEAD ALLOCATION — Settings -> Advisor targets -> Advisor Leads Count Setting.
    // How many pooled leads the auto-assigner may hand this advisor in one day.
    //
    // Deliberately NOT one row per day. The count of what an advisor has already received today is
    // DERIVED from leads.assigned_at, so "the daily reset" is not an event anybody has to run — a new
    // IST day simply matches no rows and the full allocation is available again. A stored counter
    // would need a cron to zero it, and would drift the first time a lead was reassigned or deleted.
    // advisor is the assignees.name the rest of the app already assigns by (leads.assigned_to).
    // PERCENTAGE allocation per SERVICE TEAM (28-Aug-2026). Replaces the fixed daily number as the
    // thing auto-assignment reads: Meta delivers an unpredictable number of leads through the day,
    // so a per-advisor COUNT can only ever be a guess, while a RATIO holds whatever the day brings.
    //
    // service = '' is the DEFAULT team, used for any service that has no team of its own — which is
    // what lets one configuration keep covering every line. A row per (service, advisor); the
    // percentages within a service are expected to total 100, and the engine normalises if they do
    // not rather than refusing to place leads.
    //
    // advisor_lead_targets is deliberately LEFT IN PLACE, not dropped: it is the rollback path, and
    // the backfill below reads it once to carry the existing split over.
    // TEAM TARGET SHEET (28-Aug-2026). One row per month holding the figures the whole plan is
    // derived from, replacing a per-advisor table of hand-typed counts: an admin sets the team's
    // revenue, lead volume and funnel rates once, and every person's numbers fall out of their
    // percentage of it. Rates are stored as percentages (30 means 30%), the way they are entered.
    name: 'team_targets',
    sql: `CREATE TABLE IF NOT EXISTS team_targets (
      period         TEXT PRIMARY KEY,
      revenue        NUMERIC(14,2) NOT NULL DEFAULT 0,
      enrollment     NUMERIC(10,2) NOT NULL DEFAULT 0,
      leads          NUMERIC(10,2) NOT NULL DEFAULT 0,
      spent          NUMERIC(14,2) NOT NULL DEFAULT 0,
      lead_to_app    NUMERIC(6,3) NOT NULL DEFAULT 0,
      lead_to_conv   NUMERIC(6,3) NOT NULL DEFAULT 0,
      lead_to_visit  NUMERIC(6,3) NOT NULL DEFAULT 0,
      app_to_visit   NUMERIC(6,3) NOT NULL DEFAULT 0,
      updated_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_by     TEXT
    )`,
  },
  {
    // Each person's PERCENTAGES for a month, per team. JSONB rather than a column per metric: the
    // advisor sheet and the coach sheet track different things (appointments vs consultations) and
    // the list is expected to grow, so the shape belongs to the UI that defines it. Counts are never
    // stored — they are derived from these percentages and the team row, so the two can never drift.
    name: 'member_targets',
    sql: `CREATE TABLE IF NOT EXISTS member_targets (
      period     TEXT NOT NULL,
      team       TEXT NOT NULL,
      person     TEXT NOT NULL,
      pcts       JSONB NOT NULL DEFAULT '{}'::jsonb,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_by TEXT,
      PRIMARY KEY (period, team, person)
    )`,
  },
  {
    name: 'advisor_alloc',
    sql: `CREATE TABLE IF NOT EXISTS advisor_alloc (
      service    TEXT NOT NULL DEFAULT '',
      advisor    TEXT NOT NULL,
      pct        NUMERIC(7,3) NOT NULL DEFAULT 0 CHECK (pct >= 0 AND pct <= 100),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_by TEXT,
      PRIMARY KEY (service, advisor)
    )`,
  },
  {
    name: 'advisor_lead_targets',
    sql: `CREATE TABLE IF NOT EXISTS advisor_lead_targets (
      advisor      TEXT PRIMARY KEY,
      daily_target INT NOT NULL DEFAULT 0 CHECK (daily_target >= 0),
      updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_by   TEXT
    )`,
  },
  {
    // The auto-assigner reads "who did this lead go to, and when" for today across the whole book.
    name: 'leads.assigned_at index',
    sql: `CREATE INDEX IF NOT EXISTS idx_leads_assigned_at ON leads(assigned_at) WHERE assigned_at IS NOT NULL`,
  },
  {
    // Which workflow captured an office recording. NULL means the Health Coach office visit — every
    // row that existed before physiotherapy consultations could be recorded, and treating NULL as
    // 'office' is what lets those rows keep their meaning without a backfill.
    name: 'office_recordings.kind',
    sql: `ALTER TABLE office_recordings ADD COLUMN IF NOT EXISTS kind TEXT`,
  },
  {
    // A physio recording belongs to ONE session, not just to the patient: the same lead is recorded
    // again at every visit of a multi-session course, so lead_id alone cannot tell session 2 from
    // session 5. Coach rows leave this null — an office visit has no appointment of its own here.
    name: 'office_recordings.appointment_id',
    sql: `ALTER TABLE office_recordings ADD COLUMN IF NOT EXISTS appointment_id TEXT`,
  },
  {
    // Per-advisor targets (Advisor Dashboard PRD §8.2, §9.1, §9.4). One row per advisor per
    // period, `period` being 'YYYY-MM'. Targets do NOT roll over: each month is set explicitly,
    // so a missed month never silently inflates the next one's target. An advisor with no row
    // falls back to org-wide defaults, which is why the dashboard works before any row exists.
    // Moved here from db/migration-advisor-targets.sql — a hand-run file is exactly what left
    // leads.confirmed_at applied to dev and never to production.
    name: 'advisor_targets',
    sql: `CREATE TABLE IF NOT EXISTS advisor_targets (
      id                   BIGSERIAL PRIMARY KEY,
      advisor              TEXT NOT NULL,
      period               TEXT NOT NULL,
      revenue_target       NUMERIC(12,2) NOT NULL DEFAULT 0,
      enrollment_target    INT           NOT NULL DEFAULT 0,
      expected_appt_direct INT,
      expected_appt_zoom   INT,
      expected_confirmed   INT,
      expected_visited     INT,
      expected_enrolled    INT,
      created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
      UNIQUE (advisor, period)
    )`,
  },
  {
    // ALTER, not just CREATE: a database that already ran the original .sql has the table but
    // not this column, and CREATE TABLE IF NOT EXISTS is a no-op there.
    name: 'advisor_targets.crm_usage_target_hours',
    sql: `ALTER TABLE advisor_targets ADD COLUMN IF NOT EXISTS crm_usage_target_hours NUMERIC(5,2) DEFAULT 8`,
  },
  {
    name: 'advisor_targets.period index',
    sql: `CREATE INDEX IF NOT EXISTS idx_advisor_targets_period ON advisor_targets(period)`,
  },
  {
    name: 'advisor_targets.advisor index',
    sql: `CREATE INDEX IF NOT EXISTS idx_advisor_targets_advisor ON advisor_targets(advisor, period)`,
  },

  // ---- Direct Upload in DP: the six template columns that had no home ----
  // The template asks for HC assigned, Duration of diabetes, Program suggested, Payment method and
  // the two prices. Every one of them lived ONLY inside a positional JSONB profile (coach_profile.f
  // restored by array index from the live DOM order) — a shape the server cannot write into without
  // hardcoding an index that the next form change silently shifts. So each gets a real column: the
  // database stays the single source of truth, the importer writes plain SQL, and the panels read
  // the column when their profile has nothing to say. Additive and nullable — every existing row and
  // every existing save path is unaffected.
  {
    name: 'leads.hc_assigned',
    // The Health Coach as STATED for the lead. appointments.hc_pt remains the live, per-visit coach
    // and still wins wherever a booking exists; this is what an imported lead carries before one does.
    sql: `ALTER TABLE leads ADD COLUMN IF NOT EXISTS hc_assigned TEXT`,
  },
  {
    name: 'leads.diabetes_duration',
    sql: `ALTER TABLE leads ADD COLUMN IF NOT EXISTS diabetes_duration TEXT`,
  },
  {
    name: 'leads.program_suggested',
    sql: `ALTER TABLE leads ADD COLUMN IF NOT EXISTS program_suggested TEXT`,
  },
  {
    // TEXT, not numeric: the form's own options are labels ("Special Offer", "3,999 (Standard)"),
    // and coercing them to a number would throw away the half that is not a price.
    name: 'leads.l1_price',
    sql: `ALTER TABLE leads ADD COLUMN IF NOT EXISTS l1_price TEXT`,
  },
  {
    name: 'leads.l2_price',
    sql: `ALTER TABLE leads ADD COLUMN IF NOT EXISTS l2_price TEXT`,
  },
  {
    // The INTENDED method. Money actually collected still lives in payments.method — nothing here
    // creates a payment row, so no import can ever manufacture revenue.
    name: 'leads.payment_method',
    sql: `ALTER TABLE leads ADD COLUMN IF NOT EXISTS payment_method TEXT`,
  },

  // ---- User Login & Activity (PRD §21) ----
  // One row per SESSION, never one per user: a person logs in and out several times a day and each
  // of those is a separate fact (§9). app_users stays the single source of truth for who people are
  // — this table only records when they were here, keyed by their email because that is what the
  // signed session token carries and what app_users is looked up by everywhere else.
  {
    name: 'user_sessions',
    sql: `CREATE TABLE IF NOT EXISTS user_sessions (
      id               BIGSERIAL PRIMARY KEY,
      user_email       TEXT NOT NULL,
      user_name        TEXT,
      user_role        TEXT,
      login_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
      logout_at        TIMESTAMPTZ,
      last_activity_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      status           TEXT NOT NULL DEFAULT 'online',
      device           TEXT,
      browser          TEXT,
      ip_address       TEXT,
      created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
    )`,
  },
  {
    // The dashboard's every query is "sessions for a day", newest first.
    name: 'user_sessions.login_at index',
    sql: `CREATE INDEX IF NOT EXISTS idx_user_sessions_login_at ON user_sessions(login_at DESC)`,
  },
  {
    name: 'user_sessions.user index',
    sql: `CREATE INDEX IF NOT EXISTS idx_user_sessions_user ON user_sessions(lower(user_email), login_at DESC)`,
  },
  {
    // Finding the row a heartbeat or logout belongs to: this user's still-open session.
    name: 'user_sessions.open index',
    sql: `CREATE INDEX IF NOT EXISTS idx_user_sessions_open ON user_sessions(lower(user_email)) WHERE logout_at IS NULL`,
  },
  {
    // A BDM approval must RECORD the level it grants, wherever it happens. The client-side fix
    // writes leads.program_suggested at approval time — but any tab still running an older build
    // approves without it, and the lead then reads "Enrolled – L1" whatever the request said
    // (recurred 22-Aug-2026 with three pending L1 + L2 requests). This trigger closes it at the
    // DATABASE: the moment a bdm_requests row lands approved, the lead's program_suggested is
    // stamped from the request — only when the lead doesn't already carry one, so the new build's
    // own write (and any hand-set value) is never overwritten. Idempotent by construction.
    name: 'trigger bdm approval stamps program level',
    sql: `
      CREATE OR REPLACE FUNCTION bdm_approval_stamps_level() RETURNS trigger AS $fn$
      BEGIN
        IF NEW.status = 'approved'
           AND COALESCE(NEW.kind, 'enrollment') = 'enrollment'
           AND NEW.program IS NOT NULL AND btrim(NEW.program) <> ''
           AND NEW.program <> 'Assessment edit' THEN
          UPDATE leads SET program_suggested = NEW.program
           WHERE meta_lead_id = NEW.lead_id
             AND (program_suggested IS NULL OR btrim(program_suggested) = '');
        END IF;
        RETURN NEW;
      END $fn$ LANGUAGE plpgsql;
      DROP TRIGGER IF EXISTS trg_bdm_approval_level ON bdm_requests;
      CREATE TRIGGER trg_bdm_approval_level
        AFTER INSERT OR UPDATE OF status ON bdm_requests
        FOR EACH ROW EXECUTE FUNCTION bdm_approval_stamps_level()`,
  },
];

// ---------------------------------------------------------------------------
// Whole tables owned by the app. CREATE TABLE IF NOT EXISTS obeys the same
// additive/idempotent contract as the column steps above.
// ---------------------------------------------------------------------------
const TABLES: Step[] = [
  {
    // BDM requisitions: the Health Coach freezes the deal (consultation + program + payment terms)
    // into ONE row and hands it to the BDM. `snapshot` is a JSONB copy of what the coach saw at
    // request time — deliberately a snapshot, not live joins, so the BDM approves what was actually
    // proposed even if the profile is edited afterwards. Status: pending → approved | returned.
    // Approval is what enrols the client (leads.enrolled_at via the shared writer), so Coach,
    // Advisor and Reception all read the same fact and nobody updates a status by hand.
    name: 'bdm_requests table',
    sql: `CREATE TABLE IF NOT EXISTS bdm_requests (
            id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
            lead_id TEXT NOT NULL,
            client_name TEXT,
            program TEXT,
            snapshot JSONB,
            status TEXT NOT NULL DEFAULT 'pending',
            requested_by TEXT,
            requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            decided_by TEXT,
            decided_at TIMESTAMPTZ,
            return_reason TEXT
          )`,
  },
  {
    // Two kinds of request now share this queue. 'enrollment' is the original deal approval (which
    // enrols the client); 'assessment_edit' asks the BDM to reopen a SAVED health assessment so the
    // coach can correct it — approval unlocks editing and enrols nobody. Existing rows default to
    // 'enrollment', so the column is purely additive and the old flow is untouched.
    name: 'bdm_requests.kind',
    sql: `ALTER TABLE bdm_requests ADD COLUMN IF NOT EXISTS kind TEXT NOT NULL DEFAULT 'enrollment'`,
  },
  {
    name: 'bdm_requests lead index',
    sql: `CREATE INDEX IF NOT EXISTS idx_bdm_requests_lead ON bdm_requests(lead_id)`,
  },
  {
    name: 'bdm_requests status index',
    sql: `CREATE INDEX IF NOT EXISTS idx_bdm_requests_status ON bdm_requests(status)`,
  },
];

// ---------------------------------------------------------------------------
// One-off data repairs. Stricter rules than the DDL above: each must be
// idempotent, must only ever fill in something MISSING, and must never change a
// value that is already set. After the first successful run these match no rows.
// ---------------------------------------------------------------------------
const BACKFILLS: Step[] = [
  {
    // Carry the existing fixed daily targets over as percentages, ONCE, so switching to ratio
    // allocation does not silently stop auto-assignment while somebody reconfigures it by hand.
    // 5 / 4 / 13 / 14 (36 a day) becomes 13.889 / 11.111 / 36.111 / 38.889 of whatever arrives —
    // the same split, expressed as a ratio instead of a count.
    //
    // Into service '' (the DEFAULT team) rather than a named service: the old targets were never
    // service-scoped, so every line keeps being served exactly as it is today until an admin adds
    // a team for one. Guarded by NOT EXISTS over the whole table, so it runs only while the new
    // allocation is still empty — it can never overwrite a configuration somebody has since saved.
    name: 'advisor_alloc from daily targets',
    sql: `
      INSERT INTO advisor_alloc (service, advisor, pct, updated_by)
      SELECT '', t.advisor,
             round(100.0 * t.daily_target::numeric / s.total, 3),
             'carried over from daily targets'
        FROM advisor_lead_targets t
        CROSS JOIN (SELECT sum(daily_target)::numeric AS total
                      FROM advisor_lead_targets WHERE daily_target > 0) s
       WHERE t.daily_target > 0
         AND s.total > 0
         AND NOT EXISTS (SELECT 1 FROM advisor_alloc)
      ON CONFLICT (service, advisor) DO NOTHING
    `,
  },
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
  // Tables first — a column step or backfill may target a table created in this same pass.
  for (const step of TABLES.concat(STEPS)) {
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
  const total = TABLES.length + STEPS.length + BACKFILLS.length;
  if (failed) console.error(`[schema] ${db}: ${applied}/${total} ok, ${failed} FAILED — see above`);
  else console.log(`[schema] ${db}: up to date (${total} checks${repaired ? `, ${repaired} row(s) repaired` : ''})`);
}
