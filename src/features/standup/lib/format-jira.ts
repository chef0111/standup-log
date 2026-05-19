import type { StandupSections } from '@/features/standup/lib/compose-standup';

function sectionContent(value: string): string {
  return value.trim() || '(none)';
}

export function formatJiraStandup(sections: StandupSections): string {
  return [
    'h3. Yesterday',
    sectionContent(sections.yesterday),
    '',
    'h3. Today',
    sectionContent(sections.today),
    '',
    'h3. Blockers',
    sectionContent(sections.blockers),
  ].join('\n');
}
