-- ============================================================
-- WellnessOS — Enrollment timestamp
-- PostgreSQL migration (target DB: PGDATABASE, e.g. Wellness_Center_App).
-- Set automatically when a lead is marked Enrolled (Health Coach → call_status
-- = 'Enrolled'). Drives the Advisor page's Enrolled status + Enrolled Date & Time.
-- Additive and safe to re-run.
-- ============================================================
ALTER TABLE leads ADD COLUMN IF NOT EXISTS enrolled_at TIMESTAMPTZ;

-- Backfill: stamp already-enrolled leads that have no enrollment time yet.
UPDATE leads SET enrolled_at = COALESCE(enrolled_at, visited_at, created_at, now())
WHERE call_status = 'Enrolled' AND enrolled_at IS NULL;
