type SignalDisposition = 'shipped' | 'in_progress';

type GenerateDraftCommitInput = {
  sha: string;
  message: string;
  repository_full_name: string;
  pr_number: number | null;
  pr_title: string | null;
  pr_state?: string | null;
  pr_merged_at?: string | null;
  signal_disposition?: SignalDisposition;
};

type GenerateDraftNoteInput = {
  body: string;
  is_blocker: boolean;
  is_carry_forward: boolean;
};

type GenerateDraftRequest = {
  workday: string;
  commits: GenerateDraftCommitInput[];
  notes: GenerateDraftNoteInput[];
};

const STANDUP_TEMPLATE = `# Daily Standup — [Date]

## Summary
(1–3 short sentences for team chat — theme only, not a commit list.)

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

export const SYSTEM_PROMPT = `You help developers draft a daily standup for one Workday from Activity Signals (Git commit metadata) and Manual Notes.

Activity Signals have a disposition:
- shipped — on the default branch or merged via pull request. You may say merged, shipped, or landed.
- in_progress — on a feature branch or open pull request, not merged. Describe work done today in past tense; never say merged, shipped, deployed, released, or that a PR merged.

Section rules (match the template headings exactly):
- Summary — 1–3 sentences (~40–60 words), high-level theme for Slack or Teams. When both shipped and in-progress work exist, capture both themes without listing every commit.
- What I did — synthesize Activity Signals and non-blocker notes. Group related commits by theme or PR. Keep shipped and in-progress work factually separate; do not collapse open-PR work into merged language.
- Focusing on — carry-forward notes only. Do not infer next steps from open PRs unless a carry-forward note says so.
- Blockers — blocker notes only; use "-" if none.
- Metrics / Notes — use the suggested PR counts; do not invent ticket IDs or numbers.

Safety:
- No code diffs, surveillance or productivity scoring, speculation, invented PII, or judgmental language about the developer.
- Use only the provided commit messages and notes.
- Output valid JSON only: {"draft_markdown":"...","classifications":[{"sha":"...","work_type":"..."}]}.
- work_type must be one of: feature, bug, refactor, test, chore, style.`;

function commitFirstLine(message: string): string {
  return message.split('\n')[0]?.trim() ?? message.trim();
}

function formatCommitLine(commit: GenerateDraftCommitInput): string {
  const repo =
    commit.repository_full_name.split('/').pop() ?? commit.repository_full_name;
  const line = commitFirstLine(commit.message);
  const pr =
    commit.pr_number != null && commit.pr_title
      ? ` (PR #${commit.pr_number}: ${commit.pr_title})`
      : '';
  const disposition =
    commit.signal_disposition === 'in_progress'
      ? ' [in progress]'
      : ' [shipped]';
  return `- sha:${commit.sha} | ${repo}: ${line}${pr}${disposition}`;
}

export function countUniqueOpenPrs(
  commits: GenerateDraftCommitInput[]
): number {
  const open = new Set<number>();
  for (const commit of commits) {
    if (
      commit.pr_number != null &&
      commit.signal_disposition === 'in_progress' &&
      !commit.pr_merged_at
    ) {
      open.add(commit.pr_number);
    }
  }
  return open.size;
}

export function countUniqueMergedPrs(
  commits: GenerateDraftCommitInput[]
): number {
  const merged = new Set<number>();
  for (const commit of commits) {
    if (commit.pr_number == null) {
      continue;
    }
    if (
      commit.pr_merged_at != null ||
      commit.pr_state?.toLowerCase() === 'merged'
    ) {
      merged.add(commit.pr_number);
    }
  }
  return merged.size;
}

export function partitionCommitsByDisposition(
  commits: GenerateDraftCommitInput[]
): {
  shipped: GenerateDraftCommitInput[];
  inProgress: GenerateDraftCommitInput[];
} {
  const shipped: GenerateDraftCommitInput[] = [];
  const inProgress: GenerateDraftCommitInput[] = [];
  for (const commit of commits) {
    if (commit.signal_disposition === 'in_progress') {
      inProgress.push(commit);
    } else {
      shipped.push(commit);
    }
  }
  return { shipped, inProgress };
}

export function buildDraftUserPrompt(input: GenerateDraftRequest): string {
  const { shipped, inProgress } = partitionCommitsByDisposition(input.commits);

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

  const openPrs = countUniqueOpenPrs(input.commits);
  const mergedPrs = countUniqueMergedPrs(input.commits);

  return [
    `Workday: ${input.workday}`,
    'This standup is FOR this calendar day only — not "yesterday" relative to today.',
    '',
    'Shipped Activity Signals (default branch or merged PR):',
    shipped.length > 0 ? shipped.map(formatCommitLine).join('\n') : '(none)',
    '',
    'In-progress Activity Signals (feature branch / open PR — not merged):',
    inProgress.length > 0
      ? inProgress.map(formatCommitLine).join('\n')
      : '(none)',
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
    'If only in-progress work exists, Summary should reflect branch/PR progress without implying merge.',
    'If only shipped work exists, Summary may reference merges or landings when PR metadata supports it.',
    'Do NOT enumerate individual commits, file names, or bullet items in Summary.',
    'Populate What I did from both Activity Signal sections and non-blocker notes.',
    'In-progress signals: past tense for work done today; never merged/shipped/deployed language.',
    'Shipped signals: may use merged/shipped language when PR metadata indicates merge.',
    'Populate Focusing on from carry-forward notes only (use "-" if none).',
    'Populate Blockers from blocker notes only (use "-" if none).',
    'Classify each commit sha by work_type.',
  ].join('\n');
}
