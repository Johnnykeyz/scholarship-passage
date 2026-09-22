-- ============================================================================
-- GLOBAL SCHOLARSHIP & UNIVERSITY APPLICATION PLATFORM
-- MVP schema (Phase 1 slice): auth profile, opportunities, application
-- workspace, requirements (official + user-added), tasks, deadlines.
-- Designed to extend cleanly into documents, matching, AI assistant, etc.
-- ============================================================================

-- Extensions -----------------------------------------------------------------
create extension if not exists "pgcrypto";

-- ============================================================================
-- 1. USER PROFILES
-- Supabase auth.users already handles authentication; this table holds the
-- academic/application profile referenced throughout the product spec.
-- ============================================================================

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  country text,
  nationality text,
  current_institution text,
  degree_level text,        -- e.g. 'bachelors', 'masters', 'phd'
  field_of_study text,
  graduation_year int,
  cgpa numeric(4,2),
  cgpa_scale numeric(4,2) default 5.00,
  target_degree text,       -- what they're applying for next
  target_intake text,       -- e.g. 'Fall 2027', 'September 2027' — free text, no fixed calendar
  planning_notes text,      -- free text: what they're preparing for, in their own words
  preferred_countries text[] default '{}',
  preferred_fields text[] default '{}',
  funding_preference text,  -- 'fully_funded' | 'partially_funded' | 'any'
  onboarding_completed boolean default false,
  is_admin boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================================
-- 2. OPPORTUNITIES
-- The core catalog: scholarships, university programs, fellowships, etc.
-- Admin/verified-entry only for MVP (no public submission workflow yet).
-- ============================================================================

create type opportunity_type as enum (
  'scholarship', 'university_program', 'research_position',
  'fellowship', 'assistantship', 'grant', 'exchange_program'
);

create type opportunity_status as enum (
  'upcoming', 'open', 'closing_soon', 'closed', 'expected', 'archived'
);

create type trust_level as enum (
  'officially_verified', 'needs_verification', 'user_reported'
);

create table public.opportunities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type opportunity_type not null,
  provider text,                      -- e.g. 'UK Foreign, Commonwealth & Development Office'
  institution text,                   -- specific university, if applicable
  country text not null,
  city text,
  degree_level text,                  -- 'bachelors' | 'masters' | 'phd' | 'postgraduate' | 'fellowship'
  field text,
  description text,
  funding_type text,                  -- 'fully_funded' | 'partially_funded' | 'tuition_only' | 'stipend' | 'self_funded'
  funding_amount text,                -- free text, since packages vary widely
  tuition_coverage boolean,
  living_allowance boolean,
  travel_allowance boolean,
  accommodation_coverage boolean,
  health_insurance boolean,
  duration text,
  application_opens date,
  application_deadline date,
  start_date date,
  eligibility_summary text,
  nationality_requirements text,
  language_requirements text,
  work_experience_requirements text,
  application_fee text,
  official_website text not null,
  official_application_portal text,
  source_name text not null,
  source_url text not null,
  last_verified_at date not null,
  status opportunity_status not null default 'open',
  trust_level trust_level not null default 'needs_verification',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index opportunities_type_idx on public.opportunities(type);
create index opportunities_country_idx on public.opportunities(country);
create index opportunities_status_idx on public.opportunities(status);
create index opportunities_deadline_idx on public.opportunities(application_deadline);

-- Official/platform-defined requirements template for an opportunity.
-- These seed an application's requirements checklist when a user starts
-- tracking the opportunity (see application_requirements below).
create table public.opportunity_requirements (
  id uuid primary key default gen_random_uuid(),
  opportunity_id uuid not null references public.opportunities(id) on delete cascade,
  requirement_name text not null,
  category text not null,   -- 'academic' | 'identity' | 'financial' | 'language' | 'research' | 'professional' | 'application' | 'visa' | 'other'
  description text,
  is_required boolean not null default true,
  sort_order int default 0
);

