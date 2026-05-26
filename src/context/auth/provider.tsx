import {
  clearGitHubProviderToken,
  persistGitHubProviderToken,
} from '@/features/auth/lib/github-token';
import { createSessionFromUrl } from '@/features/auth/lib/oauth';
import { identifyUser, resetAnalyticsUser, track } from '@/lib/analytics';
import { AppError, userFacingMessage } from '@/lib/errors';
import { clearQueryClient } from '@/queries/query-client';
import { getSupabase, isSupabaseConfigured } from '@/utils/supabase';
import type { Session } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';
import * as SplashScreen from 'expo-splash-screen';
import * as React from 'react';
import { AuthContext } from './context';

void SplashScreen.preventAutoHideAsync();

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const configured = isSupabaseConfigured();
  const supabase = React.useMemo(
    () => (configured ? getSupabase() : null),
    [configured]
  );

  const [session, setSession] = React.useState<Session | null>(null);
  const [loading, setLoading] = React.useState(configured);
  const [authError, setAuthError] = React.useState<string | null>(null);

  const clearAuthError = React.useCallback(() => {
    setAuthError(null);
  }, []);

  React.useEffect(() => {
    if (!supabase) {
      setLoading(false);
      void SplashScreen.hideAsync();
      return;
    }

    let cancelled = false;

    void supabase.auth.getSession().then(({ data }) => {
      if (cancelled) {
        return;
      }
      setSession(data.session);
      setLoading(false);
      void SplashScreen.hideAsync();
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      if (next?.provider_token) {
        void persistGitHubProviderToken(next.provider_token);
      }
      if (_event === 'SIGNED_IN' && next?.user) {
        identifyUser(next.user.id);
        track('github_oauth_success');
      }
      if (_event === 'SIGNED_OUT') {
        clearQueryClient();
        void clearGitHubProviderToken();
        resetAnalyticsUser();
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const processedOAuthUrls = React.useRef(new Set<string>());

  React.useEffect(() => {
    if (!supabase) {
      return;
    }

    const handleUrl = async (url: string | null | undefined) => {
      if (!url || !url.includes('auth/callback')) {
        return;
      }
      if (processedOAuthUrls.current.has(url)) {
        return;
      }
      processedOAuthUrls.current.add(url);
      try {
        await createSessionFromUrl(url);
        setAuthError(null);
      } catch (e) {
        processedOAuthUrls.current.delete(url);
        const message =
          e instanceof AppError ? e.message : userFacingMessage('auth');
        setAuthError(message);
        track('github_oauth_failure', {
          error_code: e instanceof AppError ? e.category : 'unknown',
        });
      }
    };

    void Linking.getInitialURL().then(handleUrl);
    const sub = Linking.addEventListener('url', (event) => {
      void handleUrl(event.url);
    });

    return () => {
      sub.remove();
    };
  }, [supabase]);

  const value = React.useMemo(
    () => ({
      supabase,
      session,
      loading,
      configured,
      authError,
      clearAuthError,
    }),
    [supabase, session, loading, configured, authError, clearAuthError]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
