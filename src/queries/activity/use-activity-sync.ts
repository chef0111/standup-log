import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as React from 'react';

import { useAuth } from '@/context/auth';
import {
  assertActivitySyncAllowed,
  HISTORY_CAP_MESSAGE,
} from '@/features/entitlements/lib/entitlements';
import { resolveGithubLogin } from '@/features/profile/lib/profile';
import { parseSelectedRepositories } from '@/features/repositories/types/repository';
import {
  getActivityWorkdayCache,
  setActivityWorkdayCache,
} from '@/features/standup/lib/activity/activity-workday-cache';
import { isGithubRateLimitError } from '@/features/standup/lib/activity/github-rate-limit';
import { patchCommitWorkTypeInList } from '@/features/standup/lib/activity/patch-commit-work-type';
import type { StoredWorkType } from '@/features/standup/lib/activity/stored-work-type';
import type { ActivityCommitRow } from '@/features/standup/types/activity-commit';
import type { Workday } from '@/features/standup/types/workday';
import { useGitHubAccessToken } from '@/hooks/use-github-access-token';
import { categorizeError, userFacingMessage } from '@/lib/errors';
import { fetchUserProfile } from '@/queries/lib/profile/fetch-user-profile';
import {
  fetchActivityCommits,
  syncActivityForWorkday,
} from '@/queries/lib/activity/sync-activity';
import { updateActivityCommitWorkType } from '@/queries/lib/activity/update-activity-commit-work-type';
import { isAuthReady, requireAuth } from '@/queries/lib/require-auth';
import { activityKeys } from '@/queries/keys';

export type ActivityQueryData = {
  commits: ActivityCommitRow[];
  error: string | null;
  githubSynced: boolean;
  rateLimitResetAt: number | null;
};

function syncErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return userFacingMessage(categorizeError(error));
}

function toActivityQueryData(
  input: {
    commits: ActivityCommitRow[];
    error: string | null;
    githubSynced: boolean;
  },
  rateLimitResetAt: number | null = null
): ActivityQueryData {
  return {
    commits: input.commits,
    error: input.error,
    githubSynced: input.githubSynced,
    rateLimitResetAt,
  };
}

function writeActivityState(
  queryClient: ReturnType<typeof useQueryClient>,
  workday: Workday,
  data: ActivityQueryData
) {
  queryClient.setQueryData(activityKeys.workday(workday), data);
  setActivityWorkdayCache(workday, {
    commits: data.commits,
    error: data.error,
    githubSynced: data.githubSynced,
  });
}

