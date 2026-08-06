-- ============================================================================
-- FULL LEAD RESET — Wellness_Center_App (PRODUCTION)
-- Requirement (6 Aug 2026): keep ONLY the Lead-import data and the users table;
-- reset everything else. Operational tables are already at 0 from
-- wipe-production-operational-data.sql — this resets the LEAD ROWS themselves.
--
-- AFTER THIS RUNS every lead is a FRESH IMPORTED LEAD:
--   kept   : name, phone, email, source, service, language, city, campaign,
--            form, ad-account info, created/lead dates, valid/duplicate flags
--   cleared: call status, follow-up, visit & enrolment stamps, coach/advisor
--            profiles, screening data, sugar poll, client id,
--            ASSIGNMENTS (every advisor book empties, nothing in the pool)
--
-- PRUNE PROTECTION (do not remove): the Meta sync DELETES any lead with no
-- workflow state at all once it ages out of the crawl window. pool_added_at
-- counts as workflow state, so it is stamped on every lead to keep the kept
-- leads safe. It is a timestamp only — nothing shows in the pool because
-- in_pool is false.
--
-- RUN ON: Wellness_Center_App only.
-- BACKUP : db/backup-prod-2026-08-06-pre-wipe.backup (full DB, pre-wipe)
-- ============================================================================

BEGIN;

DO $$ BEGIN
  IF current_database() <> 'Wellness_Center_App' THEN
    RAISE EXCEPTION 'Wrong database: % — run this on Wellness_Center_App only', current_database();
  END IF;
END $$;

UPDATE leads SET
  -- workflow / journey stamps
  call_status      = NULL,
  next_followup    = NULL,
  visited_at       = NULL,
  enrolled_at      = NULL,
  client_id        = NULL,
  coach_profile    = NULL,
  advisor_profile  = NULL,
  screening_vitals = NULL,
  sugar_poll       = NULL,
  -- assignments: advisor books empty, pool empty
  is_assigned      = false,
  assigned_to      = NULL,
  assigned_at      = NULL,
  in_pool          = false,
  -- prune protection — MUST stay stamped (see header)
  pool_added_at    = COALESCE(pool_added_at, now());

COMMIT;

-- verify: workflow columns all 0; every lead prune-protected; imports intact
SELECT count(*)                                                       AS total_leads,
       count(*) FILTER (WHERE call_status IS NOT NULL AND call_status<>'') AS with_status,
       count(*) FILTER (WHERE visited_at  IS NOT NULL)                AS visited,
       count(*) FILTER (WHERE enrolled_at IS NOT NULL)                AS enrolled,
       count(*) FILTER (WHERE is_assigned)                            AS assigned,
       count(*) FILTER (WHERE in_pool)                                AS in_pool,
       count(*) FILTER (WHERE pool_added_at IS NULL)                  AS unprotected_from_prune
FROM leads;
