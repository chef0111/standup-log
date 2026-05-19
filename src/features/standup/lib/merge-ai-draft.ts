import type { StandupSections } from '@/features/standup/lib/compose-standup';

export type MergeAiDraftInput = {
  aiYesterday: string;
  manual: StandupSections;
};

export function mergeAiDraft(input: MergeAiDraftInput): StandupSections {
  return {
    yesterday: input.aiYesterday.trim(),
    today: input.manual.today,
    blockers: input.manual.blockers,
  };
}
