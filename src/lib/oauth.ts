import { AppError, categorizeError, userFacingMessage } from '@/lib/errors';
import { persistGitHubProviderToken } from '@/lib/github-token';
import { requireSupabase } from '@/utils/supabase';
import { makeRedirectUri } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';

void WebBrowser.maybeCompleteAuthSession();

function getOAuthReturnParams(input: string): { errorCode: string | null; params: Record<string, string> } {
  const url = new URL(input, 'https://phony.example');
  const params: Record<string, string> = Object.fromEntries(url.searchParams as Iterable<[string, string]>);
  if (url.hash) {
    new URLSearchParams(url.hash.replace(/^#/, '')).forEach((value, key) => {
      params[key] = value;
    });
  }
  const errorCode =
    params.error ?? params.error_description ?? params.errorCode ?? null;
  return { errorCode, params };
}

const redirectTo = makeRedirectUri({
  scheme: 'standuplog',
  path: 'auth/callback',
});

export function getOAuthRedirectUri(): string {
  return redirectTo;
}

export async function createSessionFromUrl(url: string): Promise<void> {
  const supabase = requireSupabase();
  const parsed = new URL(url, 'https://phony.example');

  const authCode = parsed.searchParams.get('code');
  if (authCode) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(authCode);
    if (error) {
      throw new AppError('auth', error.message);
    }
    await persistGitHubProviderToken(data.session?.provider_token);
    return;
  }

  const { params, errorCode } = getOAuthReturnParams(url);

  if (errorCode) {
    throw new AppError('auth', String(errorCode));
  }

  const access_token = typeof params.access_token === 'string' ? params.access_token : undefined;
  const refresh_token = typeof params.refresh_token === 'string' ? params.refresh_token : undefined;

  if (!access_token) {
    return;
  }

  await persistGitHubProviderToken(
    typeof params.provider_token === 'string' ? params.provider_token : undefined
  );

  const { error } = await supabase.auth.setSession({
    access_token,
    refresh_token: refresh_token ?? '',
  });

  if (error) {
    throw new AppError('auth', error.message);
  }
}

export async function signInWithGitHub(): Promise<void> {
  const supabase = requireSupabase();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo,
      skipBrowserRedirect: true,
      scopes: 'read:user user:email repo',
    },
  });

  if (error) {
    throw new AppError('auth', error.message);
  }

  const authUrl = data.url;
  if (!authUrl) {
    throw new AppError('auth', 'Missing OAuth URL');
  }

  const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectTo);

  if (result.type === 'cancel' || result.type === 'dismiss') {
    return;
  }

  if (result.type !== 'success' || !('url' in result) || !result.url) {
    throw new AppError('auth', 'Sign-in did not complete');
  }

  try {
    await createSessionFromUrl(result.url);
  } catch (e) {
    const cat = categorizeError(e);
    throw new AppError(cat, e instanceof Error ? e.message : userFacingMessage(cat));
  }
}