-- ============================================================================
-- 3. SAVED OPPORTUNITIES (bookmarks, tags, notes — lightweight, pre-tracking)
-- ============================================================================

create table public.saved_opportunities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  opportunity_id uuid not null references public.opportunities(id) on delete cascade,
  tags text[] default '{}',   -- 'dream' | 'reach' | 'target' | 'backup' | custom
  notes text,
  created_at timestamptz not null default now(),
  unique (user_id, opportunity_id)
);

-- ============================================================================
-- 4. APPLICATIONS (the application workspace)
-- Created when a user clicks "Track This Opportunity".
-- ============================================================================

create type application_status as enum (
  'interested', 'researching', 'preparing', 'ready_to_apply', 'submitted',
  'under_review', 'interview', 'waitlisted', 'accepted', 'rejected',
  'withdrawn', 'deferred'
);

create table public.applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  opportunity_id uuid not null references public.opportunities(id) on delete cascade,
  status application_status not null default 'interested',
  program_name text,          -- user's chosen specific program, if the opportunity spans many
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, opportunity_id)
);

create index applications_user_idx on public.applications(user_id);
create index applications_status_idx on public.applications(status);

-- ============================================================================
-- 5. APPLICATION REQUIREMENTS
-- Combines: (a) copied-in official requirements from the opportunity,
-- and (b) user-added requirements — both live in one table, distinguished
-- by `source`, so the UI renders one unified checklist per the spec.
-- User-added requirements never modify the global opportunity_requirements.
-- ============================================================================

create type requirement_status as enum (
  'not_started', 'in_progress', 'ready', 'submitted', 'verified', 'not_applicable'
);

create type requirement_source as enum ('platform', 'user_added');

