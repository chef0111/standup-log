import type { CopyFormat } from '@/features/standup/lib/format-standup';
import type { Workday } from '@/features/standup/types/workday';
import type { Session, SupabaseClient } from '@supabase/supabase-js';

export const PROFILE_HOME_COLUMNS =
  'github_login, avatar_url, github_user_id, onboarding_completed_at, selected_repositories, is_pro, default_copy_format, current_streak, longest_streak, last_streak_workday, reminder_enabled, reminder_time_local' as const;

export type ProfileHomeRow = {
  github_login: string | null;
  avatar_url: string | null;
  github_user_id: number | null;
  onboarding_completed_at: string | null;
  selected_repositories: unknown;
  is_pro: boolean;
  default_copy_format: CopyFormat;
  current_streak: number;
  longest_streak: number;
  last_streak_workday: Workday | null;
  reminder_enabled: boolean;
  reminder_time_local: string;
};

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

function avatarUrlFromSession(session: Session): string | null {
  const meta = session.user.user_metadata;
  return typeof meta?.avatar_url === 'string' && meta.avatar_url.length > 0
    ? meta.avatar_url
    : null;
}

function githubUserIdFromSession(session: Session): number | null {
  const githubIdentity = session.user.identities?.find(
    (identity) => identity.provider === 'github'
  );
  if (githubIdentity?.id) {
    const parsed = Number(githubIdentity.id);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  const sub = session.user.user_metadata?.sub;
  if (typeof sub === 'string' || typeof sub === 'number') {
    const parsed = Number(sub);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return null;
}

async function syncGithubUserIdIfNeeded(
  supabase: SupabaseClient,
  userId: string,
  profile: ProfileHomeRow,
  session: Session
): Promise<ProfileHomeRow> {
  if (profile.github_user_id != null) {
    return profile;
  }
  const githubUserId = githubUserIdFromSession(session);
  if (githubUserId == null) {
    return profile;
  }
  const { data, error } = await supabase
    .from('profiles')
    .update({ github_user_id: githubUserId })
    .eq('id', userId)
    .select(PROFILE_HOME_COLUMNS)
    .single();
  if (error || !data) {
    return { ...profile, github_user_id: githubUserId };
  }
  return data as ProfileHomeRow;
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
    const synced = await syncGithubUserIdIfNeeded(
      supabase,
      userId,
      existing as ProfileHomeRow,
      session
    );
    return { profile: synced, error: null };
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
      const synced = await syncGithubUserIdIfNeeded(
        supabase,
        userId,
        retry as ProfileHomeRow,
        session
      );
      return { profile: synced, error: null };
    }
    return { profile: null, error: insertError.message };
  }

  const createdProfile = created as ProfileHomeRow;
  const synced = await syncGithubUserIdIfNeeded(
    supabase,
    userId,
    createdProfile,
    session
  );
  return { profile: synced, error: null };
}
