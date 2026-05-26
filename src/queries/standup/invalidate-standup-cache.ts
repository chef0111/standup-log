import type { QueryClient } from '@tanstack/react-query';

import { profileKeys, standupKeys, weeklyKeys } from '@/queries/keys';
import type { Workday } from '@/features/standup/types/workday';

export function invalidateStandupAfterWrite(
  queryClient: QueryClient,
  workday: Workday
) {
  void queryClient.invalidateQueries({ queryKey: standupKeys.update(workday) });
  void queryClient.invalidateQueries({
    queryKey: [...standupKeys.all, 'history'],
  });
  void queryClient.invalidateQueries({
    queryKey: [...weeklyKeys.all, 'standups'],
  });
}

export function invalidateProfileAfterCopy(queryClient: QueryClient) {
  void queryClient.invalidateQueries({ queryKey: profileKeys.current() });
}
