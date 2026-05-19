import type { StandupSections } from '@/features/standup/lib/compose-standup';

export function formatPlainStandup(sections: StandupSections): string {
  return [
    'Yesterday:',
    sections.yesterday.trim() || '(none)',
    '',
    'Today:',
    sections.today.trim() || '(none)',
    '',
    'Blockers:',
    sections.blockers.trim() || '(none)',
  ].join('\n');
}
