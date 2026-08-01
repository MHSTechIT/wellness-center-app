-- Service-based data scoping.
--
-- A user's org_services line (app_users.service) must be matched against leads.service, but those
-- two vocabularies do not line up and never will cleanly:
--
--   leads.service actually contains: 'Diabetes' (4134), 'Diabetes Counselling' (25),
--   'Physiotherapy' (11), 'Blood test' (8), 'Blood Test' (7),
--   'Diabetes Counselling + Blood Test' (3), 'Physio' (3), 'Diabetes + Blood test' (1)
--
-- Three distinct problems: casing ('Blood test' vs 'Blood Test'), synonyms ('Physio' vs
-- 'Physiotherapy'), and COMBINATION values that legitimately belong to two services at once.
--
-- Rewriting those rows to a canonical set was the obvious fix and is the wrong one: it destroys the
-- combination values, which carry real clinical meaning (a lead being counselled AND blood-tested).
-- Instead each service carries the lower-cased SUBSTRINGS that identify it. Matching is
-- "leads.service contains any of my terms", so:
--   * casing is irrelevant (compared lower-cased),
--   * synonyms collapse ('physio' matches both Physio and Physiotherapy),
--   * a combination row matches BOTH services and is visible to both teams — correct, and
--     impossible to express with a single canonical value.
--
-- An EMPTY match_terms array means "not patient-facing" — that service applies no filter at all.
-- Admin is seeded that way on purpose: reception, accounts and management need to see every line.
ALTER TABLE org_services ADD COLUMN IF NOT EXISTS match_terms JSONB NOT NULL DEFAULT '[]'::jsonb;

UPDATE org_services SET match_terms = '["diabet"]'::jsonb        WHERE label = 'Diabetics';
UPDATE org_services SET match_terms = '["blood"]'::jsonb         WHERE label = 'Diagnostics';
UPDATE org_services SET match_terms = '["physio"]'::jsonb        WHERE label = 'Physiotherapy';
UPDATE org_services SET match_terms = '["sona"]'::jsonb          WHERE label = 'SONA';
UPDATE org_services SET match_terms = '["cold plunge","plunge"]'::jsonb WHERE label = 'Cold Plunge';
UPDATE org_services SET match_terms = '[]'::jsonb                WHERE label = 'Admin';
