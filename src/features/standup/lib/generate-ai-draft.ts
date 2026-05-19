import type {
  GenerateDraftRequest,
  GenerateDraftResponse,
} from '@/features/standup/lib/ai-draft-types';
import type { SupabaseClient } from '@supabase/supabase-js';

const INVOKE_TIMEOUT_MS = 35_000;

export type GenerateAiDraftResult = {
  draft: GenerateDraftResponse | null;
  fallback: boolean;
  error: string | null;
};

function isGenerateDraftResponse(value: unknown): value is GenerateDraftResponse {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const record = value as Record<string, unknown>;
  return typeof record.yesterday === 'string';
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
      return { draft: null, fallback: true, error: error.message };
    }

    if (data && typeof data === 'object' && 'fallback' in data && data.fallback) {
      return {
        draft: null,
        fallback: true,
        error:
          typeof (data as { error?: string }).error === 'string'
            ? (data as { error: string }).error
            : null,
      };
    }

    if (!isGenerateDraftResponse(data)) {
      return { draft: null, fallback: true, error: 'Invalid AI response' };
    }

    return { draft: data, fallback: false, error: null };
  } catch {
    return { draft: null, fallback: true, error: 'timeout' };
  } finally {
    clearTimeout(timeout);
  }
}
