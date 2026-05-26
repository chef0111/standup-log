import { useQuery } from '@tanstack/react-query';

import { useAuth } from '@/context/auth';
import {
  fetchActivityCommitsForWeek,
  fetchStandupsForWeek,
} from '@/queries/lib/weekly/fetch-week-data';
import { isAuthReady, requireAuth } from '@/queries/lib/require-auth';
import { weeklyKeys } from '@/queries/keys';
import type { Workday } from '@/features/standup/types/workday';
import { useRefreshOnFocus } from '@/queries/use-refresh-on-focus';

export function useWeekStandupsQuery(weekStart: Workday, weekEnd: Workday) {
  const { supabase, session } = useAuth();
  const enabled = isAuthReady(supabase, session);

  const query = useQuery({
    queryKey: weeklyKeys.standups(weekStart, weekEnd),
    enabled,
    queryFn: async () => {
      const auth = requireAuth(supabase, session);
      const { standups, error } = await fetchStandupsForWeek(
        auth.supabase,
        weekStart,
        weekEnd
      );
      if (error) {
        throw new Error(error);
      }
      return standups;
    },
  });

  useRefreshOnFocus(() => {
    if (enabled) {
      void query.refetch();
    }
  });

  return query;
}

export function useWeekCommitsQuery(weekStart: Workday, weekEnd: Workday) {
  const { supabase, session } = useAuth();
  const enabled = isAuthReady(supabase, session);

  const query = useQuery({
    queryKey: weeklyKeys.commits(weekStart, weekEnd),
    enabled,
    queryFn: async () => {
      const auth = requireAuth(supabase, session);
      const { commits, error } = await fetchActivityCommitsForWeek(
        auth.supabase,
        weekStart,
        weekEnd
      );
      if (error) {
        throw new Error(error);
      }
      return commits;
    },
  });

  useRefreshOnFocus(() => {
    if (enabled) {
      void query.refetch();
    }
  });

  return query;
}
