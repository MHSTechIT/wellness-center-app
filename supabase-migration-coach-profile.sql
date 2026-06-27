-- ============================================================
-- WellnessOS — Health Coach consultation record + Visited flag
-- Run in Supabase SQL Editor. Additive and safe to re-run.
--  coach_profile : the whole "Save health record" form (JSON, per lead)
--  visited_at    : set when the Advisor marks a lead "Visited" — drives the
--                  Health Coach's eligible-client list.
-- ============================================================

ALTER TABLE leads ADD COLUMN IF NOT EXISTS coach_profile JSONB;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS visited_at TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS idx_leads_visited ON leads(visited_at);
