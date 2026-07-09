-- ============================================================
-- WellnessOS — Zoom / online consultation recordings
-- Additive and safe to re-run. Keyed by leads.meta_lead_id (TEXT).
-- Distinct from the on-disk office_recordings audio table.
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
