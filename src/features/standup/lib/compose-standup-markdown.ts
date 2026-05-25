import {
  isMergedPullRequest,
  isOpenPullRequest,
} from '@/features/standup/lib/activity/signal-disposition';
import { extractStandupSummary } from '@/features/standup/lib/parse-standup-markdown';
import { workdayToLocalDate } from '@/features/standup/lib/workday/workday';
import type { ActivityCommitRow } from '@/features/standup/types/activity-commit';
import type { ManualNoteRow } from '@/features/standup/types/manual-note';
import type { Workday } from '@/features/standup/types/workday';

export const MAX_ACTIVITY_BULLETS = 15;

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
    '- Tickets in progress:',
    '',
    '---',
    '*Time boxed: 5 min*',
  ].join('\n');
}

function firstLine(message: string): string {
  const line = message.split('\n')[0]?.trim() ?? message.trim();
  return line.length > 0 ? line : message.trim();
}

function formatCommitBullet(commit: ActivityCommitRow): string {
  const repo =
    commit.repository_full_name.split('/').pop() ?? commit.repository_full_name;
  const line = firstLine(commit.message);
  if (commit.pr_number != null && commit.pr_title) {
    return `- ${repo}: ${line} (PR #${commit.pr_number}: ${commit.pr_title})`;
  }
  return `- ${repo}: ${line}`;
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
  const sorted = [...input.commits].sort(
    (a, b) =>
      new Date(b.committed_at).getTime() - new Date(a.committed_at).getTime()
  );
  const visible = sorted.slice(0, MAX_ACTIVITY_BULLETS);
  const bullets = visible.map(formatCommitBullet);
  if (sorted.length > MAX_ACTIVITY_BULLETS) {
    bullets.push(
      `- …and ${sorted.length - MAX_ACTIVITY_BULLETS} more commit${sorted.length - MAX_ACTIVITY_BULLETS === 1 ? '' : 's'}`
    );
  }

  const whatIDid = bullets.length > 0 ? bullets.join('\n') : '-';

  const focusLines = input.carryForwardNotes.map((n) => `- ${n.body.trim()}`);
  const focusingOn = focusLines.length > 0 ? focusLines.join('\n') : '-';

  const blockerNotes = input.notes.filter((n) => n.is_blocker);
  const blockers =
    blockerNotes.length > 0
      ? blockerNotes.map((n) => `- ${n.body.trim()}`).join('\n')
      : '-';

  const mergedCount = input.commits.filter((c) =>
    isMergedPullRequest({
      pr_merged_at: c.pr_merged_at,
      pr_state: c.pr_state,
    })
  ).length;
  const openPrCount = input.commits.filter((c) =>
    isOpenPullRequest({
      pr_number: c.pr_number,
      pr_merged_at: c.pr_merged_at,
      pr_state: c.pr_state,
    })
  ).length;

  const dateLabel = formatWorkdayHeading(input.workday);

  return [
    `# Daily Standup — ${dateLabel}`,
    '',
    '## Summary',
    STANDUP_SUMMARY_PLACEHOLDER,
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
    `- PRs merged: ${mergedCount}`,
    '- Tickets in progress:',
    '',
    '---',
    '*Time boxed: 5 min*',
  ].join('\n');
}

export function isStandupSummaryReady(markdown: string): boolean {
  const summary = extractStandupSummary(markdown).trim();
  if (summary.length === 0) {
    return false;
  }
  if (summary === STANDUP_SUMMARY_PLACEHOLDER) {
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
