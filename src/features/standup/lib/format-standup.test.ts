import type { StandupSections } from '@/features/standup/lib/compose-standup';
import {
  formatStandup,
  type CopyFormat,
} from '@/features/standup/lib/format-standup';
import { describe, expect, it } from 'vitest';

const fixture: StandupSections = {
  yesterday: '- acme/web: Fix login bug',
  today: "What I'm working on today…",
  blockers: 'No blockers',
};

describe('formatStandup', () => {
  it('formats plain text', () => {
    expect(formatStandup(fixture, 'plain')).toMatchInlineSnapshot(`
      "Yesterday:
      - acme/web: Fix login bug

      Today:
      What I'm working on today…

      Blockers:
      No blockers"
    `);
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

  it('uses (none) for empty sections', () => {
    const empty: StandupSections = {
      yesterday: '',
      today: '   ',
      blockers: '',
    };
    expect(formatStandup(empty, 'plain')).toContain('Yesterday:\n(none)');
    expect(formatStandup(empty, 'slack')).toContain('*Yesterday*\n(none)');
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
