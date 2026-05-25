import { STANDUP_SUMMARY_PLACEHOLDER } from '@/features/standup/lib/compose-standup-markdown';
import {
  buildStandupSummaryExcerpt,
  mapStandupUpdateToHistoryItem,
  sortStandupHistoryItems,
} from '@/features/standup/lib/history/standup-history-item';
import type { StandupUpdateRow } from '@/features/standup/lib/standup-api';
import { describe, expect, it } from 'vitest';

function row(overrides: Partial<StandupUpdateRow>): StandupUpdateRow {
  return {
    id: '1',
    user_id: 'u1',
    workday: '2026-05-20',
    draft_markdown: '',
    copied_at: null,
    format_used: null,
    created_at: '2026-05-20T00:00:00Z',
    updated_at: '2026-05-20T00:00:00Z',
    ...overrides,
  };
}

describe('buildStandupSummaryExcerpt', () => {
  it('returns null when summary is placeholder only', () => {
    expect(
      buildStandupSummaryExcerpt(`## Summary\n${STANDUP_SUMMARY_PLACEHOLDER}`)
    ).toBeNull();
  });

  it('truncates long summaries', () => {
    const prose = 'A'.repeat(130);
    const excerpt = buildStandupSummaryExcerpt(`## Summary\n${prose}`);
    expect(excerpt?.endsWith('…')).toBe(true);
    expect(excerpt!.length).toBeLessThanOrEqual(120);
  });
});

describe('mapStandupUpdateToHistoryItem', () => {
  it('marks copied when copied_at is set', () => {
    const item = mapStandupUpdateToHistoryItem(
      row({ copied_at: '2026-05-20T12:00:00Z' })
    );
    expect(item.copied).toBe(true);
  });
});

describe('sortStandupHistoryItems', () => {
  it('sorts workdays newest first', () => {
    const sorted = sortStandupHistoryItems([
      { workday: '2026-05-18', summaryExcerpt: null, copied: false },
      { workday: '2026-05-22', summaryExcerpt: null, copied: false },
      { workday: '2026-05-20', summaryExcerpt: null, copied: false },
    ]);
    expect(sorted.map((i) => i.workday)).toEqual([
      '2026-05-22',
      '2026-05-20',
      '2026-05-18',
    ]);
  });
});
