import type { Session, SupabaseClient } from '@supabase/supabase-js';

export const PROFILE_HOME_COLUMNS =
  'github_login, avatar_url, onboarding_completed_at, selected_repositories, is_pro' as const;

export type ProfileHomeRow = {
  github_login: string | null;
  avatar_url: string | null;
  onboarding_completed_at: string | null;
  selected_repositories: unknown;
  is_pro: boolean;
};

function githubLoginFromSession(session: Session): string | null {
  const meta = session.user.user_metadata;
  if (typeof meta?.user_name === 'string' && meta.user_name.length > 0) {
    return meta.user_name;
  }
  if (typeof meta?.preferred_username === 'string' && meta.preferred_username.length > 0) {
    return meta.preferred_username;
  }
  return null;
}

function avatarUrlFromSession(session: Session): string | null {
  const meta = session.user.user_metadata;
  return typeof meta?.avatar_url === 'string' && meta.avatar_url.length > 0 ? meta.avatar_url : null;
}

/**
 * Loads the signed-in user's profile. If the row is missing (e.g. account predates the
 * `on_auth_user_created` trigger), creates it from GitHub session metadata.
 */
export async function fetchUserProfile(
  supabase: SupabaseClient,
  session: Session
): Promise<{ profile: ProfileHomeRow | null; error: string | null }> {
  const userId = session.user.id;

  const { data: existing, error: selectError } = await supabase
    .from('profiles')
    .select(PROFILE_HOME_COLUMNS)
    .eq('id', userId)
    .maybeSingle();

  if (selectError) {
    return { profile: null, error: selectError.message };
  }

  if (existing) {
    return { profile: existing as ProfileHomeRow, error: null };
  }

  const { data: created, error: insertError } = await supabase
    .from('profiles')
    .insert({
      id: userId,
      github_login: githubLoginFromSession(session),
      avatar_url: avatarUrlFromSession(session),
    })
    .select(PROFILE_HOME_COLUMNS)
    .single();

  if (insertError) {
    // Another request may have created the row; read again before failing.
    const { data: retry, error: retryError } = await supabase
      .from('profiles')
      .select(PROFILE_HOME_COLUMNS)
      .eq('id', userId)
      .maybeSingle();

    if (retryError) {
      return { profile: null, error: retryError.message };
    }
    if (retry) {
      return { profile: retry as ProfileHomeRow, error: null };
    }
    return { profile: null, error: insertError.message };
  }

  return { profile: created as ProfileHomeRow, error: null };
}
