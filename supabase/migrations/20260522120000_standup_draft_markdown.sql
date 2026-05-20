-- Single markdown draft per Standup Update; migrate legacy section columns.

alter table public.standup_updates
  add column if not exists draft_markdown text not null default '';

comment on column public.standup_updates.draft_markdown is
  'Markdown Standup Update body for this Workday (source of truth).';

update public.standup_updates
set draft_markdown = concat(
  '# Daily Standup — ', workday::text, E'\n\n',
  '## ✅ What I did', E'\n',
  coalesce(nullif(trim(yesterday_text), ''), '-'), E'\n\n',
  '## 🔨 Focusing on', E'\n',
  coalesce(nullif(trim(today_text), ''), '-'), E'\n\n',
  '## 🚧 Blockers', E'\n',
  coalesce(nullif(trim(blockers_text), ''), 'No blockers'), E'\n\n',
  '## 📊 Metrics / Notes', E'\n',
  '- PRs open:', E'\n',
  '- PRs merged:', E'\n',
  '- Tickets in progress:', E'\n\n',
  '---', E'\n',
  '*Time boxed: 5 min*'
)
where draft_markdown = '';

alter table public.standup_updates
  drop column yesterday_text,
  drop column today_text,
  drop column blockers_text;
