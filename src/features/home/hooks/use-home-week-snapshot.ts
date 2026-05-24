import { useAuth } from '@/context/auth';
import {
  fetchActivityCommitsForWeek,
  fetchStandupsForWeek,
} from '@/features/standup/lib/weekly/fetch-standups-for-week';
import { getCurrentWeekBounds } from '@/features/standup/lib/weekly/week-bounds';
import { useFocusEffect } from '@react-navigation/native';
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
  const { supabase } = useAuth();
  const bounds = React.useMemo(() => getCurrentWeekBounds(), []);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [commitCount, setCommitCount] = React.useState(0);
  const [copiedCount, setCopiedCount] = React.useState(0);

  const weekLabel = formatWeekLabel(bounds.weekStart, bounds.weekEnd);

  useFocusEffect(
    React.useCallback(() => {
      if (!supabase) {
        setLoading(false);
        return;
      }

      let cancelled = false;

      async function load() {
        setLoading(true);
        setError(null);

        const [
          { commits, error: commitsError },
          { standups, error: standupsError },
        ] = await Promise.all([
          fetchActivityCommitsForWeek(
            supabase!,
            bounds.weekStart,
            bounds.weekEnd
          ),
          fetchStandupsForWeek(supabase!, bounds.weekStart, bounds.weekEnd),
        ]);

        if (cancelled) {
          return;
        }

        const loadError = commitsError ?? standupsError;
        if (loadError) {
          setError(loadError);
          setLoading(false);
          return;
        }

        setCommitCount(commits.length);
        setCopiedCount(standups.filter((s) => s.copied_at).length);
        setLoading(false);
      }

      void load();

      return () => {
        cancelled = true;
      };
    }, [bounds.weekEnd, bounds.weekStart, supabase])
  );

  return {
    weekLabel,
    commitCount,
    copiedCount,
    loading,
    error,
  };
}
