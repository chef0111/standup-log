import type { GenerateDraftCommitInput } from '@/features/standup/lib/ai-draft-types';
import {
  applyMultiRepoStructure,
  structureSummaryByRepo,
  structureWorkByRepo,
} from '@/features/standup/lib/enforce-standup-draft-structure';
import { groupCommitsForDraft } from '@/features/standup/lib/group-commits-for-draft';
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

const multiRepoCommits = [
  commit({
    sha: 'a1',
    repository_full_name: 'org/tournament-app',
    message: 'feat: athletes',
    pr_number: 188,
    pr_title: 'Athletes picker',
  }),
  commit({
    sha: 'b1',
    repository_full_name: 'org/tss',
    message: 'chore: release',
    pr_number: 182,
    pr_title: 'Release 2.1.6',
  }),
];

describe('structureWorkByRepo', () => {
  it('adds repo subheadings to flat AI bullets using PR numbers', () => {
    const groups = groupCommitsForDraft(multiRepoCommits);
    const flat = [
      '- Shipped athletes picker on tournament builder (PR #188)',
      '- Released tss 2.1.6 with setup checklist fix (PR #182)',
    ].join('\n');

    const structured = structureWorkByRepo(flat, groups);
    expect(structured).toContain('### tournament-app');
    expect(structured).toContain('### tss');
    expect(structured).toContain('PR #188');
    expect(structured).toContain('PR #182');
  });
});

describe('structureSummaryByRepo', () => {
  it('splits merged summary into per-repo labeled paragraphs', () => {
    const groups = groupCommitsForDraft(multiRepoCommits);
    const merged =
      'Shipped athletes picker on the tournament builder (PR 188). Also released tss 2.1.6 with setup checklist fix (PR 182).';

    const structured = structureSummaryByRepo(merged, groups);
    expect(structured).toContain('**tournament-app:**');
    expect(structured).toContain('**tss:**');
    expect(structured).toContain('PR 188');
    expect(structured).toContain('2.1.6');
  });
});

describe('applyMultiRepoStructure', () => {
  it('rewrites Summary and What I did when AI omits multi-repo structure', () => {
    const draft = `# Daily Standup — Sat, May 23, 2026

## Summary
Shipped athletes picker (PR 188). Also released tss 2.1.6 (PR 182).

## ✅ What I did
- Shipped athletes picker (PR #188)
- Released tss 2.1.6 (PR #182)

## 🔨 Focusing on
-

## 🚧 Blockers
-

## 📊 Metrics / Notes
- PRs open: 0
- PRs merged: 2

---
*Time boxed: 5 min*`;

    const enforced = applyMultiRepoStructure(draft, multiRepoCommits);
    expect(enforced).toContain('**tournament-app:**');
    expect(enforced).toContain('**tss:**');
    expect(enforced).toContain('### tournament-app');
    expect(enforced).toContain('### tss');
  });

  it('leaves single-repo drafts unchanged', () => {
    const single = [
      commit({
        sha: 'a1',
        repository_full_name: 'org/only',
        message: 'solo',
        pr_number: 1,
      }),
    ];
    const draft = `## Summary
One sentence for the team.

## ✅ What I did
- Shipped login fix (PR #1)`;

    const enforced = applyMultiRepoStructure(draft, single);
    expect(enforced).toBe(draft);
  });
});
