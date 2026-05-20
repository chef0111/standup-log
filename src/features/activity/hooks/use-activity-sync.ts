import {
  getActivityWorkdayCache,
  setActivityWorkdayCache,
} from '@/features/activity/lib/activity-workday-cache';
import {
  fetchActivityCommits,
  syncActivityForWorkday,
} from '@/features/activity/lib/sync-activity';
import type { ActivityCommitRow } from '@/features/activity/types/activity-commit';
import { useAuth } from '@/features/auth';
import {
  assertActivitySyncAllowed,
  HISTORY_CAP_MESSAGE,
} from '@/features/entitlements';
import { fetchUserProfile } from '@/features/profile';
import { parseSelectedRepositories } from '@/features/repositories';
import type { Workday } from '@/features/workday/types/workday';
import { isGithubRateLimitError } from '@/features/activity/lib/github-rate-limit';
import { useGitHubAccessToken } from '@/hooks/use-github-access-token';
import * as React from 'react';

function readCachedCommits(workday: Workday): ActivityCommitRow[] {
  return getActivityWorkdayCache(workday)?.commits ?? [];
}

function readCachedError(workday: Workday): string | null {
  return getActivityWorkdayCache(workday)?.error ?? null;
}

export function useActivitySync(workday: Workday, isPro: boolean) {
  const { supabase, session } = useAuth();
  const { token, loading: tokenLoading } = useGitHubAccessToken();
  const [commits, setCommits] = React.useState<ActivityCommitRow[]>(() =>
    readCachedCommits(workday)
  );
  const [syncing, setSyncing] = React.useState(false);
  const [loading, setLoading] = React.useState(
    () => !getActivityWorkdayCache(workday)?.githubSynced
  );
  const [error, setError] = React.useState<string | null>(() =>
    readCachedError(workday)
  );
  const [rateLimitResetAt, setRateLimitResetAt] = React.useState<number | null>(
    null
  );

  const syncFromGitHub = React.useCallback(
    async (targetWorkday: Workday) => {
      if (!supabase || !session || !token) {
        return {
          commits: [] as ActivityCommitRow[],
          error: tokenLoading
            ? null
            : 'GitHub access is not available. Reconnect GitHub to sync activity.',
          rateLimitResetAt: null,
        };
      }

      const { profile, error: profileError } = await fetchUserProfile(
        supabase,
        session
      );
      if (profileError || !profile) {
        return {
          commits: [] as ActivityCommitRow[],
          error: profileError ?? 'Could not load profile.',
          rateLimitResetAt: null,
        };
      }

      const repos = parseSelectedRepositories(profile.selected_repositories);

      const guard = assertActivitySyncAllowed(
        targetWorkday,
        isPro || Boolean(profile.is_pro)
      );
      if (!guard.allowed) {
        const { commits: stored, error: loadError } =
          await fetchActivityCommits(supabase, targetWorkday);
        return {
          commits: stored,
          error: loadError ?? HISTORY_CAP_MESSAGE,
          rateLimitResetAt: null,
        };
      }

      try {
        return await syncActivityForWorkday({
          supabase,
          token,
          userId: session.user.id,
          workday: targetWorkday,
          repos,
          githubUserId: profile.github_user_id ?? null,
          githubLogin: profile.github_login,
        });
      } catch (e) {
        if (isGithubRateLimitError(e)) {
          return {
            commits: [] as ActivityCommitRow[],
            error: e.message,
            rateLimitResetAt: e.resetAt,
          };
        }
        throw e;
      }
    },
    [isPro, session, supabase, token, tokenLoading]
  );

  React.useLayoutEffect(() => {
    const cached = getActivityWorkdayCache(workday);
    if (cached) {
      setCommits(cached.commits);
      setError(cached.error);
      setLoading(!cached.githubSynced);
      return;
    }

    setCommits([]);
    setError(null);
    setLoading(true);
  }, [workday]);

  React.useEffect(() => {
    let cancelled = false;

    async function loadForWorkday() {
      if (!supabase) {
        setLoading(false);
        return;
      }

      const cached = getActivityWorkdayCache(workday);
      if (cached?.githubSynced) {
        return;
      }

      if (cached) {
        setCommits(cached.commits);
        setError(cached.error);
        setLoading(false);
      } else {
        setLoading(true);
        setError(null);
      }

      if (cached) {
        if (!session || !token || tokenLoading) {
          return;
        }

        setSyncing(true);
        const syncResult = await syncFromGitHub(workday);
        if (cancelled) {
          return;
        }

        setCommits(syncResult.commits);
        setError(syncResult.error);
        setRateLimitResetAt(syncResult.rateLimitResetAt ?? null);
        setSyncing(false);
        setActivityWorkdayCache(workday, {
          commits: syncResult.commits,
          error: syncResult.error,
          githubSynced: true,
        });
        return;
      }

      const { commits: stored, error: loadError } = await fetchActivityCommits(
        supabase,
        workday
      );
      if (cancelled) {
        return;
      }

      setCommits(stored);
      setError(loadError);
      setLoading(false);

      if (!session || !token || tokenLoading) {
        setActivityWorkdayCache(workday, {
          commits: stored,
          error: loadError,
          githubSynced: false,
        });
        return;
      }

      setSyncing(true);
      const syncResult = await syncFromGitHub(workday);
      if (cancelled) {
        return;
      }

      setCommits(syncResult.commits);
      setError(syncResult.error);
      setRateLimitResetAt(syncResult.rateLimitResetAt ?? null);
      setSyncing(false);
      setActivityWorkdayCache(workday, {
        commits: syncResult.commits,
        error: syncResult.error,
        githubSynced: true,
      });
    }

    void loadForWorkday();

    return () => {
      cancelled = true;
    };
  }, [isPro, session, supabase, syncFromGitHub, token, tokenLoading, workday]);

  const refresh = React.useCallback(async () => {
    setSyncing(true);
    setError(null);

    const syncResult = await syncFromGitHub(workday);

    setCommits(syncResult.commits);
    setError(syncResult.error);
    setRateLimitResetAt(syncResult.rateLimitResetAt ?? null);
    setSyncing(false);
    setActivityWorkdayCache(workday, {
      commits: syncResult.commits,
      error: syncResult.error,
      githubSynced: true,
    });
  }, [syncFromGitHub, workday]);

  return {
    commits,
    syncing,
    loading,
    error,
    rateLimitResetAt,
    token,
    tokenLoading,
    refresh,
  };
}
