-- ============================================================
-- WellnessOS — Health Coach: persisted screening vitals
-- Run in Supabase SQL Editor. Additive and safe to re-run.
-- Stores the M0 baseline vitals captured at the screening desk so the Health
-- Coach screen can load them per client and they survive a refresh.
-- ============================================================

ALTER TABLE leads ADD COLUMN IF NOT EXISTS screening_vitals JSONB;
