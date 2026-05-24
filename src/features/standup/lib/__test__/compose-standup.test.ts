import type { ActivityCommitRow } from '@/features/standup/types/activity-commit';
import type { ManualNoteRow } from '@/features/standup/types/manual-note';
import {
  composeManualStandup,
  DEFAULT_BLOCKERS,
  DEFAULT_TODAY_PLACEHOLDER,
  isStandupEmpty,
} from '@/features/standup/lib/compose-standup';
import { describe, expect, it } from 'vitest';

const baseCommit: ActivityCommitRow = {
  id: '1',
  user_id: 'u1',
  workday: '2026-05-18',
  repository_full_name: 'acme/web',
  sha: 'sha1',
  message: 'Fix login bug',
  committed_at: '2026-05-18T14:00:00Z',
  html_url: 'https://github.com/acme/web/commit/sha1',
  author_login: 'dev',
  pr_number: 42,
  pr_title: 'Fix login',
  pr_url: 'https://github.com/acme/web/pull/42',
  pr_state: 'merged',
  synced_at: '2026-05-19T00:00:00Z',
  created_at: '2026-05-19T00:00:00Z',
};

const baseNote: ManualNoteRow = {
  id: 'n1',
  user_id: 'u1',
  workday: '2026-05-18',
  body: 'Waiting on API access',
  is_blocker: true,
  is_carry_forward: false,
  created_at: '2026-05-18T10:00:00Z',
  updated_at: '2026-05-18T10:00:00Z',
};

describe('composeManualStandup', () => {
  it('builds yesterday from commits', () => {
    const sections = composeManualStandup({
      commits: [baseCommit],
      notes: [],
      carryForwardNotes: [],
    });
    expect(sections.yesterday).toContain('- web: Fix login bug');
    expect(sections.yesterday).toContain('PR #42');
  });

  it('uses blocker notes for blockers section', () => {
    const sections = composeManualStandup({
      commits: [],
      notes: [baseNote],
      carryForwardNotes: [],
    });
    expect(sections.blockers).toContain('Waiting on API access');
    expect(sections.yesterday).toBe('');
  });

  it('includes carry-forward notes in today', () => {
    const carry: ManualNoteRow = {
      ...baseNote,
      id: 'n2',
      is_blocker: false,
      is_carry_forward: true,
      body: 'Finish dashboard',
    };
    const sections = composeManualStandup({
      commits: [],
      notes: [],
      carryForwardNotes: [carry],
    });
    expect(sections.today).toContain(DEFAULT_TODAY_PLACEHOLDER);
    expect(sections.today).toContain('- Finish dashboard');
    expect(sections.blockers).toBe(DEFAULT_BLOCKERS);
  });
});

describe('isStandupEmpty', () => {
  it('detects empty composed standup', () => {
    const sections = composeManualStandup({
      commits: [],
      notes: [],
      carryForwardNotes: [],
    });
    expect(isStandupEmpty(sections)).toBe(true);
  });
});
