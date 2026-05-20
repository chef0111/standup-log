import type { StandupSections } from '@/features/standup/lib/compose-standup';

export type ParsedStandupMarkdown = {
  whatIDid: string;
  focusingOn: string;
  blockers: string;
  metrics: string;
};

const SECTION_HEADINGS: { key: keyof ParsedStandupMarkdown; pattern: RegExp }[] =
  [
    { key: 'whatIDid', pattern: /^##\s*✅\s*What I did\s*$/im },
    { key: 'focusingOn', pattern: /^##\s*🔨\s*Focusing on\s*$/im },
    { key: 'blockers', pattern: /^##\s*🚧\s*Blockers\s*$/im },
    { key: 'metrics', pattern: /^##\s*📊\s*Metrics\s*\/\s*Notes\s*$/im },
  ];

function extractSection(markdown: string, pattern: RegExp): string {
  const match = markdown.match(pattern);
  if (!match || match.index === undefined) {
    return '';
  }

  const start = match.index + match[0].length;
  const rest = markdown.slice(start);
  const nextHeading = rest.search(/^##\s+/m);
  const body = nextHeading === -1 ? rest : rest.slice(0, nextHeading);
  return body.trim();
}

export function parseStandupMarkdown(markdown: string): ParsedStandupMarkdown {
  const parsed: ParsedStandupMarkdown = {
    whatIDid: '',
    focusingOn: '',
    blockers: '',
    metrics: '',
  };

  for (const { key, pattern } of SECTION_HEADINGS) {
    parsed[key] = extractSection(markdown, pattern);
  }

  return parsed;
}

export function parsedToStandupSections(
  parsed: ParsedStandupMarkdown
): StandupSections {
  return {
    yesterday: parsed.whatIDid,
    today: parsed.focusingOn,
    blockers: parsed.blockers,
  };
}

export function standupSectionsFromMarkdown(markdown: string): StandupSections {
  return parsedToStandupSections(parseStandupMarkdown(markdown));
}
