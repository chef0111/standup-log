import type { ActivityCommitRow } from '@/features/activity/types/activity-commit';
import type { ManualNoteRow } from '@/features/notes/types/manual-note';
import type { StandupSections } from '@/features/standup/lib/compose-standup';
import type { Workday } from '@/features/workday/types/workday';
import { createMMKV } from 'react-native-mmkv';

const storage = createMMKV({ id: 'standup-offline-cache' });

export type WorkdaySnapshot = {
  workday: Workday;
  commits: ActivityCommitRow[];
  notes: ManualNoteRow[];
  carryForwardNotes: ManualNoteRow[];
  sections: StandupSections | null;
  cachedAt: string;
};

function cacheKey(workday: Workday): string {
  return `workday:${workday}`;
}

export function writeWorkdaySnapshot(snapshot: WorkdaySnapshot): void {
  storage.set(cacheKey(snapshot.workday), JSON.stringify(snapshot));
}

export function readWorkdaySnapshot(workday: Workday): WorkdaySnapshot | null {
  const raw = storage.getString(cacheKey(workday));
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw) as WorkdaySnapshot;
  } catch {
    return null;
  }
}

export function isLikelyOffline(): boolean {
  if (typeof navigator !== 'undefined' && 'onLine' in navigator) {
    return navigator.onLine === false;
  }
  return false;
}
