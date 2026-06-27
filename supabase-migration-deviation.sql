-- ============================================================
-- WellnessOS — Deviation tracking
-- Run in Supabase SQL Editor. Additive and safe to re-run.
-- Records WHEN a lead was assigned, so the Leads Deviation page can flag leads
-- that haven't been called within 4 hours of assignment.
-- ============================================================

ALTER TABLE leads ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMPTZ;
