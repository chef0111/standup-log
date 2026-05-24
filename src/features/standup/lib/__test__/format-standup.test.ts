import {
  formatStandupForCopy,
  formatStandupSummaryForCopy,
  normalizeCopyFormat,
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

describe('normalizeCopyFormat', () => {
  it('defaults unknown values to plain', () => {
    expect(normalizeCopyFormat(null)).toBe('plain');
    expect(normalizeCopyFormat('invalid')).toBe('plain');
  });

  it('preserves known formats', () => {
    expect(normalizeCopyFormat('slack')).toBe('slack');
  });
});

describe('formatStandupForCopy', () => {
  it('returns trimmed full markdown for plain', () => {
    expect(formatStandupForCopy(fixture)).toBe(fixture);
    expect(formatStandupForCopy(fixture, 'plain')).toBe(fixture);
  });

  it('slack wraps sections with bold labels', () => {
    const out = formatStandupForCopy(fixture, 'slack');
    expect(out).toContain('*Summary*');
    expect(out).toContain('*What I did*');
    expect(out).toContain('• acme/web: Fix login bug');
  });

  it('jira uses h2 headings', () => {
    const out = formatStandupForCopy(fixture, 'jira');
    expect(out).toMatch(/h2\. Summary/);
    expect(out).toMatch(/h2\. What I did/);
    expect(out).toContain('- acme/web: Fix login bug');
  });

  it('notion uses markdown headings without emoji', () => {
    const out = formatStandupForCopy(fixture, 'notion');
    expect(out).toContain('## Summary');
    expect(out).toContain('## What I did');
    expect(out).not.toContain('✅');
  });
});

describe('formatStandupSummaryForCopy', () => {
  it('returns summary prose for plain', () => {
    expect(formatStandupSummaryForCopy(fixture)).toBe(
      'Yesterday I finished the login fix.'
    );
  });

  it('slack wraps summary', () => {
    expect(formatStandupSummaryForCopy(fixture, 'slack')).toBe(
      '*Summary*\nYesterday I finished the login fix.'
    );
  });
});
