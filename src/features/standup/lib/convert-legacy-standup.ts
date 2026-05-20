import {
  formatWorkdayHeading,
  STANDUP_SUMMARY_PLACEHOLDER,
} from '@/features/standup/lib/compose-standup-markdown';
import type { Workday } from '@/features/standup/types/workday';

export type LegacyStandupColumns = {
  workday: Workday;
  yesterday_text: string;
  today_text: string;
  blockers_text: string;
};

function sectionBody(text: string, fallback = '-'): string {
  const trimmed = text.trim();
  return trimmed.length > 0 ? trimmed : fallback;
}

export function convertLegacyStandupToMarkdown(
  row: LegacyStandupColumns
): string {
  const dateLabel = formatWorkdayHeading(row.workday);

  return [
    `# Daily Standup — ${dateLabel}`,
    '',
    '## Summary',
    STANDUP_SUMMARY_PLACEHOLDER,
    '',
    '## ✅ What I did',
    sectionBody(row.yesterday_text),
    '',
    '## 🔨 Focusing on',
    sectionBody(row.today_text),
    '',
    '## 🚧 Blockers',
    sectionBody(row.blockers_text, 'No blockers'),
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
