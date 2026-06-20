-- ============================================================
-- WellnessOS — Meta Sync Migration
-- Run this in Supabase SQL Editor AFTER supabase-schema.sql.
-- It is additive and safe to re-run.
-- ============================================================

-- 1. Add Meta-attribution columns to the leads table
ALTER TABLE leads ADD COLUMN IF NOT EXISTS meta_lead_id     TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS campaign_id      TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS ad_account_id    TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS ad_account_name  TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS form_name        TEXT;

-- meta_lead_id is the natural key from Meta — unique so we can UPSERT without dupes.
-- Must be a FULL (non-partial) unique index so `ON CONFLICT (meta_lead_id)` matches it.
-- (NULLs are treated as distinct, so non-Meta leads with NULL meta_lead_id are fine.)
DROP INDEX IF EXISTS uq_leads_meta_lead_id;
CREATE UNIQUE INDEX IF NOT EXISTS uq_leads_meta_lead_id ON leads(meta_lead_id);
CREATE INDEX IF NOT EXISTS idx_leads_ad_account ON leads(ad_account_id);
CREATE INDEX IF NOT EXISTS idx_leads_campaign ON leads(campaign_id);

-- 2. Remove the original sample/seed leads (they conflict with real Meta data).
DELETE FROM leads WHERE meta_lead_id IS NULL;

-- 3. Sync-state table — records each sync run so the dashboard can show "last synced".
CREATE TABLE IF NOT EXISTS meta_sync_state (
  id SERIAL PRIMARY KEY,
  started_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  finished_at  TIMESTAMPTZ,
  status       TEXT NOT NULL DEFAULT 'running',  -- running | success | error
  leads_synced INTEGER DEFAULT 0,
  forms_scanned INTEGER DEFAULT 0,
  campaigns_matched INTEGER DEFAULT 0,
  accounts_accessible TEXT,
  error        TEXT
);

ALTER TABLE meta_sync_state ENABLE ROW LEVEL SECURITY;
-- Drop-then-create so this migration is safe to re-run (Postgres has no
-- CREATE POLICY IF NOT EXISTS).
DROP POLICY IF EXISTS "Allow public read on meta_sync_state"   ON meta_sync_state;
DROP POLICY IF EXISTS "Allow public insert on meta_sync_state" ON meta_sync_state;
DROP POLICY IF EXISTS "Allow public update on meta_sync_state" ON meta_sync_state;
CREATE POLICY "Allow public read on meta_sync_state"   ON meta_sync_state FOR SELECT USING (true);
CREATE POLICY "Allow public insert on meta_sync_state" ON meta_sync_state FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on meta_sync_state" ON meta_sync_state FOR UPDATE USING (true);
