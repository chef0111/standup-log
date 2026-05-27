import {
  isMergedPullRequest,
  isOpenPullRequest,
} from '@/features/standup/lib/activity/signal-disposition';
import type { GenerateDraftCommitInput } from '@/features/standup/lib/ai-draft-types';
import {
  FALLBACK_SUMMARY_PROMPT_SINGLE,
  formatFallbackSummarySection,
  formatWhatIDidSection,
  groupCommitsForDraft,
} from '@/features/standup/lib/group-commits-for-draft';
import { extractStandupSummary } from '@/features/standup/lib/parse-standup-markdown';
import { workdayToLocalDate } from '@/features/standup/lib/workday/workday';
import type { ActivityCommitRow } from '@/features/standup/types/activity-commit';
import type { ManualNoteRow } from '@/features/standup/types/manual-note';
import type { Workday } from '@/features/standup/types/workday';

/** @deprecated Empty-template placeholder only; fallback drafts use per-repo prompts. */
export const STANDUP_SUMMARY_PLACEHOLDER =
  'Write a short standup message for your team chat…';

export function formatWorkdayHeading(workday: Workday): string {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(workdayToLocalDate(workday));
}

function toDraftCommit(commit: ActivityCommitRow): GenerateDraftCommitInput {
  return {
    sha: commit.sha,
    message: commit.message,
    repository_full_name: commit.repository_full_name,
    pr_number: commit.pr_number,
    pr_title: commit.pr_title,
    pr_state: commit.pr_state,
    pr_merged_at: commit.pr_merged_at,
    signal_disposition: commit.signal_disposition,
  };
}

function countUniqueMergedPrs(commits: ActivityCommitRow[]): number {
  const merged = new Set<number>();
  for (const commit of commits) {
    if (commit.pr_number == null) {
      continue;
    }
    if (
      isMergedPullRequest({
        pr_merged_at: commit.pr_merged_at,
        pr_state: commit.pr_state,
      })
    ) {
      merged.add(commit.pr_number);
    }
  }
  return merged.size;
}

function countUniqueOpenPrs(commits: ActivityCommitRow[]): number {
  const open = new Set<number>();
  for (const commit of commits) {
    if (
      isOpenPullRequest({
        pr_number: commit.pr_number,
        pr_merged_at: commit.pr_merged_at,
        pr_state: commit.pr_state,
      })
    ) {
      open.add(commit.pr_number!);
    }
  }
  return open.size;
}

export function buildEmptyStandupTemplate(workday: Workday): string {
  const dateLabel = formatWorkdayHeading(workday);
  return [
    `# Daily Standup — ${dateLabel}`,
    '',
    '## Summary',
    STANDUP_SUMMARY_PLACEHOLDER,
    '',
    '## ✅ What I did',
    '-',
    '',
    '## 🔨 Focusing on',
    '-',
    '',
    '## 🚧 Blockers',
    '-',
    '',
    '## 📊 Metrics / Notes',
    '- PRs open:',
    '- PRs merged:',
    '',
    '---',
    '*Time boxed: 5 min*',
  ].join('\n');
}

export type ComposeManualMarkdownInput = {
  workday: Workday;
  commits: ActivityCommitRow[];
  notes: ManualNoteRow[];
  carryForwardNotes: ManualNoteRow[];
};

export function composeManualMarkdown(
  input: ComposeManualMarkdownInput
): string {
  const draftCommits = input.commits.map(toDraftCommit);
  const repoGroups = groupCommitsForDraft(draftCommits);
  const whatIDid = formatWhatIDidSection(repoGroups);
  const summarySection = formatFallbackSummarySection(repoGroups);

  const focusLines = input.carryForwardNotes.map((n) => `- ${n.body.trim()}`);
  const focusingOn = focusLines.length > 0 ? focusLines.join('\n') : '-';

  const blockerNotes = input.notes.filter((n) => n.is_blocker);
  const blockers =
    blockerNotes.length > 0
      ? blockerNotes.map((n) => `- ${n.body.trim()}`).join('\n')
      : '-';

  const openPrCount = countUniqueOpenPrs(input.commits);
  const mergedPrCount = countUniqueMergedPrs(input.commits);
  const dateLabel = formatWorkdayHeading(input.workday);

  return [
    `# Daily Standup — ${dateLabel}`,
    '',
    '## Summary',
    summarySection,
    '',
    '## ✅ What I did',
    whatIDid,
    '',
    '## 🔨 Focusing on',
    focusingOn,
    '',
    '## 🚧 Blockers',
    blockers,
    '',
    '## 📊 Metrics / Notes',
    `- PRs open: ${openPrCount}`,
    `- PRs merged: ${mergedPrCount}`,
    '',
    '---',
    '*Time boxed: 5 min*',
  ].join('\n');
}

export function isFallbackSummaryContent(summary: string): boolean {
  const trimmed = summary.trim();
  if (trimmed.includes(FALLBACK_SUMMARY_PROMPT_SINGLE)) {
    return true;
  }
  if (/^\*\*[^*]+:\*\*\s*\*\(Write 1–3 outcome sentences/.test(trimmed)) {
    return true;
  }
  return false;
}

export function isStandupSummaryReady(markdown: string): boolean {
  const summary = extractStandupSummary(markdown).trim();
  if (summary.length === 0) {
    return false;
  }
  if (summary === STANDUP_SUMMARY_PLACEHOLDER) {
    return false;
  }
  if (isFallbackSummaryContent(summary)) {
    return false;
  }
  if (summary === '-') {
    return false;
  }
  return true;
}

export function isStandupMarkdownEmpty(markdown: string): boolean {
  const trimmed = markdown.trim();
  if (trimmed.length === 0) {
    return true;
  }
  const template = buildEmptyStandupTemplate('2000-01-01');
  const normalized = trimmed.replace(
    /# Daily Standup —[^\n]+/,
    '# Daily Standup — Mon, Jan 1, 2000'
  );
  const normalizedTemplate = template.replace(
    /# Daily Standup —[^\n]+/,
    '# Daily Standup — Mon, Jan 1, 2000'
  );
  return normalized === normalizedTemplate;
}
