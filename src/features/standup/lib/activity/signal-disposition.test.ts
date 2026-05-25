import { describe, expect, it } from 'vitest';
import { mergeHybridCommits } from '@/features/standup/lib/activity/github-commits';
import {
  assignSignalDisposition,
  isMergedPullRequest,
  isOpenPullRequest,
} from '@/features/standup/lib/activity/signal-disposition';
import type { ParsedCommit } from '@/features/standup/lib/activity/github-commits';

function baseCommit(overrides: Partial<ParsedCommit> = {}): ParsedCommit {
  return {
    repository_full_name: 'org/repo',
    sha: 'abc123',
    message: 'feat: thing',
    committed_at: '2026-05-24T12:00:00Z',
    html_url: 'https://github.com/org/repo/commit/abc123',
    author_login: 'dev',
    pr_number: null,
    pr_title: null,
    pr_url: null,
    pr_state: null,
    pr_merged_at: null,
    signal_disposition: 'shipped',
    work_type: null,
    ...overrides,
  };
}

describe('assignSignalDisposition', () => {
  it('marks merged PR as shipped', () => {
    expect(
      assignSignalDisposition({
        pr_state: 'closed',
        pr_merged_at: '2026-05-24T15:00:00Z',
        sources: new Set(['search']),
      })
    ).toBe('shipped');
  });

  it('marks open PR as in_progress', () => {
    expect(
      assignSignalDisposition({
        pr_state: 'open',
        pr_merged_at: null,
        sources: new Set(['default_branch']),
      })
    ).toBe('in_progress');
  });

  it('marks search-only commits as in_progress', () => {
    expect(
      assignSignalDisposition({
        pr_state: null,
        pr_merged_at: null,
        sources: new Set(['search']),
      })
    ).toBe('in_progress');
  });

  it('marks default branch commits as shipped', () => {
    expect(
      assignSignalDisposition({
        pr_state: null,
        pr_merged_at: null,
        sources: new Set(['default_branch']),
      })
    ).toBe('shipped');
  });
});

describe('mergeHybridCommits', () => {
  it('merges default and search sources with disposition', () => {
    const defaultBranch = [baseCommit({ sha: 'a', pr_state: 'open', pr_number: 1 })];
    const searchOnly = [baseCommit({ sha: 'b' })];

    const merged = mergeHybridCommits(defaultBranch, searchOnly);
    expect(merged).toHaveLength(2);

    const openOnMain = merged.find((c) => c.sha === 'a');
    expect(openOnMain?.signal_disposition).toBe('in_progress');

    const featureOnly = merged.find((c) => c.sha === 'b');
    expect(featureOnly?.signal_disposition).toBe('in_progress');
  });

  it('prefers PR metadata from either source', () => {
    const defaultBranch = [baseCommit({ sha: 'a' })];
    const searchOnly = [
      baseCommit({
        sha: 'a',
        pr_number: 42,
        pr_title: 'Feature',
        pr_state: 'open',
      }),
    ];

    const merged = mergeHybridCommits(defaultBranch, searchOnly);
    expect(merged[0]?.pr_number).toBe(42);
    expect(merged[0]?.signal_disposition).toBe('in_progress');
  });
});

describe('pull request helpers', () => {
  it('detects merged PR via merged_at', () => {
    expect(
      isMergedPullRequest({ pr_merged_at: '2026-05-24T12:00:00Z', pr_state: 'closed' })
    ).toBe(true);
  });

  it('detects open PR', () => {
    expect(
      isOpenPullRequest({
        pr_number: 1,
        pr_merged_at: null,
        pr_state: 'open',
      })
    ).toBe(true);
  });
});
