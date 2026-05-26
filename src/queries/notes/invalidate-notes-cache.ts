import type { QueryClient } from '@tanstack/react-query';

import { notesKeys } from '@/queries/keys';
import type { Workday } from '@/features/standup/types/workday';

export function invalidateNotesForWorkday(
  queryClient: QueryClient,
  workday: Workday
) {
  void queryClient.invalidateQueries({ queryKey: notesKeys.workday(workday) });
  void queryClient.invalidateQueries({
    queryKey: notesKeys.carryForward(workday),
  });
}
