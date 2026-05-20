import type { Workday } from '@/features/standup/types/workday';

export type CalendarDayCell = {
  day: number | null;
  workday: Workday | null;
};

export type CalendarMonth = {
  year: number;
  /** 0-indexed (January = 0) */
  month: number;
};

const WEEKDAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'] as const;

export function getWeekdayLabels(): readonly string[] {
  return WEEKDAY_LABELS;
}

export function workdayToCalendarMonth(workday: Workday): CalendarMonth {
  const [year, month] = workday.split('-').map(Number);
  return { year, month: month - 1 };
}

export function workdayFromLocalParts(
  year: number,
  month: number,
  day: number
): Workday {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function monthKey({ year, month }: CalendarMonth): number {
  return year * 12 + month;
}

export function addCalendarMonths(
  { year, month }: CalendarMonth,
  delta: number
): CalendarMonth {
  const total = year * 12 + month + delta;
  return { year: Math.floor(total / 12), month: ((total % 12) + 12) % 12 };
}

export function formatCalendarMonthLabel({
  year,
  month,
}: CalendarMonth): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(year, month, 1));
}

export function isWorkdayInRange(
  workday: Workday,
  minimumWorkday: Workday,
  maximumWorkday: Workday
): boolean {
  return workday >= minimumWorkday && workday <= maximumWorkday;
}

export function canNavigateToMonth(
  target: CalendarMonth,
  minimumWorkday: Workday,
  maximumWorkday: Workday
): boolean {
  const minMonth = workdayToCalendarMonth(minimumWorkday);
  const maxMonth = workdayToCalendarMonth(maximumWorkday);
  const targetKey = monthKey(target);
  return targetKey >= monthKey(minMonth) && targetKey <= monthKey(maxMonth);
}

/** Sunday-start grid for one month; null cells are padding. */
export function getCalendarDayCells({
  year,
  month,
}: CalendarMonth): CalendarDayCell[] {
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: CalendarDayCell[] = [];

  for (let i = 0; i < firstDayOfWeek; i += 1) {
    cells.push({ day: null, workday: null });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push({
      day,
      workday: workdayFromLocalParts(year, month, day),
    });
  }

  while (cells.length % 7 !== 0) {
    cells.push({ day: null, workday: null });
  }

  return cells;
}

/** Split flat day cells into Sunday-start weeks for grid layout. */
export function chunkCalendarWeeks(
  cells: CalendarDayCell[]
): CalendarDayCell[][] {
  const weeks: CalendarDayCell[][] = [];
  for (let index = 0; index < cells.length; index += 7) {
    weeks.push(cells.slice(index, index + 7));
  }
  return weeks;
}
