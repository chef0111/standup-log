import {
  commitFirstLine,
  parseCommitWorkType,
} from '@/features/standup/lib/activity/parse-commit-work-type';
import { describe, expect, it } from 'vitest';

describe('parseCommitWorkType', () => {
  it('maps conventional commit prefixes to work types', () => {
    expect(parseCommitWorkType('feat: add auth middleware')).toEqual({
      type: 'feature',
      symbol: '+',
      label: 'feature',
    });
    expect(
      parseCommitWorkType('fix(api): token refresh race condition')
    ).toEqual({
      type: 'bug',
      symbol: '!',
      label: 'bug',
    });
    expect(parseCommitWorkType('refactor: extract services layer')).toEqual({
      type: 'refactor',
      symbol: '~',
      label: 'refactor',
    });
    expect(parseCommitWorkType('docs: update README')).toEqual({
      type: 'chore',
      symbol: '~',
      label: 'chore',
    });
  });

  it('returns null for unrecognized prefixes', () => {
    expect(parseCommitWorkType('wip stuff')).toBeNull();
    expect(parseCommitWorkType('custom: thing')).toBeNull();
  });

  it('uses only the first line of multiline messages', () => {
    expect(parseCommitWorkType('feat: one\n\nbody')).toEqual({
      type: 'feature',
      symbol: '+',
      label: 'feature',
    });
  });
});

describe('commitFirstLine', () => {
  it('returns the first line', () => {
    expect(commitFirstLine('feat: hello\n\nworld')).toBe('feat: hello');
  });
});
