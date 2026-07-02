-- ============================================================
-- WellnessOS — Reception payments: transaction ref + proof attachment
-- Run in Supabase SQL Editor. Additive and safe to re-run.
-- Lets the Collect-payment step persist the txn reference and the uploaded
-- payment proof (file in the lead-files bucket) alongside the amount/method.
-- ============================================================

ALTER TABLE payments ADD COLUMN IF NOT EXISTS txn_ref    TEXT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS proof_url  TEXT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS proof_name TEXT;
