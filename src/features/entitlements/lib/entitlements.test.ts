import {
  assertActivitySyncAllowed,
  canSelectRepository,
  FREE_TIER_WORKDAY_HISTORY_DAYS,
  getWorkdayHistoryBounds,
  isWorkdayWithinHistory,
} from '@/features/entitlements/lib/entitlements';
import { addCalendarDays } from '@/features/standup/lib/workday/workday';
import { describe, expect, it } from 'vitest';

const NOW = new Date('2026-05-19T12:00:00Z');
const TZ = 'UTC';

describe('canSelectRepository', () => {
  it('allows up to 3 repos on free tier', () => {
    expect(canSelectRepository(0, false)).toBe(true);
    expect(canSelectRepository(2, false)).toBe(true);
    expect(canSelectRepository(3, false)).toBe(false);
  });

  it('allows unlimited repos for Pro', () => {
    expect(canSelectRepository(10, true)).toBe(true);
  });
});

describe('getWorkdayHistoryBounds', () => {
  it('caps free tier to 30 days', () => {
    const bounds = getWorkdayHistoryBounds({
      isPro: false,
      now: NOW,
      timeZone: TZ,
    });
    expect(bounds.maximumWorkday).toBe('2026-05-19');
    expect(bounds.minimumWorkday).toBe(
      addCalendarDays('2026-05-19', -FREE_TIER_WORKDAY_HISTORY_DAYS)
    );
  });

  it('allows wide range for Pro', () => {
    const bounds = getWorkdayHistoryBounds({
      isPro: true,
      now: NOW,
      timeZone: TZ,
    });
    expect(bounds.minimumWorkday < '2020-01-01').toBe(true);
  });
});

describe('isWorkdayWithinHistory', () => {
  it('blocks free user workday older than 30 days', () => {
    expect(isWorkdayWithinHistory('2026-04-19', false, NOW, TZ)).toBe(true);
    expect(isWorkdayWithinHistory('2026-04-18', false, NOW, TZ)).toBe(false);
  });

  it('allows Pro user older workdays', () => {
    expect(isWorkdayWithinHistory('2020-01-01', true, NOW, TZ)).toBe(true);
  });
});

describe('assertActivitySyncAllowed', () => {
  it('returns history_cap when out of range for free tier', () => {
    expect(assertActivitySyncAllowed('2026-01-01', false, NOW, TZ)).toEqual({
      allowed: false,
      reason: 'history_cap',
    });
  });

  it('allows in-range workdays', () => {
    expect(assertActivitySyncAllowed('2026-05-10', false, NOW, TZ)).toEqual({
      allowed: true,
    });
  });
});