export function useActivitySync(workday: Workday, isPro: boolean) {
  const { supabase, session } = useAuth();
  const queryClient = useQueryClient();
  const { token, loading: tokenLoading } = useGitHubAccessToken();
  const sessionCache = getActivityWorkdayCache(workday);

  const activityQuery = useQuery({
    queryKey: activityKeys.workday(workday),
    enabled: isAuthReady(supabase, session) && !sessionCache,
    placeholderData: sessionCache
      ? toActivityQueryData(sessionCache)
      : undefined,
    queryFn: async (): Promise<ActivityQueryData> => {
      const auth = requireAuth(supabase, session);
      const { commits, error } = await fetchActivityCommits(
        auth.supabase,
        workday
      );
      return toActivityQueryData({
        commits,
        error,
        githubSynced: false,
      });
    },
  });

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

      try {
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
        const githubLogin = resolveGithubLogin(profile.github_login, session);

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

        return await syncActivityForWorkday({
          supabase,
          token,
          userId: session.user.id,
          workday: targetWorkday,
          repos,
          githubUserId: profile.github_user_id ?? null,
          githubLogin,
        });
      } catch (e) {
        if (isGithubRateLimitError(e)) {
          return {
            commits: [] as ActivityCommitRow[],
            error: e.message,
            rateLimitResetAt: e.resetAt,
          };
        }
        return {
          commits: [] as ActivityCommitRow[],
          error: syncErrorMessage(e),
          rateLimitResetAt: null,
        };
      }
    },
    [isPro, session, supabase, token, tokenLoading]
  );

  const syncMutation = useMutation({
    mutationFn: async (targetWorkday: Workday) => {
      const result = await syncFromGitHub(targetWorkday);
      if (result.error && result.commits.length === 0 && !result.rateLimitResetAt) {
        throw new Error(result.error);
      }
      return result;
    },
    onSuccess: (result, targetWorkday) => {
      writeActivityState(
        queryClient,
        targetWorkday,
        toActivityQueryData(
          {
            commits: result.commits,
            error: result.error,
            githubSynced: true,
          },
          result.rateLimitResetAt ?? null
        )
      );
    },
    onError: (error, targetWorkday) => {
      const current =
        queryClient.getQueryData<ActivityQueryData>(
          activityKeys.workday(targetWorkday)
        ) ??
        toActivityQueryData({ commits: [], error: null, githubSynced: false });
      writeActivityState(
        queryClient,
        targetWorkday,
        toActivityQueryData(
          {
            commits: current.commits,
            error: syncErrorMessage(error),
            githubSynced: true,
          },
          current.rateLimitResetAt
        )
      );
    },
  });

  const { mutateAsync: syncActivity, isPending: syncing } = syncMutation;

  const updateWorkTypeMutation = useMutation({
    mutationFn: async ({
      commitId,
      workType,
    }: {
      commitId: string;
      workType: StoredWorkType;
    }) => {
      const auth = requireAuth(supabase, session);
      const { error } = await updateActivityCommitWorkType(
        auth.supabase,
        auth.session.user.id,
        commitId,
        workType
      );
      if (error) {
        throw new Error(error);
      }
    },
    onMutate: async ({ commitId, workType }) => {
      await queryClient.cancelQueries({ queryKey: activityKeys.workday(workday) });
      const previous = queryClient.getQueryData<ActivityQueryData>(
        activityKeys.workday(workday)
      );
      if (previous) {
        const optimisticCommits = patchCommitWorkTypeInList(
          previous.commits,
          commitId,
          workType
        );
        writeActivityState(
          queryClient,
          workday,
          toActivityQueryData(
            {
              commits: optimisticCommits,
              error: previous.error,
              githubSynced: previous.githubSynced,
            },
            previous.rateLimitResetAt
          )
        );
      }
      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        writeActivityState(queryClient, workday, context.previous);
      }
    },
  });

  React.useEffect(() => {
    if (!supabase) {
      return;
    }

    const cached = getActivityWorkdayCache(workday);
    if (cached?.githubSynced) {
      return;
    }

    if (!session || !token || tokenLoading) {
      if (cached) {
        writeActivityState(
          queryClient,
          workday,
          toActivityQueryData(cached)
        );
      }
      return;
    }

    if (syncing) {
      return;
    }

    void syncActivity(workday);
  }, [
    isPro,
    queryClient,
    session,
    supabase,
    syncActivity,
    syncing,
    token,
    tokenLoading,
    workday,
  ]);

  React.useEffect(() => {
    if (!activityQuery.data || sessionCache) {
      return;
    }
    writeActivityState(queryClient, workday, activityQuery.data);
  }, [activityQuery.data, queryClient, sessionCache, workday]);

  const data =
    activityQuery.data ??
    (sessionCache ? toActivityQueryData(sessionCache) : undefined);

  const updateCommitWorkType = React.useCallback(
    async (commitId: string, workType: StoredWorkType) => {
      try {
        await updateWorkTypeMutation.mutateAsync({ commitId, workType });
        return { error: null as string | null };
      } catch (error) {
        return {
          error: error instanceof Error ? error.message : 'Update failed.',
        };
      }
    },
    [updateWorkTypeMutation]
  );

  const refresh = React.useCallback(async () => {
    try {
      await syncActivity(workday);
    } catch {
      // Error state is written in mutation handlers.
    }
  }, [syncActivity, workday]);

  return {
    commits: data?.commits ?? [],
    syncing,
    loading:
      activityQuery.isLoading &&
      !sessionCache &&
      !getActivityWorkdayCache(workday)?.githubSynced,
    error: data?.error ?? null,
    rateLimitResetAt: data?.rateLimitResetAt ?? null,
    token,
    tokenLoading,
    refresh,
    updateCommitWorkType,
  };
}
