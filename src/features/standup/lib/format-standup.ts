import { formatJiraStandup } from '@/features/standup/lib/format-jira';
import { formatNotionStandup } from '@/features/standup/lib/format-notion';
import { formatPlainStandup } from '@/features/standup/lib/format-plain';
import { formatSlackStandup } from '@/features/standup/lib/format-slack';
import { standupSectionsFromMarkdown } from '@/features/standup/lib/parse-standup-markdown';

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
  draftMarkdown: string,
  format: CopyFormat
): string {
  if (format === 'plain') {
    return draftMarkdown.trim();
  }

  const sections = standupSectionsFromMarkdown(draftMarkdown);

  switch (format) {
    case 'slack':
      return formatSlackStandup(sections);
    case 'jira':
      return formatJiraStandup(sections);
    case 'notion':
      return formatNotionStandup(sections);
    default:
      return formatPlainStandup(sections);
  }
}
