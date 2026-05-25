import type { ActivityCommitRow } from '@/features/standup/types/activity-commit';
import { describe, expect, it } from 'vitest';
import { patchCommitWorkTypeInList } from '../patch-commit-work-type';

const base: ActivityCommitRow = {
  id: 'commit-1',
  user_id: 'user-1',
  workday: '2026-05-25',
  repository_full_name: 'org/repo',
  sha: 'abc',
  message: 'Merge pull request #8',
  committed_at: '2026-05-25T12:00:00Z',
  html_url: 'https://github.com',
  author_login: 'dev',
  pr_number: 8,
  pr_title: null,
  pr_url: null,
  pr_state: null,
  pr_merged_at: null,
  signal_disposition: 'shipped',
  work_type: null,
  synced_at: '2026-05-25T12:00:00Z',
  created_at: '2026-05-25T12:00:00Z',
};

describe('patchCommitWorkTypeInList', () => {
  it('updates work_type for the matching commit only', () => {
    const other = { ...base, id: 'commit-2', sha: 'def' };
    const next = patchCommitWorkTypeInList(
      [base, other],
      'commit-1',
      'feature'
    );

    expect(next[0]?.work_type).toBe('feature');
    expect(next[1]?.work_type).toBeNull();
    expect(base.work_type).toBeNull();
  });
});
