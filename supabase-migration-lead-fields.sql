-- ============================================================
-- WellnessOS — extra Meta lead-form fields for the Live Incoming Feed
-- Run in Supabase SQL Editor. Additive and safe to re-run.
-- Adds the columns captured from the lead form: ad name, sugar poll,
-- city, street/post-code. (name/phone/campaign/service/language already exist.)
-- ============================================================

ALTER TABLE leads ADD COLUMN IF NOT EXISTS ad_name    TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS sugar_poll TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS city       TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS street     TEXT;
