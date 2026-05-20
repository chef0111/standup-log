import { getWorkdayHistoryBounds } from '@/features/entitlements/lib/entitlements';
import type {
  Workday,
  WorkdayPickerBounds,
  WorkdayUtcBounds,
} from '@/features/standup/types/workday';
import { addCalendarDays, formatWorkdayLocal } from './workday-calendar';

export {
  addCalendarDays,
  formatWorkdayLocal,
  isValidWorkday,
  parseWorkdayParam,
  workdayToLocalDate,
} from './workday-calendar';

/** @deprecated Import from @/features/entitlements instead */
export { FREE_TIER_WORKDAY_HISTORY_DAYS } from '@/features/entitlements/lib/entitlements';

export type { WorkdayPickerBounds };

function getLocalHour(date: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour: 'numeric',
    hour12: false,
  }).formatToParts(date);
  return Number(parts.find((p) => p.type === 'hour')?.value ?? 0);
}

/** Midnight at start of `workday` in `timeZone`, as a UTC instant. */
export function zonedStartOfDay(workday: Workday, timeZone: string): Date {
  const [year, month, day] = workday.split('-').map(Number);
  let candidate = Date.UTC(year, month - 1, day, 12, 0, 0);

  for (let i = 0; i < 72; i += 1) {
    const date = new Date(candidate);
    const localDay = formatWorkdayLocal(date, timeZone);
    if (localDay === workday) {
      const hour = getLocalHour(date, timeZone);
      if (hour === 0) {
        return date;
      }
      candidate -= hour * 3600000;
      continue;
    }
    if (localDay < workday) {
      candidate += 3600000;
    } else {
      candidate -= 3600000;
    }
  }

  return new Date(candidate);
}

/**
 * GitHub `since`/`until` bounds for a Workday: [startOfDay, startOfNextDay) in local TZ → UTC ISO strings.
 */
export function workdayUtcBounds(
  workday: Workday,
  timeZone?: string
): WorkdayUtcBounds {
  const tz = timeZone ?? Intl.DateTimeFormat().resolvedOptions().timeZone;
  const since = zonedStartOfDay(workday, tz);
  const until = zonedStartOfDay(addCalendarDays(workday, 1), tz);
  return { since: since.toISOString(), until: until.toISOString() };
}

/** Previous local calendar day (default standup target when opened in the morning). */
export function defaultTargetWorkday(
  now: Date = new Date(),
  timeZone?: string
): Workday {
  const tz = timeZone ?? Intl.DateTimeFormat().resolvedOptions().timeZone;
  const today = formatWorkdayLocal(now, tz);
  return addCalendarDays(today, -1);
}

export function getWorkdayPickerBounds(input: {
  isPro: boolean;
  now?: Date;
  timeZone?: string;
}): WorkdayPickerBounds {
  return getWorkdayHistoryBounds(input);
}

export function clampWorkdayToBounds(
  workday: Workday,
  bounds: Pick<WorkdayPickerBounds, 'minimumWorkday' | 'maximumWorkday'>
): Workday {
  if (workday < bounds.minimumWorkday) {
    return bounds.minimumWorkday;
  }
  if (workday > bounds.maximumWorkday) {
    return bounds.maximumWorkday;
  }
  return workday;
}
