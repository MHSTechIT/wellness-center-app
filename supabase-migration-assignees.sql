-- ============================================================
-- WellnessOS — Assignee (advisor) master
-- Run in Supabase SQL Editor. Additive and safe to re-run.
-- Single source of truth for everyone who can receive leads.
-- ============================================================

CREATE TABLE IF NOT EXISTS assignees (
  id BIGSERIAL PRIMARY KEY,
  name       TEXT NOT NULL,
  role       TEXT NOT NULL DEFAULT 'Advisor',
  branch     TEXT NOT NULL DEFAULT 'Chennai',
  phone      TEXT,
  email      TEXT,
  is_active  BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE assignees ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "assignees_read"   ON assignees;
DROP POLICY IF EXISTS "assignees_insert" ON assignees;
DROP POLICY IF EXISTS "assignees_update" ON assignees;
DROP POLICY IF EXISTS "assignees_delete" ON assignees;
CREATE POLICY "assignees_read"   ON assignees FOR SELECT USING (true);
CREATE POLICY "assignees_insert" ON assignees FOR INSERT WITH CHECK (true);
CREATE POLICY "assignees_update" ON assignees FOR UPDATE USING (true);
CREATE POLICY "assignees_delete" ON assignees FOR DELETE USING (true);

-- Seed the advisors that were previously hardcoded (only if table is empty)
INSERT INTO assignees (name, role, branch)
SELECT * FROM (VALUES
  ('Priya K.', 'Advisor', 'Chennai'),
  ('Vinod M.', 'Advisor', 'Chennai'),
  ('Sana R.',  'Senior Advisor', 'Chennai')
) AS v(name, role, branch)
WHERE NOT EXISTS (SELECT 1 FROM assignees);
