import { categorizeError, userFacingMessage } from '@/lib/errors';
import { useDeleteStandupMutation } from '@/queries/standup/use-delete-standup-mutation';
import { useStandupHistoryQuery } from '@/queries/standup/use-standup-history-query';
import type { Workday } from '@/features/standup/types/workday';
import * as React from 'react';

export type DeleteStandupHistoryItem = (
  workday: Workday
) => Promise<string | null>;

export function useStandupHistory() {
  const historyQuery = useStandupHistoryQuery();
  const deleteMutation = useDeleteStandupMutation();

  const deleteItem = React.useCallback<DeleteStandupHistoryItem>(
    async (workday) => {
      try {
        await deleteMutation.mutateAsync(workday);
        return null;
      } catch (error) {
        return userFacingMessage(categorizeError(error));
      }
    },
    [deleteMutation]
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
