import { useAuth } from '@/context/auth';
import { categorizeError, userFacingMessage } from '@/lib/errors';
import { deleteStandupUpdate } from '@/queries/lib/standup/delete-standup-update';
import { useStandupHistoryQuery } from '@/queries/standup/use-standup-history-query';
import type { Workday } from '@/features/standup/types/workday';
import { useQueryClient } from '@tanstack/react-query';
import { standupKeys } from '@/queries/keys';
import * as React from 'react';

export type DeleteStandupHistoryItem = (
  workday: Workday
) => Promise<string | null>;

export function useStandupHistory() {
  const { supabase, session } = useAuth();
  const queryClient = useQueryClient();
  const historyQuery = useStandupHistoryQuery();

  const deleteItem = React.useCallback<DeleteStandupHistoryItem>(
    async (workday) => {
      if (!supabase || !session) {
        return userFacingMessage(categorizeError('Not signed in'));
      }

      const previous = historyQuery.data;
      if (previous) {
        queryClient.setQueryData(
          standupKeys.history(
            previous.pickerBounds.minimumWorkday,
            previous.pickerBounds.maximumWorkday
          ),
          {
            ...previous,
            items: previous.items.filter((item) => item.workday !== workday),
          }
        );
      }

      const { error } = await deleteStandupUpdate(supabase, workday);
      if (error) {
        void historyQuery.refetch();
        return userFacingMessage(categorizeError(error));
      }

      return null;
    },
    [historyQuery, queryClient, session, supabase]
  );

  return {
    items: historyQuery.data?.items ?? [],
    pickerBounds: historyQuery.data?.pickerBounds ?? null,
    isPro: historyQuery.data?.isPro ?? false,
    loading: historyQuery.isLoading,
    error: historyQuery.error
      ? historyQuery.error instanceof Error
        ? historyQuery.error.message
        : userFacingMessage(categorizeError(historyQuery.error))
      : null,
    deleteItem,
  };
}
