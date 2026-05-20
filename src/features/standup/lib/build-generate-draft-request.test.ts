import { describe, expect, it } from 'vitest';
import type { ActivityCommitRow } from '@/features/activity/types/activity-commit';
import { buildGenerateDraftRequest } from '@/features/standup/lib/build-generate-draft-request';

const commit: ActivityCommitRow = {
  id: '1',
  user_id: 'u1',
  workday: '2026-05-19',
  repository_full_name: 'acme/web',
  sha: 'abc123',
  message: 'Fix login',
  committed_at: '2026-05-19T14:00:00Z',
  html_url: 'https://github.com/acme/web/commit/abc123',
  author_login: 'dev',
  pr_number: null,
  pr_title: null,
  pr_url: null,
  pr_state: null,
  work_type: null,
  synced_at: '2026-05-19T15:00:00Z',
  created_at: '2026-05-19T15:00:00Z',
};

describe('buildGenerateDraftRequest', () => {
  it('scopes AI input to the selected Workday', () => {
    const request = buildGenerateDraftRequest('2026-05-19', [commit], []);

    expect(request.workday).toBe('2026-05-19');
    expect(request.commits).toHaveLength(1);
    expect(request.commits[0]?.sha).toBe('abc123');
  });
});
