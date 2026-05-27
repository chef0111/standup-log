import {
  formatWorkdayHeading,
  isStandupMarkdownEmpty,
  STANDUP_SUMMARY_PLACEHOLDER,
} from '@/features/standup/lib/compose-standup-markdown';
import { extractStandupSummary } from '@/features/standup/lib/parse-standup-markdown';
import type { Workday } from '@/features/standup/types/workday';

export const NO_UPDATE_SUMMARY = 'No update for this Workday.';

export function buildNoUpdateStandupMarkdown(workday: Workday): string {
  const dateLabel = formatWorkdayHeading(workday);
  return [
    `# Daily Standup — ${dateLabel}`,
    '',
    '## Summary',
    NO_UPDATE_SUMMARY,
    '',
    '## ✅ What I did',
    '-',
    '',
    '## 🔨 Focusing on',
    '-',
    '',
    '## 🚧 Blockers',
    'No blockers',
    '',
    '## 📊 Metrics / Notes',
    '- PRs open:',
    '- PRs merged:',
    '',
    '---',
    '*Time boxed: 5 min*',
  ].join('\n');
}

export function isNoUpdateStandup(markdown: string): boolean {
  const summary = extractStandupSummary(markdown).trim();
  return summary === NO_UPDATE_SUMMARY;
}

export function isWorkdayInputEmpty(
  commitCount: number,
  noteCount: number
): boolean {
  return commitCount === 0 && noteCount === 0;
}

export function isStandupCopyEmpty(markdown: string): boolean {
  if (isNoUpdateStandup(markdown)) {
    return false;
  }
  if (isStandupMarkdownEmpty(markdown)) {
    return true;
  }
  const summary = extractStandupSummary(markdown).trim();
  return summary.length === 0 || summary === STANDUP_SUMMARY_PLACEHOLDER;
}
