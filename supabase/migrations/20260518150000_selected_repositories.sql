-- Selected repositories (Phase 2) + free-tier cap at DB layer.

alter table public.profiles
  add column if not exists selected_repositories jsonb not null default '[]'::jsonb;

alter table public.profiles
  add column if not exists is_pro boolean not null default false;

alter table public.profiles
  add constraint profiles_selected_repositories_is_array
  check (jsonb_typeof(selected_repositories) = 'array');

alter table public.profiles
  add constraint profiles_free_repo_cap
  check (
    is_pro = true
    or jsonb_array_length(selected_repositories) <= 3
  );

comment on column public.profiles.selected_repositories is 'Explicitly chosen GitHub repositories (metadata only; see CONTEXT Selected Repository).';
comment on column public.profiles.is_pro is 'Stub until billing; when false, max three selected repositories.';
