import { parseStandupMarkdown } from '@/features/standup/lib/parse-standup-markdown';
import { Workday } from '../types/workday';

export const PLAIN_COPY_FORMAT = 'plain' as const;

export type CopyFormat = 'plain' | 'slack' | 'jira' | 'notion';

export const COPY_FORMAT_OPTIONS: {
  value: CopyFormat;
  label: string;
}[] = [
  { value: 'plain', label: 'Plain text' },
  { value: 'slack', label: 'Slack' },
  { value: 'jira', label: 'Jira' },
  { value: 'notion', label: 'Notion' },
];

export function normalizeCopyFormat(
  value: string | null | undefined
): CopyFormat {
  if (value === 'slack' || value === 'jira' || value === 'notion') {
    return value;
  }
  return PLAIN_COPY_FORMAT;
}

function bulletLines(body: string, slack: boolean): string {
  const lines = body.split('\n').filter((line) => line.trim().length > 0);
  if (lines.length === 0) {
    return '-';
  }
  return lines
    .map((line) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('- ')) {
        const content = trimmed.slice(2);
        return slack ? `• ${content}` : `- ${content}`;
      }
      return slack ? `• ${trimmed}` : `- ${trimmed}`;
    })
    .join('\n');
}

function formatSection(
  title: string,
  body: string,
  format: CopyFormat
): string {
  const content = body.trim().length > 0 ? body.trim() : '-';

  switch (format) {
    case 'slack':
      return `*${title}*\n${bulletLines(content, true)}`;
    case 'jira':
      return `h2. ${title}\n${bulletLines(content, false)}`;
    case 'notion':
      return `## ${title}\n${bulletLines(content, false)}`;
    default:
      return `## ${title}\n${content}`;
  }
}

function formatStructuredStandup(
  parsed: ReturnType<typeof parseStandupMarkdown>,
  format: CopyFormat,
  titleLine: string | null
): string {
  const sections = [
    formatSection('Summary', parsed.summary, format),
    formatSection('What I did', parsed.whatIDid, format),
    formatSection('Focusing on', parsed.focusingOn, format),
    formatSection('Blockers', parsed.blockers, format),
  ];

  if (parsed.metrics.trim().length > 0) {
    sections.push(formatSection('Metrics / Notes', parsed.metrics, format));
  }

  const body = sections.join('\n\n');
  if (format === 'plain') {
    return titleLine ? `${titleLine}\n\n${body}` : body;
  }
  return titleLine ? `${titleLine}\n\n${body}` : body;
}

function extractTitleLine(markdown: string): string | null {
  const first = markdown.trim().split('\n')[0]?.trim() ?? '';
  if (first.startsWith('# ')) {
    return first.replace(/^#\s+/, '').trim();
  }
  return null;
}

export function formatStandupForCopy(
  draftMarkdown: string,
  format: CopyFormat = PLAIN_COPY_FORMAT
): string {
  const trimmed = draftMarkdown.trim();
  if (format === PLAIN_COPY_FORMAT) {
    return trimmed;
  }

  const parsed = parseStandupMarkdown(trimmed);
  const titleLine = extractTitleLine(trimmed);
  const title =
    format === 'slack' && titleLine
      ? `*${titleLine}*`
      : format === 'jira' && titleLine
        ? `h1. ${titleLine}`
        : titleLine
          ? `# ${titleLine}`
          : null;

  return formatStructuredStandup(parsed, format, title);
}

export function formatStandupSummaryForCopy(
  draftMarkdown: string,
  format: CopyFormat = PLAIN_COPY_FORMAT
): string {
  const summary = parseStandupMarkdown(draftMarkdown).summary.trim();
  if (format === PLAIN_COPY_FORMAT) {
    return summary;
  }
  if (format === 'slack') {
    return summary.length > 0 ? `*Summary*\n${summary}` : summary;
  }
  if (format === 'jira') {
    return summary.length > 0 ? `h2. Summary\n${summary}` : summary;
  }
  return summary.length > 0 ? `## Summary\n${summary}` : summary;
}

export function formatLogTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  } catch {
    return '--:--';
  }
}

export function formatWorkdayTitle(workday: Workday): string {
  const [year, month, day] = workday.split('-').map(Number);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(new Date(year, month - 1, day));
}
