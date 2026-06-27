-- ============================================================
-- WellnessOS — Reception: Appointments + Payments
-- Run in Supabase SQL Editor. Additive and safe to re-run.
-- Appointments are created when the Advisor/Coach fixes an appointment, or via
-- the reception "New walk-in". Payments back the Revenue / Pay / Amount columns.
-- ============================================================

CREATE TABLE IF NOT EXISTS appointments (
  id BIGSERIAL PRIMARY KEY,
  lead_id     TEXT,                       -- leads.meta_lead_id
  client_name TEXT,
  phone       TEXT,
  service     TEXT,                        -- Diabetes / Blood test / Physio
  hc_pt       TEXT,                        -- Health Coach / Physiotherapist
  appt_date   DATE,
  appt_time   TEXT,
  status      TEXT DEFAULT 'expected',     -- expected / visited / noshow / rescheduled / cancelled
  visited_at  TEXT,
  stage       TEXT,                        -- screening / sample / report / session / enrolled / done …
  session     TEXT,                        -- e.g. "3/8" for physio
  source      TEXT,
  language    TEXT,
  notes       TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_appointments_lead ON appointments(lead_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appt_date);

CREATE TABLE IF NOT EXISTS payments (
  id BIGSERIAL PRIMARY KEY,
  appointment_id BIGINT,
  lead_id        TEXT,
  amount         INT DEFAULT 0,
  status         TEXT DEFAULT 'paid',      -- paid / due / free / prepaid / refunded
  method         TEXT,
  paid_at        TIMESTAMPTZ,
  created_at     TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_payments_appt ON payments(appointment_id);
CREATE INDEX IF NOT EXISTS idx_payments_lead ON payments(lead_id);

ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments     ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "pub read appts"   ON appointments;
DROP POLICY IF EXISTS "pub write appts"  ON appointments;
DROP POLICY IF EXISTS "pub upd appts"    ON appointments;
DROP POLICY IF EXISTS "pub read pays"    ON payments;
DROP POLICY IF EXISTS "pub write pays"   ON payments;
DROP POLICY IF EXISTS "pub upd pays"     ON payments;
CREATE POLICY "pub read appts"  ON appointments FOR SELECT USING (true);
CREATE POLICY "pub write appts" ON appointments FOR INSERT WITH CHECK (true);
CREATE POLICY "pub upd appts"   ON appointments FOR UPDATE USING (true);
CREATE POLICY "pub read pays"   ON payments FOR SELECT USING (true);
CREATE POLICY "pub write pays"  ON payments FOR INSERT WITH CHECK (true);
CREATE POLICY "pub upd pays"    ON payments FOR UPDATE USING (true);
