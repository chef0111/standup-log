import {
  addCalendarDays,
  defaultTargetWorkday,
  formatWorkdayLocal,
  parseWorkdayParam,
  workdayUtcBounds,
  zonedStartOfDay,
} from '@/features/workday/lib/workday';
import { describe, expect, it } from 'vitest';

describe('formatWorkdayLocal', () => {
  it('formats a date in en-CA YYYY-MM-DD', () => {
    const date = new Date('2026-05-19T15:30:00Z');
    const workday = formatWorkdayLocal(date, 'UTC');
    expect(workday).toBe('2026-05-19');
  });
});

describe('defaultTargetWorkday', () => {
  it('returns previous local calendar day', () => {
    const now = new Date('2026-05-19T10:00:00');
    const target = defaultTargetWorkday(now, 'UTC');
    expect(target).toBe('2026-05-18');
  });
});

describe('parseWorkdayParam', () => {
  it('accepts valid ISO dates', () => {
    expect(parseWorkdayParam('2026-05-18')).toBe('2026-05-18');
  });

  it('rejects invalid dates', () => {
    expect(parseWorkdayParam('2026-13-01')).toBeNull();
    expect(parseWorkdayParam(undefined)).toBeNull();
  });
});

describe('workdayUtcBounds', () => {
  it('returns half-open interval in UTC for UTC timezone', () => {
    const { since, until } = workdayUtcBounds('2026-05-18', 'UTC');
    expect(since).toBe('2026-05-18T00:00:00.000Z');
    expect(until).toBe('2026-05-19T00:00:00.000Z');
  });

  it('handles America/New_York DST spring forward boundary', () => {
    const start = zonedStartOfDay('2026-03-08', 'America/New_York');
    expect(formatWorkdayLocal(start, 'America/New_York')).toBe('2026-03-08');
    expect(start.getUTCHours()).toBeGreaterThanOrEqual(4);
  });
});

describe('addCalendarDays', () => {
  it('adds days across month boundary', () => {
    expect(addCalendarDays('2026-05-31', 1)).toBe('2026-06-01');
  });
});
