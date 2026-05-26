import type { Session } from '@supabase/supabase-js';

export {
  PROFILE_HOME_COLUMNS,
  type ProfileHomeRow,
} from '@/queries/lib/profile/types';

function githubLoginFromSession(session: Session): string | null {
  const meta = session.user.user_metadata;
  if (typeof meta?.user_name === 'string' && meta.user_name.length > 0) {
    return meta.user_name;
  }
  if (
    typeof meta?.preferred_username === 'string' &&
    meta.preferred_username.length > 0
  ) {
    return meta.preferred_username;
  }
  return null;
}

export function resolveGithubLogin(
  profileLogin: string | null | undefined,
  session: Session
): string | null {
  if (typeof profileLogin === 'string' && profileLogin.length > 0) {
    return profileLogin;
  }
  return githubLoginFromSession(session);
}
