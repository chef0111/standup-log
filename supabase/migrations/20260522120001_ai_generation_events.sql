-- Audit + rate limit for AI standup generation (free tier: 5 per rolling minute).

create table public.ai_generation_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  workday date not null,
  created_at timestamptz not null default now()
);

comment on table public.ai_generation_events is
  'Successful AI draft generations per user; used for rate limiting.';

create index ai_generation_events_user_created_idx
  on public.ai_generation_events (user_id, created_at desc);

alter table public.ai_generation_events enable row level security;

create policy "ai_generation_events_select_own"
  on public.ai_generation_events
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

-- Inserts from Edge Function via service role only (no client insert policy).
