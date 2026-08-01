-- ============================================================
-- Dynamic service + role management.
--
-- Replaces three hardcoded arrays in client/src/client/app.ts:
--   RBAC_ROLES      — the frozen column list of the Roles & RBAC matrix
--   DEFAULT_RBAC    — role -> allowed screen modules
--   ASSIGNEE_ROLES  — which roles receive lead assignments
-- so services and roles can be added, edited and retired from Settings without a deploy.
--
-- MODEL NOTE — roles are globally unique, linked to services many-to-many.
-- The spec puts "Advisor" under BOTH Diabetics and Physiotherapy. app_users.role is plain TEXT and
-- the RBAC matrix is keyed by role NAME, so a per-service role row would make "Advisor" ambiguous:
-- two rows, same name, potentially different permissions, and nothing on the user record to say
-- which was meant. Instead there is ONE "Advisor" role (one permission set) that belongs to several
-- services. Which line a person works in is app_users.service — a separate axis from what they can do.
-- ============================================================

CREATE TABLE IF NOT EXISTS org_services (
  id         BIGSERIAL PRIMARY KEY,
  label      TEXT NOT NULL UNIQUE,
  sort       INT  NOT NULL DEFAULT 0,
  is_active  BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS org_roles (
  id            BIGSERIAL PRIMARY KEY,
  name          TEXT NOT NULL UNIQUE,
  -- Receives lead assignments: appears in "Assign to" dropdowns and gets a mirrored `assignees`
  -- row. This is the old ASSIGNEE_ROLES list, now per-role data.
  is_assignable BOOLEAN NOT NULL DEFAULT false,
  -- Screen modules this role may open (the Roles & RBAC matrix row). Carried on the role itself so
  -- a newly created role can never land in applyNavGating()'s fail-closed hole, where an unknown
  -- role resolves to NO modules and the person signs in to a completely empty app.
  modules       JSONB NOT NULL DEFAULT '[]'::jsonb,
  -- Protected roles cannot be renamed or deleted from the UI: Super Admin is hardcoded as
  -- unconditional full access in applyNavGating(), so losing the exact string would lock out the
  -- only account that can fix it.
  is_protected  BOOLEAN NOT NULL DEFAULT false,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  sort          INT NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS org_role_services (
  role_id    BIGINT NOT NULL REFERENCES org_roles(id)    ON DELETE CASCADE,
  service_id BIGINT NOT NULL REFERENCES org_services(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, service_id)
);
CREATE INDEX IF NOT EXISTS idx_org_role_services_service ON org_role_services(service_id);

-- Which service line this person works in. Drives the Role dropdown on the user form and (phase 2)
-- scopes the data they see. NULL = unrestricted, which is what every existing user gets so nobody
-- loses visibility the moment this ships.
ALTER TABLE app_users ADD COLUMN IF NOT EXISTS service TEXT;
CREATE INDEX IF NOT EXISTS idx_app_users_service ON app_users(service) WHERE service IS NOT NULL;

-- ---------- seed: services ----------
INSERT INTO org_services (label, sort) VALUES
  ('Diabetics', 10), ('Diagnostics', 20), ('Physiotherapy', 30),
  ('SONA', 40), ('Cold Plunge', 50), ('Admin', 60)
ON CONFLICT (label) DO NOTHING;

-- ---------- seed: roles ----------
-- `modules` mirrors DEFAULT_RBAC exactly for every pre-existing role, so current users keep the
-- access they have today. New roles (Telecaller, Instructor, BDM) get a conservative starting set
-- that an admin can widen in Roles & RBAC.
INSERT INTO org_roles (name, is_assignable, modules, is_protected, sort) VALUES
  ('Advisor',         true,  '["advisor","recordings"]',                                  false, 10),
  ('Senior Advisor',  true,  '["advisor","import","recordings"]',                          false, 20),
  ('Telecaller',      true,  '["advisor","recordings"]',                                   false, 30),
  ('Health Coach',    true,  '["coach","recordings"]',                                     false, 40),
  ('Screening',       false, '["screening"]',                                              false, 50),
  ('Diagnostics',     false, '["bloodtest"]',                                              false, 60),
  ('Physiotherapist', false, '["physio"]',                                                 false, 70),
  ('Instructor',      false, '["recordings"]',                                             false, 80),
  ('Receptionist',    false, '["reception","screening","bloodtest","physio","recordings"]', false, 90),
  ('Accounts',        false, '["accounts"]',                                               false, 100),
  ('BDM',             false, '["reports"]',                                                false, 110),
  ('ABM',             false, '["abm","advisor","import","reports"]',                       false, 120),
  ('Manager',         true,  '["advisor","coach","import","abm","reception","screening","bloodtest","physio","recordings","accounts","reports","admin"]', false, 130),
  ('Branch Manager',  false, '["advisor","coach","import","abm","reception","screening","bloodtest","physio","recordings","accounts","reports","admin"]', false, 140),
  ('Super Admin',     false, '["advisor","coach","import","abm","reception","screening","bloodtest","physio","recordings","accounts","reports","admin"]', true,  150)
ON CONFLICT (name) DO NOTHING;

-- ---------- seed: role -> service links ----------
INSERT INTO org_role_services (role_id, service_id)
SELECT r.id, s.id
FROM (VALUES
  ('Advisor','Diabetics'), ('Senior Advisor','Diabetics'), ('Telecaller','Diabetics'),
  ('Health Coach','Diabetics'), ('Screening','Diabetics'),
  ('Diagnostics','Diagnostics'),
  ('Physiotherapist','Physiotherapy'), ('Advisor','Physiotherapy'),
  ('Instructor','SONA'),
  ('Instructor','Cold Plunge'),
  ('Receptionist','Admin'), ('Accounts','Admin'), ('BDM','Admin'), ('ABM','Admin'),
  ('Manager','Admin'), ('Branch Manager','Admin'), ('Super Admin','Admin')
) AS v(role, service)
JOIN org_roles    r ON r.name  = v.role
JOIN org_services s ON s.label = v.service
ON CONFLICT DO NOTHING;
