import { resolveCommitWorkType } from '@/features/activity/lib/stored-work-type';
import type { ActivityCommitRow } from '@/features/activity/types/activity-commit';
import { describe, expect, it } from 'vitest';

const base: ActivityCommitRow = {
  id: '1',
  user_id: 'u',
  workday: '2026-05-19',
  repository_full_name: 'org/repo',
  sha: 'abc',
  message: 'wip: unknown',
  committed_at: '2026-05-19T12:00:00Z',
  html_url: 'https://github.com',
  author_login: 'dev',
  pr_number: null,
  pr_title: null,
  pr_url: null,
  pr_state: null,
  work_type: null,
  synced_at: '2026-05-19T12:00:00Z',
  created_at: '2026-05-19T12:00:00Z',
};

describe('resolveCommitWorkType', () => {
  it('prefers stored work_type over message inference', () => {
    const commit = {
      ...base,
      message: 'feat: add login',
      work_type: 'test' as const,
    };
    expect(resolveCommitWorkType(commit)?.type).toBe('test');
  });

  it('falls back to conventional commit prefix', () => {
    const commit = { ...base, message: 'feat: add login' };
    expect(resolveCommitWorkType(commit)?.type).toBe('feature');
  });
});
