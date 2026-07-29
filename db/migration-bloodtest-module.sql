-- ============================================================
-- WellnessOS — Blood Test Service module (FROZEN v2.0 spec, 29-Jul-2026)
-- PostgreSQL migration (target DB: PGDATABASE, e.g. Wellness_Center_App).
--
-- ADDITIVE ONLY. Creates four new bt_* tables and touches NOTHING that already
-- exists — no ALTER, no DROP, no data change on leads/appointments/payments. The
-- current Blood Test screen keeps reading appointments.blood_test_data exactly as
-- before, so the existing flow cannot break; the new module writes bt_orders
-- alongside it and links back via appointment_id / lead_id.
--
-- Reached through the SAME /db/query gateway the whole app uses (it is table-
-- agnostic), so no new backend endpoints are required.
--
-- Idempotent — every statement is IF NOT EXISTS / ON CONFLICT DO NOTHING.
-- ============================================================

-- ---- Test / panel master (FR-1.4, FR-1.5) ------------------------------------
-- retest_months carries the PANEL-SPECIFIC re-test cadence (FR-5A.1, NFR-5):
-- NULL = one-off screening panel with no automatic reminder cadence at all.
CREATE TABLE IF NOT EXISTS bt_tests (
  id            BIGSERIAL PRIMARY KEY,
  code          TEXT UNIQUE,
  name          TEXT NOT NULL,
  price         INTEGER NOT NULL DEFAULT 0,   -- client-facing price
  lab_cost      INTEGER NOT NULL DEFAULT 0,   -- what the lab partner charges us
  retest_months INTEGER,
  active        BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---- Lab partners (FR-2.6) --------------------------------------------------
-- Multiple concurrent partners, selectable per order; sla_hours lets turnaround
-- be reported per partner rather than assuming Thyrocare.
CREATE TABLE IF NOT EXISTS bt_lab_partners (
  id         BIGSERIAL PRIMARY KEY,
  name       TEXT UNIQUE NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  sla_hours  INTEGER,
  active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---- Coupons (FR-1.6) -------------------------------------------------------
-- Optional at the desk. Validity is date-bounded and use-capped so an expired or
-- exhausted code can be rejected with a specific reason, not a generic failure.
CREATE TABLE IF NOT EXISTS bt_coupons (
  id             BIGSERIAL PRIMARY KEY,
  code           TEXT UNIQUE NOT NULL,
  discount_type  TEXT NOT NULL DEFAULT 'flat',   -- 'flat' (rupees) | 'percent'
  discount_value INTEGER NOT NULL DEFAULT 0,
  valid_from     DATE,
  valid_to       DATE,
  max_uses       INTEGER,
  used_count     INTEGER NOT NULL DEFAULT 0,
  active         BOOLEAN NOT NULL DEFAULT TRUE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_bt_coupons_type CHECK (discount_type IN ('flat', 'percent'))
);

-- ---- Orders = the client-visit record (Section 4) ---------------------------
-- One row per visit. visit_no supports repeat testing without overwriting history
-- (FR-1.16, FR-5B.4), so a client's timeline is the ordered set of their rows.
-- calc_price AND amount_collected are both stored (FR-1.8) — the desk may collect
-- a negotiated or partial amount, and losing the calculated price would make the
-- difference unauditable.
CREATE TABLE IF NOT EXISTS bt_orders (
  id                 BIGSERIAL PRIMARY KEY,
  lead_id            TEXT,          -- links to leads.meta_lead_id when known
  appointment_id     BIGINT,        -- links to the existing appointments row when one exists
  client_name        TEXT,
  phone              TEXT,
  email              TEXT,
  whatsapp           TEXT,
  visit_no           INTEGER NOT NULL DEFAULT 1,
  tests              JSONB NOT NULL DEFAULT '[]'::jsonb,  -- [{id,code,name,price}]
  lab_partner        TEXT,
  calc_price         INTEGER NOT NULL DEFAULT 0,
  coupon_code        TEXT,
  discount           INTEGER NOT NULL DEFAULT 0,
  amount_collected   INTEGER NOT NULL DEFAULT 0,
  payment_mode       TEXT,
  payment_verified   BOOLEAN NOT NULL DEFAULT FALSE,   -- FR-1.10: Accounts flips this
  sample_id          TEXT,                              -- FR-1.13 barcode / collection ref
  sample_status      TEXT NOT NULL DEFAULT 'pending',   -- pending | collected | done
  report_status      TEXT NOT NULL DEFAULT 'pending',   -- pending | ready
  report_url         TEXT,
  shared_status      TEXT NOT NULL DEFAULT '',          -- '' | wa | printed | downloaded
  feedback_status    TEXT NOT NULL DEFAULT 'open',
  feedback_notes     TEXT,
  next_feedback_at   TIMESTAMPTZ,
  client_type        TEXT NOT NULL DEFAULT 'one-time',  -- one-time | membership
  next_due_date      DATE,                              -- FR-5A.1 / FR-5B.1
  reminder_stage     INTEGER NOT NULL DEFAULT 0,        -- FR-5B.2 auto-touch step reached
  deviation          BOOLEAN NOT NULL DEFAULT FALSE,    -- FR-5B.5 blood-test-specific queue
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by         TEXT,
  CONSTRAINT chk_bt_orders_sample CHECK (sample_status IN ('pending','collected','done')),
  CONSTRAINT chk_bt_orders_report CHECK (report_status IN ('pending','ready')),
  CONSTRAINT chk_bt_orders_ctype  CHECK (client_type IN ('one-time','membership')),
  CONSTRAINT chk_bt_orders_amounts CHECK (calc_price >= 0 AND amount_collected >= 0 AND discount >= 0)
);

-- Worklist and dashboard both filter by date, and the reminder sweep looks up due
-- rows; these keep both cheap as visit history accumulates.
CREATE INDEX IF NOT EXISTS idx_bt_orders_created  ON bt_orders (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bt_orders_lead     ON bt_orders (lead_id);
CREATE INDEX IF NOT EXISTS idx_bt_orders_phone    ON bt_orders (phone);
CREATE INDEX IF NOT EXISTS idx_bt_orders_due      ON bt_orders (next_due_date) WHERE next_due_date IS NOT NULL;

-- ---- Seed masters -----------------------------------------------------------
-- Starting values only; all of it is editable from Settings & masters later.
-- Cadences follow the spec's own examples (HbA1c ~3 months, general panel ~6-12).
INSERT INTO bt_tests (code, name, price, lab_cost, retest_months) VALUES
  ('HBA1C',   'HbA1c',                      600,  350, 3),
  ('FBS',     'Fasting Blood Sugar (FBS)',  150,   80, 3),
  ('PPBS',    'Postprandial Sugar (PPBS)',  150,   80, 3),
  ('LIPID',   'Lipid Profile',              900,  500, 6),
  ('THYROID', 'Thyroid Profile (T3/T4/TSH)',800,  450, 6),
  ('CBC',     'Complete Blood Count (CBC)', 400,  200, 6),
  ('LFT',     'Liver Function Test (LFT)',  800,  450, 12),
  ('KFT',     'Kidney Function Test (KFT)', 800,  450, 12),
  ('VITD',    'Vitamin D',                 1500,  900, 12),
  ('VITB12',  'Vitamin B12',               1200,  700, 12),
  ('FULLBODY','Full Body Health Panel',    2500, 1400, 12)
ON CONFLICT (code) DO NOTHING;

INSERT INTO bt_lab_partners (name, is_default, sla_hours) VALUES
  ('Thyrocare', TRUE, 24),
  ('Dr Lal PathLabs', FALSE, 48),
  ('In-house Lab', FALSE, 12)
ON CONFLICT (name) DO NOTHING;
