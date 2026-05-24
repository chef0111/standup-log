import type { ActivityCommitRow } from '@/features/standup/types/activity-commit';
import {
  buildEmptyStandupTemplate,
  composeManualMarkdown,
  formatWorkdayHeading,
  isStandupSummaryReady,
  STANDUP_SUMMARY_PLACEHOLDER,
} from '@/features/standup/lib/compose-standup-markdown';
import { describe, expect, it } from 'vitest';

const commit: ActivityCommitRow = {
  id: '1',
  user_id: 'u1',
  workday: '2026-05-19',
  repository_full_name: 'acme/web',
  sha: 'abc',
  message: 'Fix login',
  committed_at: '2026-05-19T14:00:00Z',
  html_url: 'https://example.com',
  author_login: 'dev',
  pr_number: 42,
  pr_title: 'Auth fix',
  pr_url: null,
  pr_state: 'open',
  work_type: null,
  synced_at: '2026-05-19T15:00:00Z',
  created_at: '2026-05-19T15:00:00Z',
};

describe('compose-standup-markdown', () => {
  it('includes formatted Workday in heading', () => {
    expect(formatWorkdayHeading('2026-05-19')).toMatch(/May/);
    expect(buildEmptyStandupTemplate('2026-05-19')).toContain(
      formatWorkdayHeading('2026-05-19')
    );
  });

  it('includes Summary placeholder in empty and manual templates', () => {
    expect(buildEmptyStandupTemplate('2026-05-19')).toContain('## Summary');
    expect(buildEmptyStandupTemplate('2026-05-19')).toContain(
      STANDUP_SUMMARY_PLACEHOLDER
    );

    const manual = composeManualMarkdown({
      workday: '2026-05-19',
      commits: [commit],
      notes: [],
      carryForwardNotes: [],
    });
    expect(manual).toContain(STANDUP_SUMMARY_PLACEHOLDER);
    expect(manual).toContain('- web: Fix login');
  });

  it('isStandupSummaryReady is false for placeholder only', () => {
    expect(
      isStandupSummaryReady(`## Summary\n${STANDUP_SUMMARY_PLACEHOLDER}`)
    ).toBe(false);
    expect(
      isStandupSummaryReady('## Summary\nShipped the auth fix today.')
    ).toBe(true);
  });
});
