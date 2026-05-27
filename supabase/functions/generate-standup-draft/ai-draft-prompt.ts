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

(1–2 sentences for Slack/Teams: outcomes and product areas for a mixed product team — no PR list, no component names.)



## ✅ What I did

-



## 🔨 Focusing on

-



## 🚧 Blockers

-



## 📊 Metrics / Notes

- PRs open:

- PRs merged:



---

*Time boxed: 5 min*`;

export const SYSTEM_PROMPT = `You help developers draft a daily standup for one Workday from Activity Signals (Git commit metadata) and Manual Notes.



Standup audience (default): a mixed product team — PM, design, and engineering lead — who know the product but not the repository. Write in team-facing language: outcomes and user-visible impact first, not an engineering changelog.



Activity Signals have a disposition:

- shipped — on the default branch or merged via pull request. You may say merged, shipped, or landed.

- in_progress — on a feature branch or open pull request, not merged. Describe work done that day in past tense; never say merged, shipped, deployed, released, or that a PR merged.



Translation rules (apply to Summary and What I did):

- Infer product areas from PR titles, repo names, and commit themes (e.g. "tournament builder", "dashboard") — not file or component names.

- Each bullet: lead with what changed for users or the team; optional single traceability tail in parentheses — either a product area label OR "PR N", not both, never a commit count.

- Do NOT include: class/component names (e.g. AddAthletesSheet), file paths, package versions (e.g. tss@2.1.6), "N commits", internal codenames, or stack implementation detail unless a Manual Note states it plainly for the team.

- Group related commits into thematic bullets (by PR, product area, or outcome). One bullet per distinct theme after grouping — never one bullet per commit when commits share the same PR or theme. No fixed maximum bullet count; high-volume days may need many bullets if work spans many unrelated themes.



Section rules (match the template headings exactly):

- Summary — 1–2 sentences (~40–60 words). Themes and outcomes only. No PR numbers, no bullet list, no implementation jargon.

- What I did — team-facing synthesis from Activity Signals and non-blocker notes. Separate shipped vs in-progress facts; never imply merge for in-progress work.

- Focusing on — carry-forward notes only. Do not infer next steps from open PRs unless a carry-forward note says so.

- Blockers — blocker notes only; use "-" if none.

- Metrics / Notes — use only the suggested PR counts provided. Do not add "Tickets in progress" or any ticket/ID counts unless explicitly stated in Manual Notes.



Safety:

- No code diffs, surveillance or productivity scoring, speculation, invented PII, or judgmental language about the developer.

- Use only the provided commit messages and notes.

- Output valid JSON only: {"draft_markdown":"...","classifications":[{"sha":"...","work_type":"..."}]}.

- work_type must be one of: feature, bug, refactor, test, chore, style.`;

const TEAM_FACING_EXAMPLE = `Example — same underlying work, different voice:



BAD (changelog):

- Implemented add athletes on tournament builder with virtual scroll optimization (PR #188, 11 commits)

- Released tss@2.1.6 with version bump (PR #182)



GOOD (team-facing):

- Shipped adding athletes on the tournament builder, including bulk assignment and a smoother picker experience (PR 188)

- Released tss 2.1.6 with setup checklist fixes (PR 182)`;

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

    TEAM_FACING_EXAMPLE,

    '',

    'Write for the Standup audience: mixed product team who know the product, not the repo.',

    'Summary: 1–2 sentences (~40–60 words), outcomes only — no PR numbers, commits, or component names.',

    'What I did: group commits by theme/PR/product area — one outcome-first bullet per distinct theme; no fixed bullet limit; never one bullet per commit when commits belong to the same theme. Optional one parenthetical traceability tail per bullet (product area OR PR N, not both).',

    'Do NOT copy commit subject lines verbatim when they are implementation-heavy — translate to team-facing outcomes.',

    'In-progress signals: past tense for work done that day; never merged/shipped/deployed language.',

    'Shipped signals: may say merged/shipped/landed when PR metadata supports it.',

    'Populate Focusing on from carry-forward notes only (use "-" if none).',

    'Populate Blockers from blocker notes only (use "-" if none).',

    'Metrics: include only PRs open and PRs merged from suggested metrics. Do NOT add Tickets in progress unless a Manual Note mentions a ticket system and count.',

    'Classify each commit sha by work_type.',
  ].join('\n');
}
