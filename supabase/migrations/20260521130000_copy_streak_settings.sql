-- Phase 7: copy metadata, streak, default format preference
alter table public.standup_updates
  add column if not exists copied_at timestamptz,
  add column if not exists format_used text
    check (format_used in ('plain', 'slack', 'jira', 'notion'));

alter table public.profiles
  add column if not exists default_copy_format text not null default 'plain'
    check (default_copy_format in ('plain', 'slack', 'jira', 'notion')),
  add column if not exists current_streak integer not null default 0,
  add column if not exists longest_streak integer not null default 0,
  add column if not exists last_streak_workday date;

comment on column public.standup_updates.copied_at is
  'First copy/share timestamp for this Workday Standup Update.';
comment on column public.standup_updates.format_used is
  'Most recent copy format used for this Workday.';
comment on column public.profiles.default_copy_format is
  'User default clipboard format for Standup Updates.';
comment on column public.profiles.last_streak_workday is
  'Most recent Workday that advanced the Daily Streak.';

create index if not exists standup_updates_user_copied_idx
  on public.standup_updates (user_id, workday)
  where copied_at is not null;
