-- ============================================================
-- WellnessOS — Backfill legacy NULL payments.program rows
-- PostgreSQL migration (target DB: PGDATABASE, e.g. Wellness_Center_App).
--
-- 17 payment rows predate the `program` column (added by an earlier
-- migration) and still have program IS NULL. The application code treats
-- this NULL three DIFFERENT, inconsistent ways depending which function
-- reads it (as "L1", as "matches every program", or as "excluded
-- entirely") — that inconsistency is the confirmed root cause of at least
-- one duplicate full-payment insert and one silently-discarded coach
-- payment entry found during this session's audit.
--
-- This is a DATA change (not schema), so — unlike the additive/idempotent
-- constraints migration — it rewrites existing rows. Review before running.
-- Matches the majority in-code convention: NULL program is read as "L1"
-- almost everywhere except a couple of inconsistent spots (that's the bug).
-- ============================================================

UPDATE payments SET program = 'L1' WHERE program IS NULL;
