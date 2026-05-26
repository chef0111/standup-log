import { useQuery } from '@tanstack/react-query';

import { useAuth } from '@/context/auth';
import { fetchStandupUpdate } from '@/queries/lib/standup/fetch-standup-update';
import type { StandupUpdateRow } from '@/queries/lib/standup/types';
import { isAuthReady, requireAuth } from '@/queries/lib/require-auth';
import { standupKeys } from '@/queries/keys';
import type { Workday } from '@/features/standup/types/workday';

type UseStandupUpdateQueryOptions = {
  enabled?: boolean;
};

export function useStandupUpdateQuery(
  workday: Workday,
  options?: UseStandupUpdateQueryOptions
) {
  const { supabase, session } = useAuth();
  const enabled =
    isAuthReady(supabase, session) && (options?.enabled ?? true);

  return useQuery({
    queryKey: standupKeys.update(workday),
    enabled,
    queryFn: async (): Promise<StandupUpdateRow | null> => {
      const auth = requireAuth(supabase, session);
      const { standup, error } = await fetchStandupUpdate(
        auth.supabase,
        workday
      );
      if (error) {
        throw new Error(error);
      }
      return standup;
    },
  });
}
