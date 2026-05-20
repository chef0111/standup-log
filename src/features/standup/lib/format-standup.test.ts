import {
  formatStandupForCopy,
  formatStandupSummaryForCopy,
} from '@/features/standup/lib/format-standup';
import { describe, expect, it } from 'vitest';

const fixture = `# Daily Standup — Mon, May 19, 2026

## Summary
Yesterday I finished the login fix.

## ✅ What I did
- acme/web: Fix login bug

## 🔨 Focusing on
What I'm working on today…

## 🚧 Blockers
No blockers`;

describe('formatStandupForCopy', () => {
  it('returns trimmed full markdown', () => {
    expect(formatStandupForCopy(fixture)).toBe(fixture);
  });

  it('returns summary section only', () => {
    expect(formatStandupSummaryForCopy(fixture)).toBe(
      'Yesterday I finished the login fix.'
    );
  });
});
