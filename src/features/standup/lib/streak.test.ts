import { nextStreakState } from '@/features/standup/lib/streak';
import { describe, expect, it } from 'vitest';

describe('nextStreakState', () => {
  it('starts streak at 1 on first copy', () => {
    const result = nextStreakState(
      { currentStreak: 0, longestStreak: 0, lastStreakWorkday: null },
      '2026-05-18',
      false
    );
    expect(result.currentStreak).toBe(1);
    expect(result.longestStreak).toBe(1);
    expect(result.streakIncremented).toBe(true);
  });

  it('does not increment when already copied for workday', () => {
    const result = nextStreakState(
      {
        currentStreak: 3,
        longestStreak: 5,
        lastStreakWorkday: '2026-05-18',
      },
      '2026-05-18',
      true
    );
    expect(result.currentStreak).toBe(3);
    expect(result.streakIncremented).toBe(false);
  });

  it('increments on consecutive workday', () => {
    const result = nextStreakState(
      {
        currentStreak: 2,
        longestStreak: 2,
        lastStreakWorkday: '2026-05-17',
      },
      '2026-05-18',
      false
    );
    expect(result.currentStreak).toBe(3);
    expect(result.longestStreak).toBe(3);
  });

  it('resets streak after a gap', () => {
    const result = nextStreakState(
      {
        currentStreak: 4,
        longestStreak: 4,
        lastStreakWorkday: '2026-05-15',
      },
      '2026-05-18',
      false
    );
    expect(result.currentStreak).toBe(1);
    expect(result.longestStreak).toBe(4);
  });
});
