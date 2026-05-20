import {
  aggregateWeeklySummary,
  applyWeeklyPreviewGate,
} from '@/features/standup/lib/weekly/aggregate-weekly-summary';
import { describe, expect, it } from 'vitest';

describe('aggregateWeeklySummary', () => {
  it('groups commits by work type sorted by count', () => {
    const summary = aggregateWeeklySummary({
      commits: [
        { workday: '2026-05-19', work_type: 'feature' },
        { workday: '2026-05-19', work_type: 'feature' },
        { workday: '2026-05-18', work_type: 'bug' },
        { workday: '2026-05-17', work_type: null },
      ],
      standups: [
        {
          id: '1',
          user_id: 'u',
          workday: '2026-05-19',
          draft_markdown: '#',
          copied_at: '2026-05-19T10:00:00Z',
          format_used: 'plain',
          created_at: '',
          updated_at: '',
        },
      ],
    });

    expect(summary.totalCommits).toBe(4);
    expect(summary.buckets[0].workType).toBe('feature');
    expect(summary.buckets[0].commitCount).toBe(2);
    expect(summary.buckets.find((b) => b.workType === 'other')).toBeDefined();
    expect(summary.copiedWorkdays).toEqual(['2026-05-19']);
  });
});

describe('applyWeeklyPreviewGate', () => {
  const summary = aggregateWeeklySummary({
    commits: [
      { workday: '2026-05-19', work_type: 'feature' },
      { workday: '2026-05-18', work_type: 'bug' },
      { workday: '2026-05-17', work_type: 'chore' },
    ],
    standups: [],
  });

  it('shows top 2 work types for free tier', () => {
    const gated = applyWeeklyPreviewGate(summary, false);
    expect(gated.visibleBuckets.filter((b) => !b.locked)).toHaveLength(2);
    expect(gated.lockedCount).toBe(1);
  });

  it('shows all types for Pro', () => {
    const gated = applyWeeklyPreviewGate(summary, true);
    expect(gated.visibleBuckets.every((b) => !b.locked)).toBe(true);
    expect(gated.lockedCount).toBe(0);
  });
});
