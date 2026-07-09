-- ============================================================
-- WellnessOS — Zoom / online consultation recordings
-- PostgreSQL migration (target DB: PGDATABASE, e.g. Wellness_Center_App).
-- NOT Supabase. Apply with: psql "<conn>" -f db/migration-zoom-recordings.sql
-- (also included in db/schema.sql). Additive and safe to re-run.
-- Keyed by leads.meta_lead_id (TEXT). The Zoom link is a plain URL stored in
-- this table — no Supabase Storage, no Supabase tables.
-- ============================================================
CREATE TABLE IF NOT EXISTS zoom_recordings (
  id               BIGSERIAL PRIMARY KEY,
  lead_id          TEXT NOT NULL,   -- meta_lead_id of the customer
  customer_name    TEXT,
  meeting_url      TEXT,            -- Zoom (or other) recording link
  duration_seconds INT,
  status           TEXT,            -- 'Ready' once a link is present, else 'Pending'
  recorded_by      TEXT,
  meeting_at       TIMESTAMPTZ,     -- when the consultation happened
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_zoom_recordings_lead ON zoom_recordings(lead_id, created_at DESC);