create table public.application_requirements (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  requirement_name text not null,
  category text not null,
  description text,
  is_required boolean not null default true,
  status requirement_status not null default 'not_started',
  deadline date,
  priority text default 'medium',  -- 'low' | 'medium' | 'high'
  notes text,
  source_link text,
  source requirement_source not null default 'platform',
  discovered_on_official_site boolean default false,  -- user-asserted flag per spec section 13
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index application_requirements_app_idx on public.application_requirements(application_id);

-- ============================================================================
-- 6. TASKS
-- ============================================================================

create type task_status as enum ('to_do', 'in_progress', 'completed');

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  status task_status not null default 'to_do',
  priority text default 'medium',
  deadline date,
  notes text,
  related_requirement_id uuid references public.application_requirements(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index tasks_application_idx on public.tasks(application_id);

-- ============================================================================
-- 7. TIMELINE EVENTS (auto-logged activity feed per application)
-- ============================================================================

create table public.timeline_events (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  event_text text not null,
  occurred_at timestamptz not null default now()
);

-- ============================================================================
-- 8. OPPORTUNITY REPORTS
-- Lets users flag a stale deadline, broken link, or incorrect detail on an
-- opportunity (spec section 64). Reviewed by an admin in the admin
-- dashboard; reporting never edits the opportunity directly.
-- ============================================================================

create type report_reason as enum (
  'incorrect_deadline', 'broken_link', 'outdated_requirement',
  'incorrect_funding_info', 'duplicate_opportunity', 'suspicious_opportunity', 'other'
);

create type report_status as enum ('open', 'reviewed', 'dismissed');

create table public.opportunity_reports (
  id uuid primary key default gen_random_uuid(),
  opportunity_id uuid not null references public.opportunities(id) on delete cascade,
  reported_by uuid references public.profiles(id) on delete set null,
  reason report_reason not null,
  details text,
  status report_status not null default 'open',
  created_at timestamptz not null default now()
);

create index opportunity_reports_status_idx on public.opportunity_reports(status);

-- ============================================================================
-- 9. ANALYTICS EVENTS
-- A single lightweight event log powering the admin analytics dashboard:
-- signups, opportunity views, outbound clicks to official sites, track
-- actions, searches, and page views. Deliberately generic (one table,
-- typed event_type + flexible metadata) rather than a bespoke table per
-- metric — enough to build real charts without overbuilding an analytics
-- platform inside a scholarship platform.
-- ============================================================================

create type analytics_event_type as enum (
  'page_view', 'opportunity_view', 'opportunity_official_link_click',
  'opportunity_tracked', 'search_performed', 'signup', 'login'
);

create table public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  event_type analytics_event_type not null,
  user_id uuid references public.profiles(id) on delete set null,
  opportunity_id uuid references public.opportunities(id) on delete set null,
  path text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index analytics_events_type_idx on public.analytics_events(event_type);
create index analytics_events_created_idx on public.analytics_events(created_at);
create index analytics_events_opportunity_idx on public.analytics_events(opportunity_id);

-- ============================================================================
-- 10. DOCUMENT VAULT
-- A user uploads a document once (e.g. "CV") and can attach it to multiple
-- applications without duplicating the file. `documents` is the logical,
-- named document; `document_versions` holds each uploaded revision (never
-- silently overwritten — a new upload is a new version row, one of which
-- is marked current); `application_documents` is the many-to-many link
-- between a document and the applications using it, optionally pinned to
-- a specific version (falls back to the document's current version when
-- null). Files themselves live in Supabase Storage; these tables hold
-- metadata and point at storage paths, not file bytes.
-- ============================================================================

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,               -- e.g. "CV", "Statement of Purpose"
  category text not null default 'other',  -- 'academic' | 'identity' | 'application' | 'supporting' | 'other'
  current_version_id uuid,          -- set after first version is created; FK added below once document_versions exists
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.document_versions (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete cascade,
  version_number int not null,
  storage_path text not null,       -- path within the 'documents' Supabase Storage bucket
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
  document_version_id uuid references public.document_versions(id) on delete set null, -- null = "always use current version"
  attached_at timestamptz not null default now(),
  unique (application_id, document_id)
);

create index documents_user_idx on public.documents(user_id);
create index document_versions_document_idx on public.document_versions(document_id);
create index application_documents_application_idx on public.application_documents(application_id);
create index application_documents_document_idx on public.application_documents(document_id);

-- ============================================================================
-- updated_at trigger helper
-- ============================================================================

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_set_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger opportunities_set_updated_at before update on public.opportunities
  for each row execute function public.set_updated_at();
create trigger applications_set_updated_at before update on public.applications
  for each row execute function public.set_updated_at();
create trigger application_requirements_set_updated_at before update on public.application_requirements
  for each row execute function public.set_updated_at();
create trigger tasks_set_updated_at before update on public.tasks
  for each row execute function public.set_updated_at();
create trigger documents_set_updated_at before update on public.documents
  for each row execute function public.set_updated_at();

-- Auto-create a profile row when a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

alter table public.profiles enable row level security;
alter table public.opportunities enable row level security;
alter table public.opportunity_requirements enable row level security;
alter table public.saved_opportunities enable row level security;
alter table public.applications enable row level security;
alter table public.application_requirements enable row level security;
alter table public.tasks enable row level security;
alter table public.timeline_events enable row level security;
alter table public.opportunity_reports enable row level security;
alter table public.analytics_events enable row level security;
alter table public.documents enable row level security;
alter table public.document_versions enable row level security;
alter table public.application_documents enable row level security;

-- Profiles: user can only see/edit their own
create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);

-- Opportunities & their platform requirements: public read (catalog is
-- discoverable by anyone, including signed-out visitors browsing).
create policy "opportunities_public_read" on public.opportunities for select using (true);
create policy "opportunity_requirements_public_read" on public.opportunity_requirements for select using (true);

-- Admin write access: any authenticated user whose profile has is_admin =
-- true can create, edit, or archive opportunities and their requirement
-- templates. This is intentionally the only way to write to the catalog
-- from the app itself (see the admin dashboard) — there is no public
-- opportunity-submission flow yet.
create policy "opportunities_admin_write" on public.opportunities
  for all using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true)
  ) with check (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true)
  );

create policy "opportunity_requirements_admin_write" on public.opportunity_requirements
  for all using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true)
  ) with check (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true)
  );

