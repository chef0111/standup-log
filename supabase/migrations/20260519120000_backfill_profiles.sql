-- Users who signed up before profiles + trigger existed have no public.profiles row.

insert into public.profiles (id, github_login, avatar_url)
select
  u.id,
  coalesce(u.raw_user_meta_data->>'user_name', u.raw_user_meta_data->>'preferred_username'),
  u.raw_user_meta_data->>'avatar_url'
from auth.users u
where not exists (
  select 1
  from public.profiles p
  where p.id = u.id
);
