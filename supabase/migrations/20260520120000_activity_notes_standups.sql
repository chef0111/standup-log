-- Phase 3–5: activity commits, manual notes, standup updates + github_user_id on profiles

alter table public.profiles
  add column if not exists github_user_id bigint;

comment on column public.profiles.github_user_id is 'GitHub numeric user id for commit author matching.';

-- activity_commits: stored Activity Metadata (no diffs)
create table public.activity_commits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  workday date not null,
  repository_full_name text not null,
  sha text not null,
  message text not null,
  committed_at timestamptz not null,
  html_url text not null,
  author_login text,
  pr_number integer,
  pr_title text,
  pr_url text,
  pr_state text,
  synced_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint activity_commits_user_sha_unique unique (user_id, sha)
);

comment on table public.activity_commits is 'Commit metadata per Workday; Activity Signals for standup generation.';

create index activity_commits_user_workday_idx on public.activity_commits (user_id, workday);
create index activity_commits_user_committed_at_idx on public.activity_commits (user_id, committed_at desc);

alter table public.activity_commits enable row level security;

create policy "activity_commits_select_own"
  on public.activity_commits
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "activity_commits_insert_own"
  on public.activity_commits
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "activity_commits_update_own"
  on public.activity_commits
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "activity_commits_delete_own"
  on public.activity_commits
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- manual_notes
create table public.manual_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  workday date not null,
  body text not null,
  is_blocker boolean not null default false,
  is_carry_forward boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint manual_notes_body_not_empty check (length(trim(body)) > 0)
);

comment on table public.manual_notes is 'Developer-authored Manual Notes tied to a Workday.';

create index manual_notes_user_workday_idx on public.manual_notes (user_id, workday);
create index manual_notes_carry_forward_idx on public.manual_notes (user_id, is_carry_forward, workday)
  where is_carry_forward = true;

alter table public.manual_notes enable row level security;

create policy "manual_notes_select_own"
  on public.manual_notes
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "manual_notes_insert_own"
  on public.manual_notes
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "manual_notes_update_own"
  on public.manual_notes
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "manual_notes_delete_own"
  on public.manual_notes
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);

create or replace function private.set_manual_notes_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger manual_notes_set_updated_at
  before update on public.manual_notes
  for each row
  execute function private.set_manual_notes_updated_at();

-- standup_updates: one per user per Workday
create table public.standup_updates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  workday date not null,
  yesterday_text text not null default '',
  today_text text not null default '',
  blockers_text text not null default 'No blockers',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint standup_updates_user_workday_unique unique (user_id, workday)
);

comment on table public.standup_updates is 'Edited Standup Update sections per Workday.';

create index standup_updates_user_workday_idx on public.standup_updates (user_id, workday);

alter table public.standup_updates enable row level security;

create policy "standup_updates_select_own"
  on public.standup_updates
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "standup_updates_insert_own"
  on public.standup_updates
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "standup_updates_update_own"
  on public.standup_updates
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "standup_updates_delete_own"
  on public.standup_updates
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);

create or replace function private.set_standup_updates_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger standup_updates_set_updated_at
  before update on public.standup_updates
  for each row
  execute function private.set_standup_updates_updated_at();
