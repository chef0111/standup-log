import { describe, expect, it } from 'vitest';
import {
  clampWorkdayToBounds,
  defaultTargetWorkday,
  getWorkdayPickerBounds,
} from '@/features/standup/lib/workday/workday';

describe('Standup workday policy', () => {
  it('does not reset workday to today when still within free-tier bounds', () => {
    const bounds = getWorkdayPickerBounds({ isPro: false });
    const userSelected = bounds.maximumWorkday;

    const afterRefocus = clampWorkdayToBounds(userSelected, bounds);
    expect(afterRefocus).toBe(userSelected);
    expect(afterRefocus).not.toBe(defaultTargetWorkday());
  });

  it('clamps out-of-range workdays instead of leaving them invalid', () => {
    const bounds = getWorkdayPickerBounds({ isPro: false });
    const tooOld = '2020-01-01';

    expect(clampWorkdayToBounds(tooOld, bounds)).toBe(bounds.minimumWorkday);
  });
});
