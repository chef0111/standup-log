import { parseCommitWorkType } from '@/features/activity/lib/parse-commit-work-type';
import type {
  ActivityCommitRow,
  StoredWorkType,
} from '@/features/activity/types/activity-commit';

export type { StoredWorkType };

export const STORED_WORK_TYPE_OPTIONS: {
  value: StoredWorkType;
  label: string;
}[] = [
  { value: 'feature', label: 'Feature' },
  { value: 'bug', label: 'Bug fix' },
  { value: 'refactor', label: 'Refactor' },
  { value: 'test', label: 'Test' },
  { value: 'chore', label: 'Chore' },
  { value: 'style', label: 'Style' },
];

export type WorkTypeDisplay = {
  type: StoredWorkType;
  label: string;
  symbol: '+' | '!' | '~' | '$' | 'T';
};

const STORED_META: Record<
  StoredWorkType,
  { symbol: WorkTypeDisplay['symbol']; label: string }
> = {
  feature: { symbol: '+', label: 'feature' },
  bug: { symbol: '!', label: 'bug' },
  refactor: { symbol: '~', label: 'refactor' },
  test: { symbol: 'T', label: 'test' },
  chore: { symbol: '~', label: 'chore' },
  style: { symbol: '$', label: 'style' },
};

export function storedWorkTypeDisplay(
  workType: string | null
): WorkTypeDisplay | null {
  if (!workType || !(workType in STORED_META)) {
    return null;
  }
  const meta = STORED_META[workType as StoredWorkType];
  return { type: workType as StoredWorkType, ...meta };
}

export function resolveCommitWorkType(
  commit: ActivityCommitRow
): WorkTypeDisplay | null {
  const stored = storedWorkTypeDisplay(commit.work_type);
  if (stored) {
    return stored;
  }
  const parsed = parseCommitWorkType(commit.message);
  if (!parsed) {
    return null;
  }
  if (parsed.type === 'feature' || parsed.type === 'bug') {
    return {
      type: parsed.type,
      label: parsed.label,
      symbol: parsed.symbol,
    };
  }
  if (parsed.type === 'refactor' || parsed.type === 'style' || parsed.type === 'chore') {
    return {
      type: parsed.type,
      label: parsed.label,
      symbol: parsed.symbol,
    };
  }
  return null;
}
