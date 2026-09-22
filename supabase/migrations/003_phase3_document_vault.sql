-- ============================================================================
-- MIGRATION: Phase 3 — document vault (documents, versions, attachments)
--
-- Run this ONLY if you already ran schema.sql (or migration 002) against a
-- live Supabase project before this Phase 3 update. If you're setting up
-- fresh, skip this file — schema.sql already includes everything below.
-- ============================================================================

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  category text not null default 'other',
  current_version_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.document_versions (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete cascade,
  version_number int not null,
  storage_path text not null,
  file_name text not null,
  file_size_bytes bigint,
  mime_type text,
  uploaded_at timestamptz not null default now(),
  unique (document_id, version_number)
);

alter table public.documents
  add constraint documents_current_version_fk
  foreign key (current_version_id) references public.document_versions(id) on delete set null;

create table public.application_documents (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  document_id uuid not null references public.documents(id) on delete cascade,
  document_version_id uuid references public.document_versions(id) on delete set null,
  attached_at timestamptz not null default now(),
  unique (application_id, document_id)
);

create index documents_user_idx on public.documents(user_id);
create index document_versions_document_idx on public.document_versions(document_id);
create index application_documents_application_idx on public.application_documents(application_id);
create index application_documents_document_idx on public.application_documents(document_id);

create trigger documents_set_updated_at before update on public.documents
  for each row execute function public.set_updated_at();

alter table public.documents enable row level security;
alter table public.document_versions enable row level security;
alter table public.application_documents enable row level security;

create policy "documents_owner_all" on public.documents
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "document_versions_owner_all" on public.document_versions
  for all using (
    exists (select 1 from public.documents d where d.id = document_id and d.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.documents d where d.id = document_id and d.user_id = auth.uid())
  );

create policy "application_documents_owner_all" on public.application_documents
  for all using (
    exists (select 1 from public.applications a where a.id = application_id and a.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.applications a where a.id = application_id and a.user_id = auth.uid())
  );

insert into storage.buckets (id, name, public)
values ('documents', 'documents', false)
on conflict (id) do nothing;

create policy "document_files_owner_select" on storage.objects
  for select using (bucket_id = 'documents' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "document_files_owner_insert" on storage.objects
  for insert with check (bucket_id = 'documents' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "document_files_owner_delete" on storage.objects
  for delete using (bucket_id = 'documents' and (storage.foldername(name))[1] = auth.uid()::text);

create or replace function public.flag_stale_opportunities(p_threshold_days int default 60)
returns int as $$
declare
  v_updated int;
begin
  update public.opportunities
  set trust_level = 'needs_verification'
  where trust_level = 'officially_verified'
    and status != 'archived'
    and last_verified_at < (current_date - p_threshold_days);

  get diagnostics v_updated = row_count;
  return v_updated;
end;
$$ language plpgsql security definer;

-- Optional — requires pg_cron (Supabase Pro+/self-hosted). See schema.sql
-- for the commented-out cron.schedule() call if your project supports it.
