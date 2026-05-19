import {
  fetchActivityCommits,
  syncActivityForWorkday,
} from '@/features/activity/lib/sync-activity';
import type { ActivityCommitRow } from '@/features/activity/types/activity-commit';
import { useAuth } from '@/features/auth';
import { fetchUserProfile } from '@/features/profile';
import { parseSelectedRepositories } from '@/features/repositories';
import type { Workday } from '@/features/workday/types/workday';
import { useGitHubAccessToken } from '@/hooks/use-github-access-token';
import * as React from 'react';

export function useActivitySync(workday: Workday) {
  const { supabase, session } = useAuth();
  const { token, loading: tokenLoading } = useGitHubAccessToken();
  const [commits, setCommits] = React.useState<ActivityCommitRow[]>([]);
  const [syncing, setSyncing] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const loadStored = React.useCallback(async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const { commits: rows, error: loadError } = await fetchActivityCommits(
      supabase,
      workday
    );
    setCommits(rows);
    setError(loadError);
    setLoading(false);
  }, [supabase, workday]);

  React.useEffect(() => {
    void loadStored();
  }, [loadStored]);

  const refresh = React.useCallback(async () => {
    if (!supabase || !session || !token) {
      setError(
        tokenLoading
          ? null
          : 'GitHub access is not available. Reconnect GitHub to sync activity.'
      );
      return;
    }

    setSyncing(true);
    setError(null);

    const { profile, error: profileError } = await fetchUserProfile(
      supabase,
      session
    );
    if (profileError || !profile) {
      setError(profileError ?? 'Could not load profile.');
      setSyncing(false);
      return;
    }

    const repos = parseSelectedRepositories(profile.selected_repositories);
    const { commits: synced, error: syncError } = await syncActivityForWorkday({
      supabase,
      token,
      userId: session.user.id,
      workday,
      repos,
      githubUserId: profile.github_user_id ?? null,
      githubLogin: profile.github_login,
    });

    setCommits(synced);
    setError(syncError);
    setSyncing(false);
  }, [supabase, session, token, tokenLoading, workday]);

  return {
    commits,
    syncing,
    loading,
    error,
    token,
    tokenLoading,
    refresh,
    reloadStored: loadStored,
  };
}