-- Opportunity reports: any signed-in user can file a report; only admins
-- can read the queue or change its status. Reporting is write-only for a
-- regular user by design — they shouldn't see others' reports.
create policy "opportunity_reports_insert_own" on public.opportunity_reports
  for insert with check (auth.uid() = reported_by);

create policy "opportunity_reports_admin_all" on public.opportunity_reports
  for all using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true)
  ) with check (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true)
  );

-- Analytics events: anyone (including anonymous, signed-out visitors) can
-- log an event — that's how page views and pre-signup clicks get tracked.
-- Only admins can read the log; a regular user should never be able to
-- query others' click history. user_id must be null or the caller's own
-- id, so no one can attribute events to someone else's account.
create policy "analytics_events_insert_any" on public.analytics_events
  for insert with check (user_id is null or auth.uid() = user_id);

create policy "analytics_events_admin_read" on public.analytics_events
  for select using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true)
  );

-- Documents and their versions: owner only. application_documents (the
-- link table) is scoped through the owning application, matching the
-- pattern used for application_requirements/tasks/timeline_events below.
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

-- Saved opportunities: owner only
create policy "saved_opportunities_owner_all" on public.saved_opportunities
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Applications: owner only
create policy "applications_owner_all" on public.applications
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Application requirements: owner only, via parent application
create policy "application_requirements_owner_all" on public.application_requirements
  for all using (
    exists (select 1 from public.applications a where a.id = application_id and a.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.applications a where a.id = application_id and a.user_id = auth.uid())
  );

-- Tasks: owner only
create policy "tasks_owner_all" on public.tasks
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Timeline events: owner only, via parent application
create policy "timeline_events_owner_all" on public.timeline_events
  for all using (
    exists (select 1 from public.applications a where a.id = application_id and a.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.applications a where a.id = application_id and a.user_id = auth.uid())
  );

-- ============================================================================
-- Function: start tracking an opportunity (creates application + copies
-- official requirements in, per spec section 53 "checklist automation")
-- ============================================================================

create or replace function public.start_application(p_opportunity_id uuid)
returns uuid as $$
declare
  v_application_id uuid;
begin
  insert into public.applications (user_id, opportunity_id, status)
  values (auth.uid(), p_opportunity_id, 'preparing')
  returning id into v_application_id;

  insert into public.application_requirements
    (application_id, requirement_name, category, description, is_required, source)
  select v_application_id, requirement_name, category, description, is_required, 'platform'
  from public.opportunity_requirements
  where opportunity_id = p_opportunity_id;

  insert into public.timeline_events (application_id, event_text)
  values (v_application_id, 'Application created');

  return v_application_id;
end;
$$ language plpgsql security definer;

-- ============================================================================
-- Function: admin analytics summary
-- Aggregates analytics_events + core tables into one JSON payload for the
-- admin analytics dashboard, computed in Postgres rather than pulled as raw
-- rows and summed in JS. security definer so it can read analytics_events
-- and profiles regardless of the caller's own RLS visibility, but it
-- checks is_admin itself before returning anything, so a non-admin caller
-- gets an error, not a leak.
-- ============================================================================

create or replace function public.admin_analytics_summary(p_days int default 30)
returns jsonb as $$
declare
  v_is_admin boolean;
  v_since timestamptz := now() - (p_days || ' days')::interval;
  result jsonb;
