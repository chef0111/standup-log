import type {
  Workday,
  WorkdayUtcBounds,
} from '@/features/workday/types/workday';

const WORKDAY_RE = /^\d{4}-\d{2}-\d{2}$/;

export function formatWorkdayLocal(date: Date, timeZone?: string): Workday {
  const tz = timeZone ?? Intl.DateTimeFormat().resolvedOptions().timeZone;
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

export function addCalendarDays(workday: Workday, days: number): Workday {
  const [y, m, d] = workday.split('-').map(Number);
  const utc = new Date(Date.UTC(y, m - 1, d + days));
  return `${utc.getUTCFullYear()}-${String(utc.getUTCMonth() + 1).padStart(2, '0')}-${String(utc.getUTCDate()).padStart(2, '0')}`;
}

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

export function parseWorkdayParam(param: string | undefined): Workday | null {
  if (!param || !WORKDAY_RE.test(param)) {
    return null;
  }
  const [y, m, d] = param.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  if (
    dt.getUTCFullYear() !== y ||
    dt.getUTCMonth() !== m - 1 ||
    dt.getUTCDate() !== d
  ) {
    return null;
  }
  return param;
}

export function isValidWorkday(value: string): value is Workday {
  return parseWorkdayParam(value) !== null;
}
