import { describe, expect, it } from 'vitest';
import { buildCommitSearchQuery, dedupeCommitsBySha } from '../github-commits';

describe('buildCommitSearchQuery', () => {
  it('uses a half-open committer-date range ending on the next calendar day', () => {
    expect(
      buildCommitSearchQuery({
        repositoryFullName: 'org/repo',
        authorLogin: 'octocat',
        workday: '2026-05-24',
      })
    ).toBe(
      'repo:org/repo+author:octocat+committer-date:2026-05-24..2026-05-25'
    );
  });

  it('returns empty string for malformed repository names', () => {
    expect(
      buildCommitSearchQuery({
        repositoryFullName: 'invalid',
        authorLogin: 'octocat',
        workday: '2026-05-24',
      })
    ).toBe('');
  });
});

describe('dedupeCommitsBySha', () => {
  it('keeps first occurrence per sha', () => {
    const rows = dedupeCommitsBySha([
      { sha: 'a', n: 1 },
      { sha: 'a', n: 2 },
      { sha: 'b', n: 3 },
    ]);
    expect(rows).toEqual([
      { sha: 'a', n: 1 },
      { sha: 'b', n: 3 },
    ]);
  });
});
