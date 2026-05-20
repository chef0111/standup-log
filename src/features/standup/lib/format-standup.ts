export const PLAIN_COPY_FORMAT = 'plain' as const;

export type CopyFormat = typeof PLAIN_COPY_FORMAT;

import { extractStandupSummary } from '@/features/standup/lib/parse-standup-markdown';

export function formatStandupForCopy(draftMarkdown: string): string {
  return draftMarkdown.trim();
}

export function formatStandupSummaryForCopy(draftMarkdown: string): string {
  return extractStandupSummary(draftMarkdown).trim();
}
