import type {
  GenerateDraftRateLimitError,
  GenerateDraftRequest,
  GenerateDraftResponse,
} from '@/features/standup/lib/ai-draft-types';
import type { SupabaseClient } from '@supabase/supabase-js';

const INVOKE_TIMEOUT_MS = 35_000;

export type GenerateAiDraftResult = {
  draft: GenerateDraftResponse | null;
  fallback: boolean;
  error: string | null;
  rateLimited: boolean;
  retryAfterSeconds: number | null;
};

function isGenerateDraftResponse(value: unknown): value is GenerateDraftResponse {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const record = value as Record<string, unknown>;
  return typeof record.draft_markdown === 'string';
}

function isRateLimitPayload(value: unknown): value is GenerateDraftRateLimitError {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const record = value as Record<string, unknown>;
  return record.error === 'rate_limited';
}

export async function generateAiDraft(
  supabase: SupabaseClient,
  input: GenerateDraftRequest
): Promise<GenerateAiDraftResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), INVOKE_TIMEOUT_MS);

  try {
    const { data, error } = await supabase.functions.invoke(
      'generate-standup-draft',
      {
        body: input,
      }
    );

    if (error) {
      const context = (error as { context?: { body?: unknown } }).context;
      const body = context?.body;
      if (isRateLimitPayload(body)) {
        return {
          draft: null,
          fallback: true,
          error: 'rate_limited',
          rateLimited: true,
          retryAfterSeconds: body.retry_after_seconds,
        };
      }
      return {
        draft: null,
        fallback: true,
        error: error.message,
        rateLimited: false,
        retryAfterSeconds: null,
      };
    }

    if (isRateLimitPayload(data)) {
      return {
        draft: null,
        fallback: true,
        error: 'rate_limited',
        rateLimited: true,
        retryAfterSeconds: data.retry_after_seconds,
      };
    }

    if (data && typeof data === 'object' && 'fallback' in data && data.fallback) {
      const edgeError =
        typeof (data as { error?: string }).error === 'string'
          ? (data as { error: string }).error
          : null;
      return {
        draft: null,
        fallback: true,
        error: edgeError,
        rateLimited: false,
        retryAfterSeconds: null,
      };
    }

    if (!isGenerateDraftResponse(data)) {
      return {
        draft: null,
        fallback: true,
        error: 'Invalid AI response',
        rateLimited: false,
        retryAfterSeconds: null,
      };
    }

    return {
      draft: data,
      fallback: false,
      error: null,
      rateLimited: false,
      retryAfterSeconds: null,
    };
  } catch {
    return {
      draft: null,
      fallback: true,
      error: 'timeout',
      rateLimited: false,
      retryAfterSeconds: null,
    };
  } finally {
    clearTimeout(timeout);
  }
}
