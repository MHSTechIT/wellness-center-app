-- RBAC advisor mapping: link an assignee (advisor) to their login account.
-- An Advisor login is scoped to only their own leads; the mapping resolves the
-- logged-in app_users.email → assignees.email → assignees.name → leads.assigned_to.
-- Optional column; when unset, mapping falls back to matching app_users.name.
ALTER TABLE assignees ADD COLUMN IF NOT EXISTS email TEXT;
CREATE INDEX IF NOT EXISTS idx_assignees_email ON assignees(lower(email));
