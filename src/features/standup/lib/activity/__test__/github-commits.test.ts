import { describe, expect, it } from 'vitest';
import {
  buildSearchQuery,
  buildSearchUrl,
  dedupeBySha,
  isInWorkdayBounds,
} from '../github-commits';

describe('buildSearchQuery', () => {
  it('scopes search to repo and author only (workday filtered after fetch)', () => {
    expect(
      buildSearchQuery({
        repositoryFullName: 'org/repo',
        authorLogin: 'octocat',
      })
    ).toBe('repo:org/repo+author:octocat');
  });

  it('returns empty string for malformed repository names', () => {
    expect(
      buildSearchQuery({
        repositoryFullName: 'invalid',
        authorLogin: 'octocat',
      })
    ).toBe('');
  });
});

describe('buildSearchUrl', () => {
  it('preserves plus signs in the query string for GitHub AND syntax', () => {
    const url = buildSearchUrl('repo:org/repo+author:octocat', 100);
    expect(url).toContain('q=repo:org/repo+author:octocat');
    expect(url).not.toContain('%2B');
  });
});

describe('isInWorkdayBounds', () => {
  it('accepts commits within the half-open workday interval', () => {
    expect(
      isInWorkdayBounds(
        '2026-05-25T06:51:45.000Z',
        '2026-05-24T17:00:00.000Z',
        '2026-05-25T17:00:00.000Z'
      )
    ).toBe(true);
  });

  it('rejects commits outside the workday interval', () => {
    expect(
      isInWorkdayBounds(
        '2026-05-24T12:00:00.000Z',
        '2026-05-24T17:00:00.000Z',
        '2026-05-25T17:00:00.000Z'
      )
    ).toBe(false);
  });
});

describe('dedupeBySha', () => {
  it('keeps first occurrence per sha', () => {
    const rows = dedupeBySha([
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
