-- ============================================================================
-- MIGRATION: Phase 2 — admin flag, admin write access, opportunity reports
--
-- Run this ONLY if you already ran the original schema.sql against a live
-- Supabase project before this Phase 2 update. If you're setting up fresh,
-- skip this file — schema.sql already includes everything below.
--
-- Safe to run once; re-running will error on the duplicate type/column
-- (Postgres doesn't have IF NOT EXISTS for "create type", so this is
-- intentionally not idempotent — that's fine for a one-time migration).
-- ============================================================================

alter table public.profiles add column is_admin boolean not null default false;
alter table public.profiles add column target_intake text;
alter table public.profiles add column planning_notes text;

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

alter table public.opportunity_reports enable row level security;

create policy "opportunity_reports_insert_own" on public.opportunity_reports
  for insert with check (auth.uid() = reported_by);

create policy "opportunity_reports_admin_all" on public.opportunity_reports
  for all using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true)
  ) with check (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true)
  );

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

alter table public.analytics_events enable row level security;

create policy "analytics_events_insert_any" on public.analytics_events
  for insert with check (user_id is null or auth.uid() = user_id);

create policy "analytics_events_admin_read" on public.analytics_events
  for select using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true)
  );

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

-- After running this, make yourself an admin by running (replace the email):
--
--   update public.profiles set is_admin = true
--   where email = 'your-email@example.com';
