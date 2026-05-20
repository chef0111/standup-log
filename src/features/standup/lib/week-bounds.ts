import { addCalendarDays, formatWorkdayLocal } from '@/features/workday/lib/workday';
import type { Workday } from '@/features/workday/types/workday';

export type WeekBounds = {
  weekStart: Workday;
  weekEnd: Workday;
};

/** ISO week: Monday–Sunday in the user's local timezone. */
export function getCurrentWeekBounds(
  now: Date = new Date(),
  timeZone?: string
): WeekBounds {
  const tz = timeZone ?? Intl.DateTimeFormat().resolvedOptions().timeZone;
  const today = formatWorkdayLocal(now, tz);
  const [y, m, d] = today.split('-').map(Number);
  const noon = new Date(y, m - 1, d, 12, 0, 0);
  const dayOfWeek = noon.getDay();
  const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const weekStart = addCalendarDays(today, -daysFromMonday);
  const weekEnd = addCalendarDays(weekStart, 6);
  return { weekStart, weekEnd };
}

export function isWorkdayInWeek(
  workday: Workday,
  bounds: WeekBounds
): boolean {
  return workday >= bounds.weekStart && workday <= bounds.weekEnd;
}
