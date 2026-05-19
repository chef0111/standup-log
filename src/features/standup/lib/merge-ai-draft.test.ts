import {
  composeManualStandup,
  DEFAULT_BLOCKERS,
} from '@/features/standup/lib/compose-standup';
import { mergeAiDraft } from '@/features/standup/lib/merge-ai-draft';
import type { ManualNoteRow } from '@/features/notes/types/manual-note';
import { describe, expect, it } from 'vitest';

const blockerNote: ManualNoteRow = {
  id: 'n1',
  user_id: 'u1',
  workday: '2026-05-18',
  body: 'Waiting on API access',
  is_blocker: true,
  is_carry_forward: false,
  created_at: '2026-05-18T10:00:00Z',
  updated_at: '2026-05-18T10:00:00Z',
};

describe('mergeAiDraft', () => {
  it('uses AI yesterday but manual today and blockers', () => {
    const manual = composeManualStandup({
      commits: [],
      notes: [blockerNote],
      carryForwardNotes: [],
    });
    const merged = mergeAiDraft({
      aiYesterday: 'Shipped login fix and refactored auth module.',
      manual,
    });
    expect(merged.yesterday).toBe(
      'Shipped login fix and refactored auth module.'
    );
    expect(merged.today).toBe(manual.today);
    expect(merged.blockers).toBe(manual.blockers);
  });

  it('preserves manual blockers default when no blocker notes', () => {
    const manual = composeManualStandup({
      commits: [],
      notes: [],
      carryForwardNotes: [],
    });
    const merged = mergeAiDraft({
      aiYesterday: 'Fixed bugs.',
      manual,
    });
    expect(merged.blockers).toBe(DEFAULT_BLOCKERS);
  });
});
