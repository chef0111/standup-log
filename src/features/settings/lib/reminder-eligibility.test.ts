import {
  getReminderPriorWorkday,
  shouldScheduleReminder,
} from '@/features/settings/lib/reminder-eligibility';
import { describe, expect, it } from 'vitest';

describe('shouldScheduleReminder', () => {
  it('schedules when enabled and prior day not copied', () => {
    expect(
      shouldScheduleReminder({
        priorWorkday: '2026-05-18',
        standupCopiedAt: null,
        reminderEnabled: true,
      })
    ).toBe(true);
  });

  it('skips when already copied', () => {
    expect(
      shouldScheduleReminder({
        priorWorkday: '2026-05-18',
        standupCopiedAt: '2026-05-19T09:00:00Z',
        reminderEnabled: true,
      })
    ).toBe(false);
  });

  it('skips when disabled', () => {
    expect(
      shouldScheduleReminder({
        priorWorkday: '2026-05-18',
        standupCopiedAt: null,
        reminderEnabled: false,
      })
    ).toBe(false);
  });
});

describe('getReminderPriorWorkday', () => {
  it('returns previous local calendar day', () => {
    const prior = getReminderPriorWorkday(new Date('2026-05-19T10:00:00'));
    expect(prior).toBe('2026-05-18');
  });
});