begin
  select is_admin into v_is_admin from public.profiles where id = auth.uid();
  if not coalesce(v_is_admin, false) then
    raise exception 'Not authorized';
  end if;

  select jsonb_build_object(
    'window_days', p_days,
    'totals', jsonb_build_object(
      'users', (select count(*) from public.profiles),
      'new_users', (select count(*) from public.profiles where created_at >= v_since),
      'applications', (select count(*) from public.applications),
      'new_applications', (select count(*) from public.applications where created_at >= v_since),
      'opportunities', (select count(*) from public.opportunities where status != 'archived')
    ),
    'events_by_type', (
      select coalesce(jsonb_object_agg(event_type, cnt), '{}'::jsonb)
      from (
        select event_type, count(*) as cnt
        from public.analytics_events
        where created_at >= v_since
        group by event_type
      ) t
    ),
    'events_by_day', (
      select coalesce(jsonb_agg(jsonb_build_object('date', day, 'count', cnt) order by day), '[]'::jsonb)
      from (
        select date_trunc('day', created_at)::date as day, count(*) as cnt
        from public.analytics_events
        where created_at >= v_since
        group by 1
      ) t
    ),
    'top_opportunities_by_views', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'opportunity_id', o.id, 'name', o.name, 'views', t.cnt
      ) order by t.cnt desc), '[]'::jsonb)
      from (
        select opportunity_id, count(*) as cnt
        from public.analytics_events
        where event_type = 'opportunity_view' and created_at >= v_since and opportunity_id is not null
        group by opportunity_id
        order by count(*) desc
        limit 5
      ) t
      join public.opportunities o on o.id = t.opportunity_id
    ),
    'top_opportunities_by_official_clicks', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'opportunity_id', o.id, 'name', o.name, 'clicks', t.cnt
      ) order by t.cnt desc), '[]'::jsonb)
      from (
        select opportunity_id, count(*) as cnt
        from public.analytics_events
        where event_type = 'opportunity_official_link_click' and created_at >= v_since and opportunity_id is not null
        group by opportunity_id
        order by count(*) desc
        limit 5
      ) t
      join public.opportunities o on o.id = t.opportunity_id
    ),
    'applications_by_status', (
      select coalesce(jsonb_object_agg(status, cnt), '{}'::jsonb)
      from (
        select status, count(*) as cnt
        from public.applications
        group by status
      ) t
    )
  ) into result;

  return result;
end;
$$ language plpgsql security definer;

-- ============================================================================
-- Storage: document vault bucket
-- Files are private by default (public = false). Storage path convention:
-- {user_id}/{document_id}/{version_id}-{filename}, which is what lets the
-- policies below check ownership purely from the path — no extra lookup
-- table needed, and it can't be spoofed since auth.uid() is server-verified.
-- ============================================================================

insert into storage.buckets (id, name, public)
values ('documents', 'documents', false)
on conflict (id) do nothing;

create policy "document_files_owner_select" on storage.objects
  for select using (bucket_id = 'documents' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "document_files_owner_insert" on storage.objects
  for insert with check (bucket_id = 'documents' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "document_files_owner_delete" on storage.objects
  for delete using (bucket_id = 'documents' and (storage.foldername(name))[1] = auth.uid()::text);

-- ============================================================================
-- Automated staleness flagging
--
-- flag_stale_opportunities() downgrades any opportunity's trust_level to
-- 'needs_verification' once its last_verified_at is older than the given
-- threshold (default 60 days, matching the admin dashboard's existing
-- warning). It never touches opportunities already at 'needs_verification'
-- or 'user_reported' (nothing to downgrade), and never touches archived
-- opportunities (already out of the active catalog). Returns the number
-- of rows it changed, so a scheduled run can be observed in logs.
--
-- This does NOT require pg_cron to exist — the function is safe to call
-- manually or from an external scheduler. If your Supabase project has
-- the pg_cron extension available (Pro plan and above, or self-hosted),
-- the schedule call below wires it to run automatically. On projects
-- without pg_cron, the two lines calling cron.schedule will fail — just
-- skip them (a plain "create extension" failure here does not affect any
-- other table, policy, or function in this file).
-- ============================================================================

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

-- Optional: schedule a daily run at 03:00 UTC. Requires the pg_cron
-- extension. Uncomment and run manually in the SQL editor if your project
-- supports it — this is commented out by default so schema.sql runs
-- cleanly on every Supabase tier, including ones without pg_cron.
--
-- create extension if not exists pg_cron;
-- select cron.schedule(
--   'flag-stale-opportunities-daily',
--   '0 3 * * *',
--   $$select public.flag_stale_opportunities(60)$$
-- );
