-- ============================================================
-- WellnessOS — Assignment pool persistence
-- Run in Supabase SQL Editor. Additive and safe to re-run.
-- Marks leads that were "Sent to assignment" so the Unassigned Pool
-- survives page refreshes / new sessions.
-- ============================================================

ALTER TABLE leads ADD COLUMN IF NOT EXISTS in_pool       BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS pool_added_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_leads_in_pool ON leads(in_pool);
