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
    const markdown = '# Daily Standup — Mon, May 18, 2026\n\n## ✅ What I did\n- Shipped login fix.';
    const supabase = {
      functions: {
        invoke: vi.fn().mockResolvedValue({
          data: {
            draft_markdown: markdown,
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
    expect(result.draft?.draft_markdown).toBe(markdown);
  });

  it('surfaces rate limit from response data', async () => {
    const supabase = {
      functions: {
        invoke: vi.fn().mockResolvedValue({
          data: {
            error: 'rate_limited',
            retry_after_seconds: 42,
            remaining: 0,
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

    expect(result.rateLimited).toBe(true);
    expect(result.retryAfterSeconds).toBe(42);
  });
});
