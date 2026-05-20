-- Phase 8–9: entitlements (is_pro, repo cap) + reminder settings

alter table public.profiles
  add column if not exists is_pro boolean not null default false,
  add column if not exists reminder_enabled boolean not null default true,
  add column if not exists reminder_time_local time not null default '09:00';

comment on column public.profiles.is_pro is
  'Manual Pro flag for beta; unlocks unlimited repos and full history.';
comment on column public.profiles.reminder_enabled is
  'Whether morning standup reminders are scheduled.';
comment on column public.profiles.reminder_time_local is
  'Local time (device TZ) for standup reminder; default 09:00.';

create or replace function private.enforce_free_tier_repo_limit()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  repo_count int;
begin
  if new.is_pro then
    return new;
  end if;
  repo_count := coalesce(jsonb_array_length(new.selected_repositories), 0);
  if repo_count > 3 then
    raise exception 'free_tier_repo_limit'
      using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_enforce_free_tier_repo_limit on public.profiles;

create trigger profiles_enforce_free_tier_repo_limit
  before insert or update of selected_repositories, is_pro
  on public.profiles
  for each row
  execute function private.enforce_free_tier_repo_limit();
