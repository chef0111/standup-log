import type { ActivityCommitRow } from '@/features/standup/types/activity-commit';
import type { Workday } from '@/features/standup/types/workday';

export type ActivityWorkdayCacheEntry = {
  commits: ActivityCommitRow[];
  error: string | null;
  githubSynced: boolean;
};

/** Session-scoped cache; cleared when the app reloads. */
const activityByWorkday = new Map<Workday, ActivityWorkdayCacheEntry>();

export function getActivityWorkdayCache(
  workday: Workday
): ActivityWorkdayCacheEntry | undefined {
  return activityByWorkday.get(workday);
}

export function setActivityWorkdayCache(
  workday: Workday,
  entry: ActivityWorkdayCacheEntry
): void {
  activityByWorkday.set(workday, entry);
}

export function hasActivityWorkdayCache(workday: Workday): boolean {
  return activityByWorkday.has(workday);
}

export function clearActivityWorkdayCache(): void {
  activityByWorkday.clear();
}
