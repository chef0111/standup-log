import { getSupabase, isSupabaseConfigured } from '@/utils/supabase';
import type { Session, SupabaseClient } from '@supabase/supabase-js';
import * as SplashScreen from 'expo-splash-screen';
import * as React from 'react';

void SplashScreen.preventAutoHideAsync();

type AuthContextValue = {
  supabase: SupabaseClient | null;
  session: Session | null;
  loading: boolean;
  configured: boolean;
};

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const configured = isSupabaseConfigured();
  const supabase = React.useMemo(() => (configured ? getSupabase() : null), [configured]);

  const [session, setSession] = React.useState<Session | null>(null);
  const [loading, setLoading] = React.useState(configured);

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
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const value = React.useMemo(
    () => ({ supabase, session, loading, configured }),
    [supabase, session, loading, configured]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = React.useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
