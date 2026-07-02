-- ============================================================
-- WellnessOS — Storage buckets for file uploads
-- Run in Supabase SQL Editor (runs as the owner, so it bypasses RLS and CAN
-- create buckets — the anon key cannot). Additive and safe to re-run.
--
-- Without this, EVERY file upload fails ("bucket not found"): blood-report
-- attachments (Health Advisor), call recordings, and payment proofs all need
-- these buckets to exist. This is the one-time setup that makes uploads work.
-- ============================================================

-- 1) Buckets (public = files are viewable via their public URL, e.g. in a PDF viewer)
insert into storage.buckets (id, name, public)
values ('lead-files', 'lead-files', true)
on conflict (id) do update set public = true;

insert into storage.buckets (id, name, public)
values ('call-recordings', 'call-recordings', true)
on conflict (id) do update set public = true;

-- 2) Policies on storage.objects so the app (anon key) can upload / replace / remove.
--    Public buckets already allow READ via the public URL; writes still need a policy.
drop policy if exists "wos public read"   on storage.objects;
drop policy if exists "wos public insert" on storage.objects;
drop policy if exists "wos public update" on storage.objects;
drop policy if exists "wos public delete" on storage.objects;

create policy "wos public read"   on storage.objects for select
  using (bucket_id in ('lead-files', 'call-recordings'));
create policy "wos public insert" on storage.objects for insert
  with check (bucket_id in ('lead-files', 'call-recordings'));
create policy "wos public update" on storage.objects for update
  using (bucket_id in ('lead-files', 'call-recordings'));
create policy "wos public delete" on storage.objects for delete
  using (bucket_id in ('lead-files', 'call-recordings'));
