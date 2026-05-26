import { getCurrentWeekBounds } from '@/features/standup/lib/weekly/week-bounds';
import {
  useWeekCommitsQuery,
  useWeekStandupsQuery,
} from '@/queries/weekly/use-week-queries';
import * as React from 'react';

function formatWeekLabel(weekStart: string, weekEnd: string): string {
  const fmt = (iso: string) => {
    const [y, m, d] = iso.split('-').map(Number);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
    }).format(new Date(y, m - 1, d));
  };
  return `${fmt(weekStart)} – ${fmt(weekEnd)}`;
}

export function useHomeWeekSnapshot() {
  const bounds = React.useMemo(() => getCurrentWeekBounds(), []);
  const weekLabel = formatWeekLabel(bounds.weekStart, bounds.weekEnd);
  const commitsQuery = useWeekCommitsQuery(bounds.weekStart, bounds.weekEnd);
  const standupsQuery = useWeekStandupsQuery(bounds.weekStart, bounds.weekEnd);

  const loading = commitsQuery.isLoading || standupsQuery.isLoading;
  const error =
    (commitsQuery.error instanceof Error
      ? commitsQuery.error.message
      : null) ??
    (standupsQuery.error instanceof Error ? standupsQuery.error.message : null);

  const commitCount = commitsQuery.data?.length ?? 0;
  const copiedCount =
    standupsQuery.data?.filter((s) => s.copied_at).length ?? 0;

  return {
    weekLabel,
    commitCount,
    copiedCount,
    loading,
    error,
  };
}
