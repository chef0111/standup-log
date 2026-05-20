import {
  formatStandup,
  type CopyFormat,
} from '@/features/standup/lib/format-standup';
import { describe, expect, it } from 'vitest';

const fixture = `# Daily Standup — Mon, May 19, 2026

## ✅ What I did
- acme/web: Fix login bug

## 🔨 Focusing on
What I'm working on today…

## 🚧 Blockers
No blockers

## 📊 Metrics / Notes
- PRs open:
- PRs merged:
- Tickets in progress:

---
*Time boxed: 5 min*`;

describe('formatStandup', () => {
  it('returns raw markdown for plain format', () => {
    expect(formatStandup(fixture, 'plain')).toBe(fixture.trim());
  });

  it('formats slack markdown', () => {
    expect(formatStandup(fixture, 'slack')).toMatchInlineSnapshot(`
      "*Yesterday*
      - acme/web: Fix login bug

      *Today*
      What I'm working on today…

      *Blockers*
      No blockers"
    `);
  });

  it('formats jira wiki markup', () => {
    expect(formatStandup(fixture, 'jira')).toMatchInlineSnapshot(`
      "h3. Yesterday
      - acme/web: Fix login bug

      h3. Today
      What I'm working on today…

      h3. Blockers
      No blockers"
    `);
  });

  it('formats notion-style markdown', () => {
    expect(formatStandup(fixture, 'notion')).toMatchInlineSnapshot(`
      "## Yesterday
      - acme/web: Fix login bug

      ## Today
      What I'm working on today…

      ## Blockers
      No blockers"
    `);
  });
});

describe('CopyFormat', () => {
  it('includes all MVP formats', () => {
    const formats: CopyFormat[] = ['plain', 'slack', 'jira', 'notion'];
    for (const format of formats) {
      expect(formatStandup(fixture, format).length).toBeGreaterThan(0);
    }
  });
});
