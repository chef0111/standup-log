import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useAuth } from '@/context/auth';
import { getWorkdayHistoryBounds } from '@/features/entitlements/lib/entitlements';
import { deleteStandupUpdate } from '@/queries/lib/standup/delete-standup-update';
import type { ProfileHomeRow } from '@/queries/lib/profile/types';
import { requireAuth } from '@/queries/lib/require-auth';
import { profileKeys, standupKeys } from '@/queries/keys';
import type { Workday } from '@/features/standup/types/workday';

import { invalidateStandupAfterWrite } from './invalidate-standup-cache';
import type { StandupHistoryQueryData } from './use-standup-history-query';

type DeleteStandupContext = {
  previous: StandupHistoryQueryData | undefined;
  historyKey: ReturnType<typeof standupKeys.history>;
};

export function useDeleteStandupMutation() {
  const { supabase, session } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (workday: Workday) => {
      const auth = requireAuth(supabase, session);
      const { error } = await deleteStandupUpdate(auth.supabase, workday);
      if (error) {
        throw new Error(error);
      }
    },
    onMutate: async (workday): Promise<DeleteStandupContext> => {
      const profile = queryClient.getQueryData<ProfileHomeRow>(
        profileKeys.current()
      );
      const isPro = Boolean(profile?.is_pro);
      const pickerBounds = getWorkdayHistoryBounds({ isPro });
      const historyKey = standupKeys.history(
        pickerBounds.minimumWorkday,
        pickerBounds.maximumWorkday
      );

      await queryClient.cancelQueries({ queryKey: historyKey });
      const previous = queryClient.getQueryData<StandupHistoryQueryData>(
        historyKey
      );

      if (previous) {
        queryClient.setQueryData(historyKey, {
          ...previous,
          items: previous.items.filter((item) => item.workday !== workday),
        });
      }

      return { previous, historyKey };
    },
    onError: (_error, _workday, context) => {
      if (context?.previous) {
        queryClient.setQueryData(context.historyKey, context.previous);
      }
    },
    onSettled: (_data, _error, workday) => {
      invalidateStandupAfterWrite(queryClient, workday);
    },
  });
}
