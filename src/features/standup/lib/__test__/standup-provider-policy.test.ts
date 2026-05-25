import {
  addCalendarDays,
  clampWorkdayToBounds,
  getWorkdayPickerBounds,
} from '@/features/standup/lib/workday/workday';
import { describe, expect, it } from 'vitest';

describe('Standup workday policy', () => {
  it('preserves a user-selected past workday within free-tier bounds', () => {
    const bounds = getWorkdayPickerBounds({ isPro: false });
    const userSelected = addCalendarDays(bounds.maximumWorkday, -1);

    const afterRefocus = clampWorkdayToBounds(userSelected, bounds);
    expect(afterRefocus).toBe(userSelected);
  });
  it('clamps out-of-range workdays instead of leaving them invalid', () => {
    const bounds = getWorkdayPickerBounds({ isPro: false });
    const tooOld = '2020-01-01';

    expect(clampWorkdayToBounds(tooOld, bounds)).toBe(bounds.minimumWorkday);
  });
});
