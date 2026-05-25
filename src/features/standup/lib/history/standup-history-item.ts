import { isStandupSummaryReady } from '@/features/standup/lib/compose-standup-markdown';
import { extractStandupSummary } from '@/features/standup/lib/parse-standup-markdown';
import type { StandupUpdateRow } from '@/features/standup/lib/standup-api';
import type { Workday } from '@/features/standup/types/workday';

export type StandupHistoryItem = {
  workday: Workday;
  summaryExcerpt: string | null;
  copied: boolean;
};

export function buildStandupSummaryExcerpt(markdown: string): string | null {
  const ready = isStandupSummaryReady(markdown);
  const summary = extractStandupSummary(markdown).trim();

  if (!ready || summary.length === 0) {
    return null;
  }

  return summary.length > 120 ? `${summary.slice(0, 117)}…` : summary;
}

export function mapStandupUpdateToHistoryItem(
  row: StandupUpdateRow
): StandupHistoryItem {
  return {
    workday: row.workday,
    copied: Boolean(row.copied_at),
    summaryExcerpt: buildStandupSummaryExcerpt(row.draft_markdown),
  };
}

export function sortStandupHistoryItems(
  items: StandupHistoryItem[]
): StandupHistoryItem[] {
  return items.toSorted((a, b) => b.workday.localeCompare(a.workday));
}
