import 'jsr:@supabase/functions-js/edge-runtime.d.ts';

import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

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
  }[];
  notes: {
    body: string;
    is_blocker: boolean;
    is_carry_forward: boolean;
  }[];
};

type GenerateDraftResponse = {
  yesterday: string;
  classifications: { sha: string; work_type: string }[];
};

function jsonResponse(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function commitFirstLine(message: string): string {
  return message.split('\n')[0]?.trim() ?? message.trim();
}

function buildUserPrompt(input: GenerateDraftRequest): string {
  const commitLines = input.commits.map((c) => {
    const repo =
      c.repository_full_name.split('/').pop() ?? c.repository_full_name;
    const line = commitFirstLine(c.message);
    const pr =
      c.pr_number != null && c.pr_title
        ? ` (PR #${c.pr_number}: ${c.pr_title})`
        : '';
    return `- sha:${c.sha} | ${repo}: ${line}${pr}`;
  });

  const noteLines = input.notes
    .filter((n) => !n.is_blocker)
    .map((n) => `- ${n.body.trim()}`);

  return [
    `Workday: ${input.workday}`,
    '',
    'Commits (Activity Metadata only — no diffs):',
    commitLines.length > 0 ? commitLines.join('\n') : '(none)',
    '',
    'Manual notes (context, not blockers):',
    noteLines.length > 0 ? noteLines.join('\n') : '(none)',
    '',
    'Return JSON only with this exact shape:',
    '{"yesterday":"...","classifications":[{"sha":"...","work_type":"feature|bug|refactor|test|chore|style"}]}',
    '',
    'Write Yesterday as concise team-facing prose summarizing what was done.',
    'Classify each commit sha by work_type.',
  ].join('\n');
}

const SYSTEM_PROMPT = `You help developers write daily standup updates. You receive commit metadata and manual notes for one Workday.

Rules:
- Rewrite ONLY the Yesterday section as clear, concise, non-boastful team-facing prose.
- Do NOT invent future plans, Today items, or blockers.
- Do NOT include code diffs, surveillance language, or speculation.
- Use only the provided commit messages and notes.
- Output valid JSON matching the requested schema exactly.
- work_type must be one of: feature, bug, refactor, test, chore, style.`;

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
        max_tokens: 1024,
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
    if (typeof parsed.yesterday !== 'string') {
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
  const commits = body.commits ?? [];

  if (commits.length === 0 && nonBlockerNotes.length === 0) {
    return jsonResponse(
      { error: 'No activity to summarize', fallback: true },
      400
    );
  }

  try {
    const raw = await callAnthropic(anthropicKey, buildUserPrompt(body));
    const draft = parseDraftResponse(raw);

    if (!draft) {
      return jsonResponse({ error: 'malformed', fallback: true }, 502);
    }

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
