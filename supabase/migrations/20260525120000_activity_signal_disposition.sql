-- Post-MVP hardening: shipped vs in-progress Activity Signal disposition + PR merge time

alter table public.activity_commits
  add column if not exists signal_disposition text not null default 'shipped'
    check (signal_disposition in ('shipped', 'in_progress')),
  add column if not exists pr_merged_at timestamptz;

comment on column public.activity_commits.signal_disposition is
  'Shipped (default branch or merged PR) vs in_progress (feature branch / open PR).';
comment on column public.activity_commits.pr_merged_at is
  'When the linked pull request was merged, if applicable.';
