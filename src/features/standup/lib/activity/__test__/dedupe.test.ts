import { describe, expect, it } from 'vitest';
import { dedupeBySha } from '../github-commits';

describe('dedupeBySha', () => {
  it('keeps first occurrence per sha', () => {
    const input = [
      { sha: 'abc', message: 'first' },
      { sha: 'abc', message: 'duplicate' },
      { sha: 'def', message: 'other' },
    ];
    const result = dedupeBySha(input);
    expect(result).toHaveLength(2);
    expect(result[0]?.message).toBe('first');
    expect(result[1]?.sha).toBe('def');
  });
});
