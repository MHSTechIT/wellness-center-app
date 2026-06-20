-- ============================================================
-- FIX: replace the partial unique index with a full one so that
-- the Meta sync's UPSERT (ON CONFLICT (meta_lead_id)) works.
-- Run this once in Supabase → SQL Editor, then click "Sync from Meta".
-- ============================================================

DROP INDEX IF EXISTS uq_leads_meta_lead_id;
CREATE UNIQUE INDEX uq_leads_meta_lead_id ON leads(meta_lead_id);
