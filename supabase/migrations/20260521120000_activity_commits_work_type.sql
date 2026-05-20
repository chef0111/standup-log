-- Phase 6: work type classification on activity commits
alter table public.activity_commits
  add column if not exists work_type text
  check (work_type in ('feature', 'bug', 'refactor', 'test', 'chore', 'style'));

comment on column public.activity_commits.work_type is
  'Developer- or AI-assigned Work Type for Weekly Summary.';
