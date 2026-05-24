import { persistGitHubProviderToken } from '@/features/auth/lib/github-token';
import { AppError, categorizeError, userFacingMessage } from '@/lib/errors';
import { requireSupabase } from '@/utils/supabase';
import type { Session, SupabaseClient } from '@supabase/supabase-js';
import { makeRedirectUri } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';

void WebBrowser.maybeCompleteAuthSession();

/** Android often closes the auth session before `result.url` is set; wait for deep-link session. */
function waitForAuthSession(
  supabase: SupabaseClient,
  timeoutMs = 4000
): Promise<Session | null> {
  return new Promise((resolve) => {
    let settled = false;

    const finish = (session: Session | null) => {
      if (settled) {
        return;
      }
      settled = true;
      subscription.unsubscribe();
      clearTimeout(timer);
      resolve(session);
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        finish(session);
      }
    });

    void supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        finish(data.session);
      }
    });

    const timer = setTimeout(() => finish(null), timeoutMs);
  });
}

function getOAuthReturnParams(input: string): {
  errorCode: string | null;
  params: Record<string, string>;
} {
  const url = new URL(input, 'https://phony.example');
  const params: Record<string, string> = Object.fromEntries(
    url.searchParams as Iterable<[string, string]>
  );
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
    const { data, error } =
      await supabase.auth.exchangeCodeForSession(authCode);
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

  const access_token =
    typeof params.access_token === 'string' ? params.access_token : undefined;
  const refresh_token =
    typeof params.refresh_token === 'string' ? params.refresh_token : undefined;

  if (!access_token) {
    return;
  }

  await persistGitHubProviderToken(
    typeof params.provider_token === 'string'
      ? params.provider_token
      : undefined
  );

  const { error } = await supabase.auth.setSession({
    access_token,
    refresh_token: refresh_token ?? '',
  });

  if (error) {
    throw new AppError('auth', error.message);
  }
}

export async function signInWithGitHub(): Promise<Session | null> {
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

  if (result.type === 'success' && 'url' in result && result.url) {
    try {
      await createSessionFromUrl(result.url);
    } catch (e) {
      const cat = categorizeError(e);
      throw new AppError(
        cat,
        e instanceof Error ? e.message : userFacingMessage(cat)
      );
    }
    const { data: sessionData } = await supabase.auth.getSession();
    return sessionData.session;
  }

  if (result.type === 'cancel') {
    return null;
  }

  if (result.type === 'dismiss') {
    const session = await waitForAuthSession(supabase);
    await persistGitHubProviderToken(session?.provider_token);
    return session;
  }

  throw new AppError('auth', 'Sign-in did not complete');
}
