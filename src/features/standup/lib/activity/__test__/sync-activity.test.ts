import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ParsedCommit } from '../github-commits';
import { syncActivityForWorkday } from '../sync-activity';

const { fetchAllRepoCommitsForWorkdayMock } = vi.hoisted(() => ({
  fetchAllRepoCommitsForWorkdayMock: vi.fn(),
}));

vi.mock('@/features/standup/lib/activity/github-commits', () => ({
  fetchAllRepoCommitsForWorkday: fetchAllRepoCommitsForWorkdayMock,
}));

function parsedCommit(sha: string): ParsedCommit {
  return {
    repository_full_name: 'org/repo',
    sha,
    message: 'feat: test',
    committed_at: '2026-05-24T12:00:00Z',
    html_url: `https://github.com/org/repo/commit/${sha}`,
    author_login: 'dev',
    pr_number: null,
    pr_title: null,
    pr_url: null,
    pr_state: null,
    pr_merged_at: null,
    signal_disposition: 'in_progress',
    work_type: null,
  };
}

function createSupabaseMock() {
  const state = {
    rows: [] as Record<string, unknown>[],
    deleted: [] as { workday: string; sha?: string[] }[],
  };

  type Filter = Record<string, unknown>;

  function applyFilters(rows: Record<string, unknown>[], filters: Filter) {
    return rows.filter((row) =>
      Object.entries(filters).every(([key, value]) => row[key] === value)
    );
  }

  function buildChain(initialFilters: Filter = {}) {
    let filters = { ...initialFilters };
    let inValues: string[] | undefined;

    const chain = {
      select: vi.fn(() => chain),
      eq: vi.fn((col: string, val: unknown) => {
        filters = { ...filters, [col]: val };
        return chain;
      }),
      in: vi.fn((_col: string, values: string[]) => {
        inValues = values;
        return chain;
      }),
      delete: vi.fn(() => ({
        eq: vi.fn((col: string, val: unknown) => {
          filters = { ...filters, [col]: val };
          return {
            eq: vi.fn((col2: string, val2: unknown) => {
              filters = { ...filters, [col2]: val2 };
              return {
                in: vi.fn((_col3: string, values: string[]) => {
                  state.deleted.push({
                    workday: filters.workday as string,
                    sha: values,
                  });
                  state.rows = state.rows.filter(
                    (row) =>
                      !(
                        row.user_id === filters.user_id &&
                        row.workday === filters.workday &&
                        values.includes(row.sha as string)
                      )
                  );
                  return Promise.resolve({ error: null });
                }),
                then: (resolve: (value: { error: null }) => void) => {
                  state.deleted.push({ workday: filters.workday as string });
                  state.rows = state.rows.filter(
                    (row) =>
                      !(
                        row.user_id === filters.user_id &&
                        row.workday === filters.workday
                      )
                  );
                  resolve({ error: null });
                  return Promise.resolve({ error: null });
                },
              };
            }),
          };
        }),
      })),
      upsert: vi.fn((rows: Record<string, unknown>[]) => {
        for (const row of rows) {
          const idx = state.rows.findIndex(
            (existing) =>
              existing.user_id === row.user_id && existing.sha === row.sha
          );
          if (idx >= 0) {
            state.rows[idx] = { ...state.rows[idx], ...row };
          } else {
            state.rows.push({ id: `id-${row.sha}`, ...row });
          }
        }
        return Promise.resolve({ error: null });
      }),
      order: vi.fn(() =>
        Promise.resolve({
          data: applyFilters(state.rows, filters),
          error: null,
        })
      ),
      then: (
        resolve: (value: {
          data: Record<string, unknown>[];
          error: null;
        }) => void
      ) => {
        let data = applyFilters(state.rows, filters);
        if (inValues) {
          data = data.filter((row) => inValues!.includes(row.sha as string));
        }
        resolve({ data, error: null });
        return Promise.resolve({ data, error: null });
      },
    };

    return chain;
  }

  const from = vi.fn((_table: string) => buildChain());

  return { from, state };
}

