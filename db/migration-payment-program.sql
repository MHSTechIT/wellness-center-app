-- ============================================================
-- WellnessOS — Payment program tag (L1 / L2 / L1 + L2)
-- PostgreSQL migration (target DB: PGDATABASE, e.g. Wellness_Center_App).
-- Lets a client enrolled in L1 later enroll in L2: payment locks are scoped per program,
-- so the L1 payment never blocks the L2 collection. Additive + safe to re-run.
-- Existing rows are treated as L1 (the first enrollment) by the app via COALESCE.
-- ============================================================
ALTER TABLE payments ADD COLUMN IF NOT EXISTS program TEXT;
