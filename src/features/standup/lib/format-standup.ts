import type { StandupSections } from '@/features/standup/lib/compose-standup';
import { formatJiraStandup } from '@/features/standup/lib/format-jira';
import { formatNotionStandup } from '@/features/standup/lib/format-notion';
import { formatPlainStandup } from '@/features/standup/lib/format-plain';
import { formatSlackStandup } from '@/features/standup/lib/format-slack';

export type CopyFormat = 'plain' | 'slack' | 'jira' | 'notion';

export const COPY_FORMATS: CopyFormat[] = ['plain', 'slack', 'jira', 'notion'];

export const COPY_FORMAT_LABELS: Record<CopyFormat, string> = {
  plain: 'Plain',
  slack: 'Slack',
  jira: 'Jira',
  notion: 'Notion',
};

export function isCopyFormat(value: string): value is CopyFormat {
  return COPY_FORMATS.includes(value as CopyFormat);
}

export function formatStandup(
  sections: StandupSections,
  format: CopyFormat
): string {
  switch (format) {
    case 'plain':
      return formatPlainStandup(sections);
    case 'slack':
      return formatSlackStandup(sections);
    case 'jira':
      return formatJiraStandup(sections);
    case 'notion':
      return formatNotionStandup(sections);
  }
}
