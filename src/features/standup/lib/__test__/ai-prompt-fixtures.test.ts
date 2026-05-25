import { describe, expect, it } from 'vitest';
import { buildGenerateDraftRequest } from '@/features/standup/lib/build-generate-draft-request';
import type { ActivityCommitRow } from '@/features/standup/types/activity-commit';

function commit(
  overrides: Partial<ActivityCommitRow> = {}
): ActivityCommitRow {
  return {
    id: 'id-1',
    user_id: 'user-1',
    workday: '2026-05-24',
    repository_full_name: 'org/repo',
    sha: 'abc',
    message: 'feat: branch work',
    committed_at: '2026-05-24T12:00:00Z',
    html_url: 'https://github.com/org/repo/commit/abc',
    author_login: 'dev',
    pr_number: 42,
    pr_title: 'Feature branch',
    pr_url: 'https://github.com/org/repo/pull/42',
    pr_state: 'open',
    pr_merged_at: null,
    signal_disposition: 'in_progress',
    work_type: null,
    synced_at: '2026-05-24T12:01:00Z',
    created_at: '2026-05-24T12:01:00Z',
    ...overrides,
  };
}

describe('AI prompt payload fixtures', () => {
  it('preserves in-progress disposition for open PR commits', () => {
    const payload = buildGenerateDraftRequest('2026-05-24', [commit()], []);

    expect(payload.commits[0]?.signal_disposition).toBe('in_progress');
    expect(payload.commits[0]?.pr_merged_at).toBeNull();
  });

  it('preserves shipped disposition for merged work', () => {
    const payload = buildGenerateDraftRequest(
      '2026-05-24',
      [
        commit({
          sha: 'merged',
          signal_disposition: 'shipped',
          pr_state: 'closed',
          pr_merged_at: '2026-05-24T15:00:00Z',
        }),
      ],
      []
    );

    expect(payload.commits[0]?.signal_disposition).toBe('shipped');
    expect(payload.commits[0]?.pr_merged_at).toBe('2026-05-24T15:00:00Z');
  });
});
