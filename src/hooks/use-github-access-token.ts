import { useAuth } from '@/context/auth';
import { resolveGitHubAccessToken } from '@/features/auth/lib/github-token';
import * as React from 'react';

export function useGitHubAccessToken(): {
  token: string | null;
  loading: boolean;
  refresh: () => void;
} {
  const { session } = useAuth();
  const [token, setToken] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [version, setVersion] = React.useState(0);

  const refresh = React.useCallback(() => {
    setVersion((v) => v + 1);
  }, []);

  React.useEffect(() => {
    let cancelled = false;
    setLoading(true);

    void resolveGitHubAccessToken(session).then((resolved) => {
      if (!cancelled) {
        setToken(resolved);
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [session, version]);

  return { token, loading, refresh };
}
