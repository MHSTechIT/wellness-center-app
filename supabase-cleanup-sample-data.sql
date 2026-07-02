-- ============================================================
-- WellnessOS — Sample-data cleanup (REVIEW BEFORE RUNNING)
-- ------------------------------------------------------------
-- Your database holds a MIX of real and seed data. This script removes ONLY
-- the seed rows that were inserted by supabase-schema.sql (section 6 "Seed
-- sample leads"). It targets rows by their exact (name, source, lead_date)
-- tuple AND meta_lead_id IS NULL — real leads (Meta sync, CSV import, walk-ins,
-- manual entry) all carry a non-null meta_lead_id, so they are never matched.
--
-- HOW TO USE:
--   1. Run STEP 1 (SELECT) first and eyeball the rows it returns.
--   2. Only if every row looks like seed data, run STEP 2 (DELETE).
--   3. STEP 3 is OPTIONAL — it resets the fake "last lead" timers on the
--      seeded source_connections rows (the sources themselves are kept, they
--      are real config the app uses).
-- Safe to re-run. Transaction-wrapped so a mistake can be rolled back.
-- ============================================================

-- The 27 seed tuples from supabase-schema.sql.
-- (Kept as a CTE so STEP 1 and STEP 2 match on exactly the same set.)

-- ---------- STEP 1 — PREVIEW what will be deleted ----------
WITH seed(name, source, lead_date) AS (
  VALUES
    ('A. Kumar','Meta Ads','2026-06-19'::date),
    ('R. Suresh','Meta Ads','2026-06-19'::date),
    ('M. Vel','Meta Ads','2026-06-19'::date),
    ('K. Anu','Meta Ads','2026-06-19'::date),
    ('S. Devi','Meta Ads','2026-06-19'::date),
    ('V. Prasad','Website forms','2026-06-19'::date),
    ('L. Priya','WhatsApp (WATI)','2026-06-19'::date),
    ('D. Kumar','Walk-in / Referral / Telecalling','2026-06-19'::date),
    ('P. Ravi','Meta Ads','2026-06-15'::date),
    ('N. Singh','Meta Ads','2026-06-14'::date),
    ('G. Patel','Meta Ads','2026-06-12'::date),
    ('H. Khan','Website forms','2026-06-10'::date),
    ('B. Sharma','WhatsApp (WATI)','2026-06-08'::date),
    ('T. Reddy','Meta Ads','2026-06-05'::date),
    ('C. Nair','Meta Ads','2026-06-03'::date),
    ('J. Pillai','Walk-in / Referral / Telecalling','2026-06-01'::date),
    ('E. Das','Meta Ads','2026-05-28'::date),
    ('O. Rao','Meta Ads','2026-05-22'::date),
    ('A. Kumar','Website forms','2026-05-18'::date),
    ('R. Suresh','WhatsApp (WATI)','2026-05-12'::date),
    ('M. Vel','Meta Ads','2026-05-05'::date),
    ('K. Anu','Walk-in / Referral / Telecalling','2026-05-01'::date),
    ('S. Devi','Meta Ads','2026-04-25'::date),
    ('V. Prasad','Meta Ads','2026-04-18'::date),
    ('L. Priya','Website forms','2026-04-10'::date),
    ('D. Kumar','WhatsApp (WATI)','2026-04-05'::date),
    ('P. Ravi','Meta Ads','2026-04-01'::date)
)
SELECT l.id, l.name, l.source, l.lead_date, l.meta_lead_id, l.phone, l.created_at
FROM leads l
JOIN seed s ON s.name = l.name AND s.source = l.source AND s.lead_date = l.lead_date
WHERE l.meta_lead_id IS NULL          -- real leads always have a meta_lead_id
  AND l.phone IS NULL                  -- seed rows had no phone
ORDER BY l.lead_date DESC;

-- ---------- STEP 2 — DELETE (run only after reviewing STEP 1) ----------
-- Uncomment the block below to perform the delete.
/*
BEGIN;
WITH seed(name, source, lead_date) AS (
  VALUES
    ('A. Kumar','Meta Ads','2026-06-19'::date),
    ('R. Suresh','Meta Ads','2026-06-19'::date),
    ('M. Vel','Meta Ads','2026-06-19'::date),
    ('K. Anu','Meta Ads','2026-06-19'::date),
    ('S. Devi','Meta Ads','2026-06-19'::date),
    ('V. Prasad','Website forms','2026-06-19'::date),
    ('L. Priya','WhatsApp (WATI)','2026-06-19'::date),
    ('D. Kumar','Walk-in / Referral / Telecalling','2026-06-19'::date),
    ('P. Ravi','Meta Ads','2026-06-15'::date),
    ('N. Singh','Meta Ads','2026-06-14'::date),
    ('G. Patel','Meta Ads','2026-06-12'::date),
    ('H. Khan','Website forms','2026-06-10'::date),
    ('B. Sharma','WhatsApp (WATI)','2026-06-08'::date),
    ('T. Reddy','Meta Ads','2026-06-05'::date),
    ('C. Nair','Meta Ads','2026-06-03'::date),
    ('J. Pillai','Walk-in / Referral / Telecalling','2026-06-01'::date),
    ('E. Das','Meta Ads','2026-05-28'::date),
    ('O. Rao','Meta Ads','2026-05-22'::date),
    ('A. Kumar','Website forms','2026-05-18'::date),
    ('R. Suresh','WhatsApp (WATI)','2026-05-12'::date),
    ('M. Vel','Meta Ads','2026-05-05'::date),
    ('K. Anu','Walk-in / Referral / Telecalling','2026-05-01'::date),
    ('S. Devi','Meta Ads','2026-04-25'::date),
    ('V. Prasad','Meta Ads','2026-04-18'::date),
    ('L. Priya','Website forms','2026-04-10'::date),
    ('D. Kumar','WhatsApp (WATI)','2026-04-05'::date),
    ('P. Ravi','Meta Ads','2026-04-01'::date)
)
DELETE FROM leads l
USING seed s
WHERE s.name = l.name AND s.source = l.source AND s.lead_date = l.lead_date
  AND l.meta_lead_id IS NULL
  AND l.phone IS NULL;
-- Review the row count, then:  COMMIT;   (or ROLLBACK; to undo)
COMMIT;
*/

-- ---------- STEP 3 — OPTIONAL: reset fake "last lead" timers ----------
-- The seeded source_connections rows are real config (the app's source list),
-- so we keep them but clear the demo "2m / 26m / 11m / 38m" last-lead values.
/*
UPDATE source_connections
SET last_lead = '—'
WHERE last_lead IN ('2m','26m','11m','38m');
*/