describe('syncActivityForWorkday', () => {
  beforeEach(() => {
    vi.mocked(fetchAllRepoCommitsForWorkdayMock).mockReset();
  });

  it('deletes stale rows when GitHub returns an empty set', async () => {
    const supabase = createSupabaseMock();
    supabase.state.rows.push({
      id: 'old',
      user_id: 'user-1',
      workday: '2026-05-24',
      sha: 'stale-sha',
      message: 'old',
      committed_at: '2026-05-24T10:00:00Z',
      html_url: 'https://example.com',
      author_login: 'dev',
      pr_number: null,
      pr_title: null,
      pr_url: null,
      pr_state: null,
      pr_merged_at: null,
      signal_disposition: 'shipped',
      work_type: null,
      synced_at: '2026-05-24T10:01:00Z',
      created_at: '2026-05-24T10:01:00Z',
      repository_full_name: 'org/repo',
    });

    vi.mocked(fetchAllRepoCommitsForWorkdayMock).mockResolvedValue([]);

    const result = await syncActivityForWorkday({
      supabase: supabase as never,
      token: 'token',
      userId: 'user-1',
      workday: '2026-05-24',
      repos: [{ full_name: 'org/repo', id: 1, private: false }],
      githubUserId: 1,
      githubLogin: 'dev',
    });

    expect(result.error).toBeNull();
    expect(result.commits).toHaveLength(0);
    expect(supabase.state.deleted.some((d) => d.workday === '2026-05-24')).toBe(
      true
    );
  });

  it('replaces workday rows with the latest GitHub sync', async () => {
    const supabase = createSupabaseMock();

    vi.mocked(fetchAllRepoCommitsForWorkdayMock).mockResolvedValue([
      parsedCommit('new-sha'),
    ]);

    const result = await syncActivityForWorkday({
      supabase: supabase as never,
      token: 'token',
      userId: 'user-1',
      workday: '2026-05-24',
      repos: [{ full_name: 'org/repo', id: 1, private: false }],
      githubUserId: 1,
      githubLogin: 'dev',
    });

    expect(result.error).toBeNull();
    expect(result.commits).toHaveLength(1);
    expect(result.commits[0]?.sha).toBe('new-sha');
    expect(result.commits[0]?.signal_disposition).toBe('in_progress');
  });

  it('preserves manually assigned work_type when re-syncing', async () => {
    const supabase = createSupabaseMock();
    supabase.state.rows.push({
      id: 'existing',
      user_id: 'user-1',
      workday: '2026-05-24',
      sha: 'merge-sha',
      message: 'Merge pull request #8',
      committed_at: '2026-05-24T23:54:00Z',
      html_url: 'https://github.com/org/repo/commit/merge-sha',
      author_login: 'dev',
      pr_number: 8,
      pr_title: null,
      pr_url: null,
      pr_state: null,
      pr_merged_at: null,
      signal_disposition: 'shipped',
      work_type: 'feature',
      synced_at: '2026-05-24T10:01:00Z',
      created_at: '2026-05-24T10:01:00Z',
      repository_full_name: 'org/repo',
    });

    vi.mocked(fetchAllRepoCommitsForWorkdayMock).mockResolvedValue([
      {
        ...parsedCommit('merge-sha'),
        message: 'Merge pull request #8',
        work_type: null,
        signal_disposition: 'shipped',
      },
    ]);

    const result = await syncActivityForWorkday({
      supabase: supabase as never,
      token: 'token',
      userId: 'user-1',
      workday: '2026-05-24',
      repos: [{ full_name: 'org/repo', id: 1, private: false }],
      githubUserId: 1,
      githubLogin: 'dev',
    });

    expect(result.error).toBeNull();
    expect(result.commits).toHaveLength(1);
    expect(result.commits[0]?.work_type).toBe('feature');
  });
});
