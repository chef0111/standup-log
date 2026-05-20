import type { StandupUpdateRow } from '@/features/standup/lib/standup-api';
import type { ActivityCommitWithWorkType } from '@/features/standup/lib/fetch-standups-for-week';

export type WorkTypeBucket = {
  workType: string;
  commitCount: number;
  standupWorkdays: string[];
};

export type WeeklySummary = {
  buckets: WorkTypeBucket[];
  totalCommits: number;
  copiedWorkdays: string[];
};

const UNKNOWN_WORK_TYPE = 'other';

function normalizeWorkType(raw: string | null): string {
  if (!raw || !raw.trim()) {
    return UNKNOWN_WORK_TYPE;
  }
  return raw.trim();
}

export function aggregateWeeklySummary(input: {
  commits: ActivityCommitWithWorkType[];
  standups: StandupUpdateRow[];
}): WeeklySummary {
  const bucketMap = new Map<string, { count: number; workdays: Set<string> }>();

  for (const commit of input.commits) {
    const type = normalizeWorkType(commit.work_type);
    const existing = bucketMap.get(type) ?? { count: 0, workdays: new Set() };
    existing.count += 1;
    existing.workdays.add(commit.workday);
    bucketMap.set(type, existing);
  }

  const buckets: WorkTypeBucket[] = [...bucketMap.entries()]
    .map(([workType, { count, workdays }]) => ({
      workType,
      commitCount: count,
      standupWorkdays: [...workdays].sort(),
    }))
    .sort((a, b) => b.commitCount - a.commitCount);

  const copiedWorkdays = input.standups
    .filter((s) => s.copied_at != null)
    .map((s) => s.workday)
    .sort();

  return {
    buckets,
    totalCommits: input.commits.length,
    copiedWorkdays,
  };
}

export type GatedWorkTypeBucket = WorkTypeBucket & { locked: boolean };

export type GatedWeeklySummary = WeeklySummary & {
  visibleBuckets: GatedWorkTypeBucket[];
  lockedCount: number;
};

const FREE_PREVIEW_WORK_TYPE_LIMIT = 2;

export function applyWeeklyPreviewGate(
  summary: WeeklySummary,
  isPro: boolean
): GatedWeeklySummary {
  if (isPro) {
    return {
      ...summary,
      visibleBuckets: summary.buckets.map((b) => ({ ...b, locked: false })),
      lockedCount: 0,
    };
  }

  const visibleBuckets: GatedWorkTypeBucket[] = summary.buckets.map(
    (bucket, index) => ({
      ...bucket,
      locked: index >= FREE_PREVIEW_WORK_TYPE_LIMIT,
    })
  );

  const lockedCount = Math.max(
    0,
    summary.buckets.length - FREE_PREVIEW_WORK_TYPE_LIMIT
  );

  return {
    ...summary,
    visibleBuckets,
    lockedCount,
  };
}
