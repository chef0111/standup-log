import { describe, expect, it, vi } from 'vitest';
import { generateAiDraft } from '@/features/standup/lib/generate-ai-draft';

describe('generateAiDraft', () => {
  it('returns fallback when invoke throws', async () => {
    const supabase = {
      functions: {
        invoke: vi.fn().mockRejectedValue(new Error('timeout')),
      },
    } as never;

    const result = await generateAiDraft(supabase, {
      workday: '2026-05-18',
      commits: [],
      notes: [],
    });

    expect(result.fallback).toBe(true);
    expect(result.draft).toBeNull();
  });

  it('returns draft when invoke succeeds', async () => {
    const supabase = {
      functions: {
        invoke: vi.fn().mockResolvedValue({
          data: {
            yesterday: 'Shipped login fix.',
            classifications: [{ sha: 'abc', work_type: 'feature' }],
          },
          error: null,
        }),
      },
    } as never;

    const result = await generateAiDraft(supabase, {
      workday: '2026-05-18',
      commits: [],
      notes: [],
    });

    expect(result.fallback).toBe(false);
    expect(result.draft?.yesterday).toBe('Shipped login fix.');
  });
});
