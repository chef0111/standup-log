import type { QueryClient } from '@tanstack/react-query';

import { activityKeys, weeklyKeys } from '@/queries/keys';
import type { Workday } from '@/features/standup/types/workday';

export function invalidateActivityForWorkday(
  queryClient: QueryClient,
  workday: Workday
) {
  void queryClient.invalidateQueries({ queryKey: activityKeys.workday(workday) });
  void queryClient.invalidateQueries({
    queryKey: [...weeklyKeys.all, 'commits'],
  });
}
