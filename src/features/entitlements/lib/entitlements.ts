import { FREE_TIER_REPO_LIMIT } from '@/features/repositories/types/repository';
import {
  addCalendarDays,
  formatWorkdayLocal,
  workdayToLocalDate,
} from '@/features/workday/lib/workday-calendar';
import type {
  Workday,
  WorkdayPickerBounds,
} from '@/features/workday/types/workday';

export const FREE_TIER_WORKDAY_HISTORY_DAYS = 30;

const PRO_HISTORY_DAYS = 3650;

export function canSelectRepository(
  selectedCount: number,
  isPro: boolean
): boolean {
  if (isPro) {
    return true;
  }
  return selectedCount < FREE_TIER_REPO_LIMIT;
}

export function getWorkdayHistoryBounds(input: {
  isPro: boolean;
  now?: Date;
  timeZone?: string;
}): WorkdayPickerBounds {
  const tz = input.timeZone ?? Intl.DateTimeFormat().resolvedOptions().timeZone;
  const now = input.now ?? new Date();
  const maximumWorkday = formatWorkdayLocal(now, tz);
  const historyDays = input.isPro
    ? PRO_HISTORY_DAYS
    : FREE_TIER_WORKDAY_HISTORY_DAYS;
  const minimumWorkday = addCalendarDays(maximumWorkday, -historyDays);

  return {
    minimumWorkday,
    maximumWorkday,
    minimumDate: workdayToLocalDate(minimumWorkday),
    maximumDate: workdayToLocalDate(maximumWorkday),
  };
}

export function isWorkdayWithinHistory(
  workday: Workday,
  isPro: boolean,
  now?: Date,
  timeZone?: string
): boolean {
  const bounds = getWorkdayHistoryBounds({ isPro, now, timeZone });
  return workday >= bounds.minimumWorkday && workday <= bounds.maximumWorkday;
}

export type ActivitySyncGuardResult =
  | { allowed: true }
  | { allowed: false; reason: 'history_cap' };

export function assertActivitySyncAllowed(
  workday: Workday,
  isPro: boolean,
  now?: Date,
  timeZone?: string
): ActivitySyncGuardResult {
  if (isWorkdayWithinHistory(workday, isPro, now, timeZone)) {
    return { allowed: true };
  }
  return { allowed: false, reason: 'history_cap' };
}

export const HISTORY_CAP_MESSAGE =
  'Free accounts can sync the last 30 days. Upgrade to Pro for full history.';
