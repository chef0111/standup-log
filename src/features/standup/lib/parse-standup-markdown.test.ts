import { STANDUP_SUMMARY_PLACEHOLDER } from '@/features/standup/lib/compose-standup-markdown';
import {
  extractStandupSummary,
  parseStandupMarkdown,
  standupSectionsFromMarkdown,
} from '@/features/standup/lib/parse-standup-markdown';
import { describe, expect, it } from 'vitest';

const sample = `# Daily Standup — Mon, May 19, 2026

## Summary
Yesterday I finished the login fix and merged PR #42. Today I am continuing the dashboard refactor.

## ✅ What I did
- Fixed login

## 🔨 Focusing on
- Dashboard

## 🚧 Blockers
- None

## 📊 Metrics / Notes
- PRs open: 1
- PRs merged: 0
- Tickets in progress:

---
*Time boxed: 5 min*`;

describe('parseStandupMarkdown', () => {
  it('extracts Summary and template sections', () => {
    const parsed = parseStandupMarkdown(sample);

    expect(parsed.summary).toContain('login fix');
    expect(parsed.whatIDid).toContain('Fixed login');
    expect(parsed.focusingOn).toContain('Dashboard');
    expect(parsed.blockers).toContain('None');
    expect(parsed.metrics).toContain('PRs open: 1');
  });

  it('extractStandupSummary returns summary body only', () => {
    expect(extractStandupSummary(sample)).toContain('PR #42');
    expect(extractStandupSummary(sample)).not.toContain('## ✅');
  });

  it('maps to legacy copy section shape', () => {
    const sections = standupSectionsFromMarkdown(sample);
    expect(sections.yesterday).toContain('Fixed login');
    expect(sections.today).toContain('Dashboard');
    expect(sections.blockers).toContain('None');
  });

  it('treats placeholder summary as empty extract', () => {
    const markdown = `## Summary\n${STANDUP_SUMMARY_PLACEHOLDER}`;
    expect(extractStandupSummary(markdown)).toBe(STANDUP_SUMMARY_PLACEHOLDER);
  });
});
