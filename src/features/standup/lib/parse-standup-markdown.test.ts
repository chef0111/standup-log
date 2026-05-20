import { describe, expect, it } from 'vitest';
import {
  parseStandupMarkdown,
  standupSectionsFromMarkdown,
} from '@/features/standup/lib/parse-standup-markdown';

const sample = `# Daily Standup — Mon, May 19, 2026

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
  it('extracts template sections', () => {
    const parsed = parseStandupMarkdown(sample);

    expect(parsed.whatIDid).toContain('Fixed login');
    expect(parsed.focusingOn).toContain('Dashboard');
    expect(parsed.blockers).toContain('None');
    expect(parsed.metrics).toContain('PRs open: 1');
  });

  it('maps to legacy copy section shape', () => {
    const sections = standupSectionsFromMarkdown(sample);
    expect(sections.yesterday).toContain('Fixed login');
    expect(sections.today).toContain('Dashboard');
    expect(sections.blockers).toContain('None');
  });
});
