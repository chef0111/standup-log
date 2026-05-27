import type { GenerateDraftCommitInput } from '@/features/standup/lib/ai-draft-types';
import {
  formatFallbackSummarySection,
  formatWhatIDidSection,
  groupCommitsForDraft,
} from '@/features/standup/lib/group-commits-for-draft';
import { describe, expect, it } from 'vitest';

function commit(
  overrides: Partial<GenerateDraftCommitInput> & {
    sha: string;
    repository_full_name: string;
    message: string;
  }
): GenerateDraftCommitInput {
  return {
    pr_number: null,
    pr_title: null,
    signal_disposition: 'shipped',
    ...overrides,
  };
}

describe('groupCommitsForDraft', () => {
  it('groups two repositories separately', () => {
    const groups = groupCommitsForDraft([
      commit({
        sha: 'a1',
        repository_full_name: 'org/standup-log',
        message: 'feat: one',
        pr_number: 6,
        pr_title: 'Phase 11',
      }),
      commit({
        sha: 'b1',
        repository_full_name: 'org/tku-sparring',
        message: 'fix: bracket',
        pr_number: 175,
        pr_title: 'Release',
      }),
    ]);

    expect(groups).toHaveLength(2);
    expect(groups[0]?.repositoryShortName).toBe('standup-log');
    expect(groups[1]?.repositoryShortName).toBe('tku-sparring');
  });

  it('merges commits on the same PR into one theme', () => {
    const groups = groupCommitsForDraft([
      commit({
        sha: 'a1',
        repository_full_name: 'org/app',
        message: 'feat: first',
        pr_number: 6,
        pr_title: 'Big PR',
      }),
      commit({
        sha: 'a2',
        repository_full_name: 'org/app',
        message: 'feat: second',
        pr_number: 6,
        pr_title: 'Big PR',
      }),
    ]);

    expect(groups).toHaveLength(1);
    expect(groups[0]?.prThemes).toHaveLength(1);
    expect(groups[0]?.prThemes[0]?.commits).toHaveLength(2);
  });
});

describe('formatWhatIDidSection', () => {
  it('uses repo subheadings when multiple repositories', () => {
    const groups = groupCommitsForDraft([
      commit({
        sha: 'a1',
        repository_full_name: 'org/a',
        message: 'one',
        pr_number: 1,
        pr_title: 'A',
      }),
      commit({
        sha: 'b1',
        repository_full_name: 'org/b',
        message: 'two',
        pr_number: 2,
        pr_title: 'B',
      }),
    ]);
    const section = formatWhatIDidSection(groups);
    expect(section).toContain('### a');
    expect(section).toContain('### b');
  });

  it('omits repo subheading for a single repository', () => {
    const groups = groupCommitsForDraft([
      commit({
        sha: 'a1',
        repository_full_name: 'org/only',
        message: 'solo',
        pr_number: 1,
        pr_title: 'Only',
      }),
    ]);
    const section = formatWhatIDidSection(groups);
    expect(section).not.toContain('###');
    expect(section).toContain('PR #1');
  });
});

describe('formatFallbackSummarySection', () => {
  it('prompts per repo when multiple repositories', () => {
    const groups = groupCommitsForDraft([
      commit({
        sha: 'a1',
        repository_full_name: 'org/a',
        message: 'one',
      }),
      commit({
        sha: 'b1',
        repository_full_name: 'org/b',
        message: 'two',
      }),
    ]);
    const summary = formatFallbackSummarySection(groups);
    expect(summary).toContain('**a:**');
    expect(summary).toContain('**b:**');
    expect(summary).toContain('1–3 outcome sentences');
  });

  it('uses single prompt for one repository', () => {
    const groups = groupCommitsForDraft([
      commit({
        sha: 'a1',
        repository_full_name: 'org/only',
        message: 'solo',
      }),
    ]);
    const summary = formatFallbackSummarySection(groups);
    expect(summary).not.toContain('**');
    expect(summary).toContain('1–3 outcome sentences');
  });
});
