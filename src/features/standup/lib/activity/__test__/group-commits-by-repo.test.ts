import type { ActivityCommitRow } from '@/features/standup/types/activity-commit';
import { describe, expect, it } from 'vitest';
import { groupCommitsByRepo } from '../group-commits-by-repo';

function commit(sha: string, repository_full_name: string): ActivityCommitRow {
  return {
    sha,
    repository_full_name,
    message: sha,
    committed_at: '2026-05-23T12:00:00Z',
    html_url: '',
    user_id: 'u1',
    workday: '2026-05-23',
    id: sha,
    author_login: null,
    pr_number: null,
    pr_title: null,
    pr_url: null,
    pr_state: null,
    work_type: null,
    synced_at: '',
    pr_merged_at: null,
    signal_disposition: 'shipped',
    created_at: '2026-05-23T12:00:00Z',
  };
}

describe('groupCommitsByRepo', () => {
  it('groups commits by repository in first-seen order', () => {
    const groups = groupCommitsByRepo([
      commit('a', 'org/alpha'),
      commit('b', 'org/beta'),
      commit('c', 'org/alpha'),
    ]);

    expect(groups).toEqual([
      {
        repositoryFullName: 'org/alpha',
        commits: [commit('a', 'org/alpha'), commit('c', 'org/alpha')],
      },
      { repositoryFullName: 'org/beta', commits: [commit('b', 'org/beta')] },
    ]);
  });
});
