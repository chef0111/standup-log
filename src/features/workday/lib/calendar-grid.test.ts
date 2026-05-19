import {
  addCalendarMonths,
  canNavigateToMonth,
  chunkCalendarWeeks,
  getCalendarDayCells,
  isWorkdayInRange,
  workdayFromLocalParts,
  workdayToCalendarMonth,
} from '@/features/workday/lib/calendar-grid';
import { describe, expect, it } from 'vitest';

describe('calendar-grid', () => {
  it('builds a Sunday-start grid for May 2026', () => {
    const cells = getCalendarDayCells({ year: 2026, month: 4 });
    // May 1, 2026 is a Friday → five leading padding cells
    expect(cells.slice(0, 5).every((cell) => cell.day === null)).toBe(true);
    expect(cells[5]).toEqual({ day: 1, workday: '2026-05-01' });
    expect(cells.find((cell) => cell.workday === '2026-05-31')).toEqual({
      day: 31,
      workday: '2026-05-31',
    });
    expect(cells.length % 7).toBe(0);
  });

  it('formats workdays from local parts', () => {
    expect(workdayFromLocalParts(2026, 0, 5)).toBe('2026-01-05');
  });

  it('parses workday into calendar month', () => {
    expect(workdayToCalendarMonth('2026-05-18')).toEqual({
      year: 2026,
      month: 4,
    });
  });

  it('adds calendar months across year boundaries', () => {
    expect(addCalendarMonths({ year: 2026, month: 11 }, 1)).toEqual({
      year: 2027,
      month: 0,
    });
  });

  it('checks workday range inclusively', () => {
    expect(isWorkdayInRange('2026-05-10', '2026-05-01', '2026-05-18')).toBe(
      true
    );
    expect(isWorkdayInRange('2026-04-30', '2026-05-01', '2026-05-18')).toBe(
      false
    );
    expect(isWorkdayInRange('2026-05-19', '2026-05-01', '2026-05-18')).toBe(
      false
    );
  });

  it('allows month navigation only within bounds', () => {
    expect(
      canNavigateToMonth({ year: 2026, month: 4 }, '2026-04-01', '2026-05-18')
    ).toBe(true);
    expect(
      canNavigateToMonth({ year: 2026, month: 5 }, '2026-04-01', '2026-05-18')
    ).toBe(false);
  });

  it('chunks day cells into weeks of seven', () => {
    const cells = getCalendarDayCells({ year: 2026, month: 4 });
    const weeks = chunkCalendarWeeks(cells);
    expect(weeks).toHaveLength(6);
    expect(weeks.every((week) => week.length === 7)).toBe(true);
  });
});
