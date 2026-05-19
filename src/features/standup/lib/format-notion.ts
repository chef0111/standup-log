import type { StandupSections } from '@/features/standup/lib/compose-standup';

function sectionContent(value: string): string {
  return value.trim() || '(none)';
}

export function formatNotionStandup(sections: StandupSections): string {
  return [
    '## Yesterday',
    sectionContent(sections.yesterday),
    '',
    '## Today',
    sectionContent(sections.today),
    '',
    '## Blockers',
    sectionContent(sections.blockers),
  ].join('\n');
}
