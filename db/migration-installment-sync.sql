-- ============================================================
-- WellnessOS — Installment payment sync (Reception ↔ Accounts)
-- PostgreSQL migration (target DB: PGDATABASE, e.g. Wellness_Center_App).
-- Additive + safe to re-run. Adds two columns to `payments`:
--   collected_by  — who took the payment (Reception desk / Health Coach / POS Machine …)
--   due_date      — the pending installment's due date (drives Reception "next due")
-- No existing column/behaviour is changed.
-- ============================================================
ALTER TABLE payments ADD COLUMN IF NOT EXISTS collected_by TEXT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS due_date DATE;
