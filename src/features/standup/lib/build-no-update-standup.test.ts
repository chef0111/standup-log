import {
  NO_UPDATE_SUMMARY,
  buildNoUpdateStandupMarkdown,
  isNoUpdateStandup,
  isWorkdayInputEmpty,
} from '@/features/standup/lib/build-no-update-standup';
import { isStandupMarkdownEmpty } from '@/features/standup/lib/compose-standup-markdown';
import { describe, expect, it } from 'vitest';

describe('buildNoUpdateStandupMarkdown', () => {
  it('builds explicit no-update standup', () => {
    const md = buildNoUpdateStandupMarkdown('2026-05-19');
    expect(md).toContain('May 19, 2026');
    expect(md).toContain(NO_UPDATE_SUMMARY);
    expect(md).toContain('No blockers');
    expect(isNoUpdateStandup(md)).toBe(true);
    expect(isStandupMarkdownEmpty(md)).toBe(false);
  });
});

describe('isWorkdayInputEmpty', () => {
  it('is true only with zero commits and notes', () => {
    expect(isWorkdayInputEmpty(0, 0)).toBe(true);
    expect(isWorkdayInputEmpty(1, 0)).toBe(false);
    expect(isWorkdayInputEmpty(0, 1)).toBe(false);
  });
});
