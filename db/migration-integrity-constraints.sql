-- ============================================================
-- WellnessOS — Data integrity constraints
-- PostgreSQL migration (target DB: PGDATABASE, e.g. Wellness_Center_App).
--
-- The QA/security audit found ZERO CHECK constraints and exactly ONE foreign
-- key in the entire database — nothing stopped a duplicate payment row, a
-- NULL amount, or an orphaned reference from being written, other than
-- application code remembering to check first (and it didn't always).
-- Every statement below was verified against live data beforehand and
-- checked clean (see the session notes); each is additive and idempotent —
-- safe to re-run.
--
-- NOT included here: a foreign key from appointments.lead_id -> leads.meta_
-- lead_id. Two appointment rows (ids 5 and 7, source='test') reference a
-- lead_id ('paytest-001'/'paytest-002') that no longer exists in `leads` —
-- confirmed leftover test data from earlier development, not real patient
-- records. Delete or reassign those two rows first, then add:
--   ALTER TABLE appointments ADD CONSTRAINT fk_appointments_lead
--     FOREIGN KEY (lead_id) REFERENCES leads(meta_lead_id);
-- ============================================================

-- ---- payments: stop the exact duplicate-row bug class fixed this session
-- from being reintroduced. COALESCE guards NULL program/installment_number
-- so legacy rows are uniqueness-checked too, not silently exempted (a NULL
-- program was the root cause of a real duplicate-payment bug found earlier).
CREATE UNIQUE INDEX IF NOT EXISTS uq_payments_installment_slot
  ON payments (lead_id, COALESCE(program, ''), COALESCE(installment_number, 0))
  WHERE payment_type = 'installment';

-- ---- payments: required columns should never silently be empty.
ALTER TABLE payments ALTER COLUMN lead_id SET NOT NULL;
ALTER TABLE payments ALTER COLUMN amount SET NOT NULL;
ALTER TABLE payments ALTER COLUMN status SET NOT NULL;

-- ---- payments: value sanity — a negative or fabricated status was never
-- valid but nothing enforced it.
ALTER TABLE payments DROP CONSTRAINT IF EXISTS chk_payments_amount_nonneg;
ALTER TABLE payments ADD CONSTRAINT chk_payments_amount_nonneg CHECK (amount >= 0);
ALTER TABLE payments DROP CONSTRAINT IF EXISTS chk_payments_status;
ALTER TABLE payments ADD CONSTRAINT chk_payments_status CHECK (status IN ('paid', 'due'));

-- ---- appointments: required columns.
ALTER TABLE appointments ALTER COLUMN lead_id SET NOT NULL;
ALTER TABLE appointments ALTER COLUMN appt_date SET NOT NULL;

-- ---- leads.meta_lead_id: promote to a real UNIQUE constraint (not just an
-- index) and NOT NULL — required for it to be a valid foreign-key target.
-- The existing partial index (uq_leads_meta_lead_id) is left untouched.
ALTER TABLE leads ALTER COLUMN meta_lead_id SET NOT NULL;
ALTER TABLE leads DROP CONSTRAINT IF EXISTS uq_leads_meta_lead_id_full;
ALTER TABLE leads ADD CONSTRAINT uq_leads_meta_lead_id_full UNIQUE (meta_lead_id);

-- ---- foreign keys: a payment or appointment-link that points nowhere was
-- previously silent data corruption, not a rejected write.
-- RESTRICT (the default): a lead with payment history can't be deleted out
-- from under its own financial records — that must be a deliberate, explicit
-- step, not a side effect.
ALTER TABLE payments DROP CONSTRAINT IF EXISTS fk_payments_lead;
ALTER TABLE payments ADD CONSTRAINT fk_payments_lead
  FOREIGN KEY (lead_id) REFERENCES leads(meta_lead_id);

-- appointment_id is optional metadata on a payment (many rows are coach-
-- authored with lead_id only) — if the linked appointment is ever removed,
-- clear the reference rather than blocking the delete or losing the payment.
ALTER TABLE payments DROP CONSTRAINT IF EXISTS fk_payments_appointment;
ALTER TABLE payments ADD CONSTRAINT fk_payments_appointment
  FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE SET NULL;
