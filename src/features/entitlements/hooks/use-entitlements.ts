import {
  assertActivitySyncAllowed,
  canSelectRepository,
  getWorkdayHistoryBounds,
  isWorkdayWithinHistory,
} from '@/features/entitlements/lib/entitlements';
import type { Workday } from '@/features/standup/types/workday';
import * as React from 'react';

export function useEntitlements(isPro: boolean) {
  return React.useMemo(
    () => ({
      isPro,
      canSelectRepository: (selectedCount: number) =>
        canSelectRepository(selectedCount, isPro),
      getWorkdayHistoryBounds: (now?: Date, timeZone?: string) =>
        getWorkdayHistoryBounds({ isPro, now, timeZone }),
      isWorkdayWithinHistory: (
        workday: Workday,
        now?: Date,
        timeZone?: string
      ) => isWorkdayWithinHistory(workday, isPro, now, timeZone),
      assertActivitySyncAllowed: (
        workday: Workday,
        now?: Date,
        timeZone?: string
      ) => assertActivitySyncAllowed(workday, isPro, now, timeZone),
    }),
    [isPro]
  );
}
