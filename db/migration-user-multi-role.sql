-- ============================================================================
-- Multi-role users: a person can hold several roles at once (e.g. Health Coach
-- AND Advisor) and get the UNION of what those roles allow.
--
-- Backward compatible by design:
--   * app_users.role STAYS as the PRIMARY role. Every existing read, the
--     assignees mirror, and the session token keep working untouched.
--   * app_users.roles is the full list. When it is NULL/absent the app falls
--     back to [role], so the app behaves exactly as before this migration —
--     nothing breaks if this file has not been run yet.
--
-- Safe to run more than once.
-- ============================================================================

ALTER TABLE app_users ADD COLUMN IF NOT EXISTS roles jsonb;

-- Seed every existing user with their current single role, so the list form is
-- populated from day one and no one loses access.
UPDATE app_users
   SET roles = to_jsonb(ARRAY[role])
 WHERE roles IS NULL
   AND role IS NOT NULL
   AND btrim(role) <> '';

-- Anyone with no role at all gets an empty list rather than NULL, so the client
-- never has to distinguish "column missing" from "no roles set".
UPDATE app_users
   SET roles = '[]'::jsonb
 WHERE roles IS NULL;

-- Sanity check — run this after the migration; every row should show matching
-- primary/first values and a non-null list.
--   SELECT name, role AS primary_role, roles FROM app_users ORDER BY name;
