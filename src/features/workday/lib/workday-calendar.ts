import type { Workday } from '@/features/workday/types/workday';

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

/** Local noon date for a Workday (stable for date pickers). */
export function workdayToLocalDate(workday: Workday): Date {
  const [y, m, d] = workday.split('-').map(Number);
  return new Date(y, m - 1, d, 12, 0, 0);
}
