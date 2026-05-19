import { addCalendarDays } from '@/features/workday/lib/workday';
import type { Workday } from '@/features/workday/types/workday';

export type StreakState = {
  currentStreak: number;
  longestStreak: number;
  lastStreakWorkday: Workday | null;
};

export type NextStreakResult = StreakState & {
  streakIncremented: boolean;
};

export function nextStreakState(
  current: StreakState,
  copiedWorkday: Workday,
  alreadyCopied: boolean
): NextStreakResult {
  if (alreadyCopied) {
    return {
      ...current,
      lastStreakWorkday: current.lastStreakWorkday ?? copiedWorkday,
      streakIncremented: false,
    };
  }

  const previous = current.lastStreakWorkday;
  let nextCurrent = 1;

  if (previous && copiedWorkday === addCalendarDays(previous, 1)) {
    nextCurrent = current.currentStreak + 1;
  } else if (previous && copiedWorkday === previous) {
    nextCurrent = current.currentStreak;
  }

  const longestStreak = Math.max(current.longestStreak, nextCurrent);

  return {
    currentStreak: nextCurrent,
    longestStreak,
    lastStreakWorkday: copiedWorkday,
    streakIncremented: true,
  };
}
