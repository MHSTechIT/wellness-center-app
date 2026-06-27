-- ============================================================
-- WellnessOS — Health Advisor lead profile persistence
-- Run in Supabase SQL Editor. Additive and safe to re-run.
-- Stores the full "Save lead record" form (Basic info, Sugar & medical,
-- Assignment, Call status, Visited, audits, remarks, etc.) as one JSON blob
-- per lead, so it survives refresh / reopen.
-- ============================================================

ALTER TABLE leads ADD COLUMN IF NOT EXISTS advisor_profile JSONB;
