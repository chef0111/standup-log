import 'jsr:@supabase/functions-js/edge-runtime.d.ts';

import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

const FREE_TIER_GENERATIONS_PER_MINUTE = 5;

const WORK_TYPES = [
  'feature',
  'bug',
  'refactor',
  'test',
  'chore',
  'style',
] as const;

const STANDUP_TEMPLATE = `# Daily Standup — [Date]

## Summary
(1–2 short sentences for team chat — theme only, not a commit list.)

## ✅ What I did
-

## 🔨 Focusing on
-

## 🚧 Blockers
-

## 📊 Metrics / Notes
- PRs open:
- PRs merged:
- Tickets in progress:

---
*Time boxed: 5 min*`;

type GenerateDraftRequest = {
  workday: string;
  commits: {
    sha: string;
    message: string;
    repository_full_name: string;
    pr_number: number | null;
    pr_title: string | null;
    pr_state?: string | null;
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
    const state = c.pr_state ? ` [${c.pr_state}]` : '';
    return `- sha:${c.sha} | ${repo}: ${line}${pr}${state}`;
  });

  const contextNotes = input.notes
    .filter((n) => !n.is_blocker)
    .map((n) => {
      const flags = [n.is_carry_forward ? 'carry-forward' : null].filter(
        Boolean
      );
      const suffix = flags.length > 0 ? ` (${flags.join(', ')})` : '';
      return `- ${n.body.trim()}${suffix}`;
    });

  const blockerNotes = input.notes
    .filter((n) => n.is_blocker)
    .map((n) => `- ${n.body.trim()}`);

  const openPrs = input.commits.filter(
    (c) => c.pr_number != null && c.pr_state?.toLowerCase() !== 'merged'
  ).length;
  const mergedPrs = input.commits.filter(
    (c) => c.pr_state?.toLowerCase() === 'merged'
  ).length;

  return [
    `Workday: ${input.workday}`,
    'This standup is FOR this calendar day only — not "yesterday" relative to today.',
    '',
    'Commits (Activity Metadata only — no diffs):',
    commitLines.length > 0 ? commitLines.join('\n') : '(none)',
    '',
    'Manual notes (non-blocker):',
    contextNotes.length > 0 ? contextNotes.join('\n') : '(none)',
    '',
    'Blocker notes (use only under Blockers section):',
    blockerNotes.length > 0 ? blockerNotes.join('\n') : '(none)',
    '',
    'Suggested metrics (you may use in Metrics section):',
    `- PRs open: ${openPrs}`,
    `- PRs merged: ${mergedPrs}`,
    '',
    'Return JSON only with this exact shape:',
    '{"draft_markdown":"...full markdown...","classifications":[{"sha":"...","work_type":"feature|bug|refactor|test|chore|style"}]}',
    '',
    'The draft_markdown MUST follow this template exactly (replace [Date] with a friendly date for the Workday):',
    STANDUP_TEMPLATE,
    '',
    'Write Summary as 1–3 short sentences (about 40–60 words max) suitable for pasting into Slack or Teams.',
    'Summary states the main theme or outcome for the Workday (e.g. "Merged PR #174 to staging with data-table and tournament UI fixes").',
    'Do NOT enumerate individual commits, file names, or bullet items in Summary — those belong only under What I did.',
    'If Focusing on or Blockers are "-", omit "what is next" / blockers from Summary unless carry-forward notes say otherwise.',
    'Populate What I did from commits and non-blocker notes. Populate Focusing on from carry-forward notes only.',
    'Populate Blockers from blocker notes only (use "-" if none). Do not invent tickets or metrics.',
    'Classify each commit sha by work_type.',
  ].join('\n');
}

const SYSTEM_PROMPT = `You help developers write daily standup updates. You receive commit metadata and manual notes for one Workday.

Rules:
- Output a complete markdown standup matching the provided template structure and headings.
- The Summary section is brief chat prose (1–3 sentences, ~40–60 words). High-level theme only — never a paragraph that repeats every bullet under What I did.
- Detailed evidence (commits, PRs, fixes) belongs only in What I did and below.
- This standup describes work ON the given Workday only.
- Do NOT invent future plans beyond carry-forward notes.
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
): Promise<{ allowed: boolean; retryAfterSeconds: number }> {
  const { data: profile } = await admin
    .from('profiles')
    .select('is_pro')
    .eq('id', userId)
    .maybeSingle();

  if (profile?.is_pro) {
    return { allowed: true, retryAfterSeconds: 0 };
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
        error: 'rate_limited',
        retry_after_seconds: rateLimit.retryAfterSeconds,
        remaining: 0,
      },
      429
    );
  }

  try {
    const raw = await callAnthropic(anthropicKey, buildUserPrompt(body));
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
