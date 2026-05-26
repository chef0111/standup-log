import { useQuery } from '@tanstack/react-query';

import { useAuth } from '@/context/auth';
import { getWorkdayHistoryBounds } from '@/features/entitlements/lib/entitlements';
import {
  mapStandupUpdateToHistoryItem,
  type StandupHistoryItem,
} from '@/features/standup/lib/history/standup-history-item';
import { fetchStandupsInHistory } from '@/queries/lib/standup/fetch-standups-in-history';
import { isAuthReady, requireAuth } from '@/queries/lib/require-auth';
import { standupKeys } from '@/queries/keys';
import type { WorkdayPickerBounds } from '@/features/standup/lib/workday/workday';
import { useProfileQuery } from '@/queries/profile/use-profile-query';
import { useRefreshOnFocus } from '@/queries/use-refresh-on-focus';

export type StandupHistoryQueryData = {
  items: StandupHistoryItem[];
  pickerBounds: WorkdayPickerBounds;
  isPro: boolean;
};

export function useStandupHistoryQuery() {
  const { supabase, session } = useAuth();
  const profileQuery = useProfileQuery();
  const isPro = Boolean(profileQuery.data?.is_pro);
  const pickerBounds = getWorkdayHistoryBounds({ isPro });
  const enabled = isAuthReady(supabase, session) && profileQuery.isSuccess;

  const query = useQuery({
    queryKey: standupKeys.history(
      pickerBounds.minimumWorkday,
      pickerBounds.maximumWorkday
    ),
    enabled,
    queryFn: async (): Promise<StandupHistoryQueryData> => {
      const auth = requireAuth(supabase, session);
      const { standups, error } = await fetchStandupsInHistory(
        auth.supabase,
        pickerBounds.minimumWorkday,
        pickerBounds.maximumWorkday
      );
      if (error) {
        throw new Error(error);
      }
      return {
        items: standups.map(mapStandupUpdateToHistoryItem),
        pickerBounds,
        isPro,
      };
    },
  });

  useRefreshOnFocus(() => {
    if (enabled) {
      void query.refetch();
    }
  });

  return query;
}
