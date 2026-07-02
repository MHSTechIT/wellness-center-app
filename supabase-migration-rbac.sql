-- ============================================================
-- WellnessOS — RBAC: users, roles, and an editable permission matrix
-- Run in Supabase SQL Editor. Additive and safe to re-run.
--
-- IMPORTANT companion step (one-time, in the dashboard):
--   Authentication → Sign In / Providers → Email → turn "Confirm email" OFF,
--   so admin-created staff accounts can log in immediately with their password.
--
-- Login uses Supabase Auth (auth.users). This migration adds the app-level
-- profile (name + role + active flag) and a single JSON row that stores the
-- editable Module × Role permission matrix.
-- ============================================================

-- App-level user profile, keyed to the auth user's email.
create table if not exists app_users (
  id         bigserial primary key,
  email      text unique not null,
  name       text,
  role       text not null default 'Advisor',
  active     boolean not null default true,
  created_at timestamptz default now()
);
create index if not exists idx_app_users_email on app_users(lower(email));

-- Generic key/value settings store (holds the RBAC matrix under key 'rbac').
create table if not exists app_settings (
  key        text primary key,
  value      jsonb,
  updated_at timestamptz default now()
);

-- Public policies (internal tool; access is gated by login + the UI matrix).
alter table app_users    enable row level security;
alter table app_settings enable row level security;
drop policy if exists "pub read app_users"  on app_users;
drop policy if exists "pub write app_users" on app_users;
drop policy if exists "pub upd app_users"   on app_users;
drop policy if exists "pub del app_users"   on app_users;
create policy "pub read app_users"  on app_users for select using (true);
create policy "pub write app_users" on app_users for insert with check (true);
create policy "pub upd app_users"   on app_users for update using (true);
create policy "pub del app_users"   on app_users for delete using (true);
drop policy if exists "pub read app_settings"  on app_settings;
drop policy if exists "pub write app_settings" on app_settings;
drop policy if exists "pub upd app_settings"   on app_settings;
create policy "pub read app_settings"  on app_settings for select using (true);
create policy "pub write app_settings" on app_settings for insert with check (true);
create policy "pub upd app_settings"   on app_settings for update using (true);

-- Seed the first Super Admin (the workspace owner). The matching Auth account
-- (same email + a password) is created separately — once "Confirm email" is OFF,
-- the owner can be created from the app's User management or via signup.
insert into app_users (email, name, role, active)
values ('info@myhealthschool.in', 'Owner', 'Super Admin', true)
on conflict (email) do update set role = 'Super Admin', active = true;
