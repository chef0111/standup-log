import { getSupabase, isSupabaseConfigured } from '@/utils/supabase';
import type { Session } from '@supabase/supabase-js';
import { Platform } from 'react-native';

const STORAGE_KEY = 'standup-log.github_provider_token';

async function readStoredToken(): Promise<string | null> {
  if (Platform.OS === 'web') {
    if (typeof window === 'undefined') {
      return null;
    }
    return window.localStorage.getItem(STORAGE_KEY);
  }
  const AsyncStorage = (
    await import('@react-native-async-storage/async-storage')
  ).default;
  return AsyncStorage.getItem(STORAGE_KEY);
}

async function writeStoredToken(token: string): Promise<void> {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, token);
    }
    return;
  }
  const AsyncStorage = (
    await import('@react-native-async-storage/async-storage')
  ).default;
  await AsyncStorage.setItem(STORAGE_KEY, token);
}

export async function clearGitHubProviderToken(): Promise<void> {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(STORAGE_KEY);
    }
    return;
  }
  const AsyncStorage = (
    await import('@react-native-async-storage/async-storage')
  ).default;
  await AsyncStorage.removeItem(STORAGE_KEY);
}

/** Persist GitHub OAuth token from callback URL or session (Supabase emits it once). */
export async function persistGitHubProviderToken(
  token: string | null | undefined
): Promise<void> {
  if (!token) {
    return;
  }
  await writeStoredToken(token);
}

/**
 * Resolves the GitHub API access token for the signed-in user.
 * `setSession` from the callback URL omits `provider_token`, so we also read from storage.
 */
async function refreshSessionProviderToken(): Promise<string | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }
  const supabase = getSupabase();
  if (!supabase) {
    return null;
  }
  const { data, error } = await supabase.auth.refreshSession();
  if (error || !data.session?.provider_token) {
    return null;
  }
  await persistGitHubProviderToken(data.session.provider_token);
  return data.session.provider_token;
}

export async function resolveGitHubAccessToken(
  session: Session | null
): Promise<string | null> {
  if (session?.provider_token) {
    await persistGitHubProviderToken(session.provider_token);
    return session.provider_token;
  }

  const stored = await readStoredToken();
  if (stored) {
    return stored;
  }

  if (session) {
    return refreshSessionProviderToken();
  }

  return null;
}
