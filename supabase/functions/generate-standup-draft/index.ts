import 'jsr:@supabase/functions-js/edge-runtime.d.ts';

import { createClient } from 'npm:@supabase/supabase-js@2';
import { buildDraftUserPrompt, SYSTEM_PROMPT } from './ai-draft-prompt.ts';

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

const FREE_TIER_GENERATIONS_PER_MINUTE = 5;
const FREE_TIER_GENERATIONS_PER_DAY = 20;

const WORK_TYPES = [
  'feature',
  'bug',
  'refactor',
  'test',
  'chore',
  'style',
] as const;

type GenerateDraftRequest = {
  workday: string;
  commits: {
    sha: string;
    message: string;
    repository_full_name: string;
    pr_number: number | null;
    pr_title: string | null;
    pr_state?: string | null;
    pr_merged_at?: string | null;
    signal_disposition?: 'shipped' | 'in_progress';
  }[];
  notes: {
    body: string;
    is_blocker: boolean;
    is_carry_forward: boolean;
  }[];
};

type GenerateDraftResponse = {
  draft_markdown: string;
  classifications: { sha: string; work_type: string }[];
};

function jsonResponse(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function callAnthropic(
  apiKey: string,
  userPrompt: string
): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30_000);

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 2048,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userPrompt }],
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Anthropic error ${response.status}: ${text}`);
    }

    const payload = (await response.json()) as {
      content?: { type: string; text?: string }[];
    };
    const text = payload.content?.find((b) => b.type === 'text')?.text;
    if (!text) {
      throw new Error('Empty Anthropic response');
    }
    return text;
  } finally {
    clearTimeout(timeout);
  }
}

function parseDraftResponse(raw: string): GenerateDraftResponse | null {
  const trimmed = raw.trim();
  const jsonMatch = trimmed.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return null;
  }

  try {
    const parsed = JSON.parse(jsonMatch[0]) as GenerateDraftResponse;
    if (typeof parsed.draft_markdown !== 'string') {
      return null;
    }
    if (!Array.isArray(parsed.classifications)) {
      parsed.classifications = [];
    }
    parsed.classifications = parsed.classifications.filter(
      (c) =>
        typeof c.sha === 'string' &&
        typeof c.work_type === 'string' &&
        WORK_TYPES.includes(c.work_type as (typeof WORK_TYPES)[number])
    );
    return parsed;
  } catch {
    return null;
  }
}

async function checkRateLimit(
  admin: ReturnType<typeof createClient>,
  userId: string
): Promise<{ allowed: boolean; retryAfterSeconds: number; reason?: string }> {
  const { data: profile } = await admin
    .from('profiles')
    .select('is_pro')
    .eq('id', userId)
    .maybeSingle();

  if (profile?.is_pro) {
    return { allowed: true, retryAfterSeconds: 0 };
  }

  const dayStart = new Date();
  dayStart.setUTCHours(0, 0, 0, 0);

  const { count: dailyCount, error: dailyError } = await admin
    .from('ai_generation_events')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', dayStart.toISOString());

  if (!dailyError && (dailyCount ?? 0) >= FREE_TIER_GENERATIONS_PER_DAY) {
    const nextDay = new Date(dayStart);
    nextDay.setUTCDate(nextDay.getUTCDate() + 1);
    const retryAfterSeconds = Math.max(
      60,
      Math.ceil((nextDay.getTime() - Date.now()) / 1000)
    );
    return { allowed: false, retryAfterSeconds, reason: 'daily_limit' };
  }

  const windowStart = new Date(Date.now() - 60_000).toISOString();
  const { count, error } = await admin
    .from('ai_generation_events')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', windowStart);

  if (error) {
    return { allowed: true, retryAfterSeconds: 0 };
  }

  const used = count ?? 0;
  if (used >= FREE_TIER_GENERATIONS_PER_MINUTE) {
    return { allowed: false, retryAfterSeconds: 60 };
  }

  return { allowed: true, retryAfterSeconds: 0 };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRole = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY');

  if (!supabaseUrl || !serviceRole) {
    return jsonResponse({ error: 'Server misconfigured' }, 500);
  }

  if (!anthropicKey) {
    return jsonResponse({ error: 'AI unavailable', fallback: true }, 503);
  }

  const jwt = authHeader.replace('Bearer ', '');
  const admin = createClient(supabaseUrl, serviceRole, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const {
    data: { user },
    error: userError,
  } = await admin.auth.getUser(jwt);

  if (userError || !user) {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }

  let body: GenerateDraftRequest;
  try {
    body = (await req.json()) as GenerateDraftRequest;
  } catch {
    return jsonResponse({ error: 'Invalid JSON' }, 400);
  }

  const nonBlockerNotes = (body.notes ?? []).filter((n) => !n.is_blocker);
  const blockerNotes = (body.notes ?? []).filter((n) => n.is_blocker);
  const commits = body.commits ?? [];

  if (
    commits.length === 0 &&
    nonBlockerNotes.length === 0 &&
    blockerNotes.length === 0
  ) {
    return jsonResponse(
      { error: 'No activity to summarize', fallback: true },
      400
    );
  }

  const rateLimit = await checkRateLimit(admin, user.id);
  if (!rateLimit.allowed) {
    return jsonResponse(
      {
        error:
          rateLimit.reason === 'daily_limit' ? 'daily_limit' : 'rate_limited',
        retry_after_seconds: rateLimit.retryAfterSeconds,
        remaining: 0,
      },
      429
    );
  }

  try {
    const raw = await callAnthropic(anthropicKey, buildDraftUserPrompt(body));
    const draft = parseDraftResponse(raw);

    if (!draft) {
      return jsonResponse({ error: 'malformed', fallback: true }, 502);
    }

    await admin.from('ai_generation_events').insert({
      user_id: user.id,
      workday: body.workday,
    });

    return jsonResponse(draft as unknown as Record<string, unknown>);
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      return jsonResponse({ error: 'timeout', fallback: true }, 504);
    }
    return jsonResponse(
      {
        error: err instanceof Error ? err.message : 'AI request failed',
        fallback: true,
      },
      502
    );
  }
});
