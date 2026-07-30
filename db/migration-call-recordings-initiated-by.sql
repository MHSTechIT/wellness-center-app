-- ============================================================
-- WellnessOS — Attribute each call to the logged-in user who placed it
-- PostgreSQL migration (target DB: PGDATABASE, e.g. Wellness_Center_App).
--
-- Root cause (2026-07-30 investigation, reported by Deepak/Advisor for lead
-- Vasanthan, +919840043082): the Advisor dashboard's "Connected Calls" /
-- "Total Call Duration" KPIs summed EVERY call_recordings row for a lead and
-- attributed 100% of it to whichever advisor that lead is CURRENTLY assigned
-- to — never checking who actually placed the call. call_recordings.
-- agent_number looked like it could disambiguate individuals, but it can't:
-- it is overwritten from Smartflo's own CDR (see syncProvider in
-- server/src/routes/calls.ts) and reflects Tata's own device/extension
-- routing for the shared, PER-ROLE "advisor" Tata extension (one extension
-- for all 5 advisors — Deepak, Dinesh, Priya K., Vinod M., prem kumar).
-- Verified: 10+ distinct agent_number values appear in call_recordings, and
-- NONE of them match any advisor's phone in the assignees table (most
-- assignees have no phone on file at all) — so agent_number cannot be used,
-- even retroactively, to recover who really made a historical call.
--
-- The one reliable identity signal is the AUTHENTICATED SESSION already
-- present on /api/calls/initiate (requireAuth populates req.user with the
-- logged-in email/name) — it was simply never persisted. This migration adds
-- columns for it; the code change (same commit) starts writing them.
--
-- initiated_by_email / initiated_by_name stay NULL on every row created
-- before this fix — there is no way to safely backfill who placed a
-- historical call, and guessing would risk recreating the exact
-- mis-attribution bug this fix closes. Historical rows are NOT modified or
-- deleted (per the explicit requirement not to disturb historical call
-- data) — they remain visible on a LEAD's own call-history/timeline view,
-- which shows every call to that lead regardless of who placed it (that
-- view's purpose is full client history, not individual performance). Only
-- the per-ADVISOR "my Connected Calls" KPI now requires a match on
-- initiated_by_email, so an unattributed legacy row no longer counts toward
-- anyone's personal total.
--
-- Idempotent — ADD COLUMN IF NOT EXISTS is safe to re-run.
-- ============================================================

ALTER TABLE call_recordings ADD COLUMN IF NOT EXISTS initiated_by_email TEXT;
ALTER TABLE call_recordings ADD COLUMN IF NOT EXISTS initiated_by_name TEXT;

CREATE INDEX IF NOT EXISTS idx_call_recordings_initiated_by_email ON call_recordings (initiated_by_email);
