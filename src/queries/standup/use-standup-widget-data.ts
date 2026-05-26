import { useAuth } from '@/context/auth';
import { isStandupSummaryReady } from '@/features/standup/lib/compose-standup-markdown';
import { extractStandupSummary } from '@/features/standup/lib/parse-standup-markdown';
import { defaultTargetWorkday } from '@/features/standup/lib/workday/workday';
import { useProfileQuery } from '@/queries/profile/use-profile-query';
import { useStandupUpdateQuery } from '@/queries/standup/use-standup-update-query';
import { useRefreshOnFocus } from '@/queries/use-refresh-on-focus';
import * as React from 'react';

export type StandupWidgetData = {
  workday: ReturnType<typeof defaultTargetWorkday>;
  profile: NonNullable<ReturnType<typeof useProfileQuery>['data']> | null;
  draftMarkdown: string;
  hasStandup: boolean;
  copied: boolean;
  summaryExcerpt: string | null;
  summaryReady: boolean;
  loading: boolean;
  error: string | null;
};

export function useStandupWidgetData(): StandupWidgetData {
  const { session } = useAuth();
  const workday = defaultTargetWorkday();
  const profileQuery = useProfileQuery();
  const standupQuery = useStandupUpdateQuery(workday);

  useRefreshOnFocus(() => {
    void profileQuery.refetch();
    void standupQuery.refetch();
  });

  const loading =
    !session ||
    profileQuery.isLoading ||
    standupQuery.isLoading;

  const error = React.useMemo(() => {
    if (profileQuery.error instanceof Error) {
      return profileQuery.error.message;
    }
    if (standupQuery.error instanceof Error) {
      return standupQuery.error.message;
    }
    return null;
  }, [profileQuery.error, standupQuery.error]);

  const standup = standupQuery.data;
  const markdown = standup?.draft_markdown ?? '';
  const ready = isStandupSummaryReady(markdown);
  const summary = extractStandupSummary(markdown).trim();

  return {
    workday,
    profile: profileQuery.data ?? null,
    draftMarkdown: markdown,
    hasStandup: Boolean(markdown.trim()),
    copied: Boolean(standup?.copied_at),
    summaryReady: ready,
    summaryExcerpt:
      ready && summary.length > 0
        ? summary.length > 120
          ? `${summary.slice(0, 117)}…`
          : summary
        : null,
    loading,
    error,
  };
}
