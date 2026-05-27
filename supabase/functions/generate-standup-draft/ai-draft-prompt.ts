import {
  groupCommitsForDraft,
  type GenerateDraftCommitInput,
} from './group-commits-for-draft.ts';

type GenerateDraftNoteInput = {
  body: string;
  is_blocker: boolean;
  is_carry_forward: boolean;
};

export type GenerateDraftRequest = {
  workday: string;
  commits: GenerateDraftCommitInput[];
  notes: GenerateDraftNoteInput[];
};

const STANDUP_TEMPLATE = `# Daily Standup — [Date]

## Summary
(Per repository with activity: **repo-name:** 1–3 outcome sentences. Single repository: 1–3 sentences with no repo label.)

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
- Infer product areas from PR titles, repo names, and commit themes — not file or component names.
- Each bullet: lead with what changed for users or the team; optional single traceability tail in parentheses — either a product area label OR "PR N", not both, never a commit count.
- Do NOT include: class/component names, file paths, package versions (e.g. tss@2.1.6), "N commits", or stack implementation detail unless a Manual Note states it plainly for the team.
- Group related commits into thematic bullets (by PR or outcome). One bullet per distinct theme after grouping — never one bullet per commit when commits share the same PR or theme. No fixed maximum bullet count.

Summary rules:
- When Activity Signals span 2+ repositories: write **bold repo short name**, colon, then 1–3 team-facing outcome sentences for that repo. Separate each repo with a blank line.
- When Activity Signals are from only 1 repository: write 1–3 outcome sentences with no repo label prefix.
- No PR lists, commit lists, or implementation jargon in Summary.

What I did rules:
- When 2+ repositories: use ### {repo-short-name} subheadings, then team-facing bullets grouped by PR/theme under each.
- When only 1 repository: flat bullets only — no ### subheading.
- Separate shipped vs in-progress facts; never imply merge for in-progress work.

Other sections:
- Focusing on — carry-forward notes only. Do not infer next steps from open PRs unless a carry-forward note says so.
- Blockers — blocker notes only; use "-" if none.
- Metrics / Notes — use only the suggested PR counts provided. Do not add "Tickets in progress" or ticket counts unless explicitly stated in Manual Notes.

Safety:
- No code diffs, surveillance or productivity scoring, speculation, invented PII, or judgmental language about the developer.
- Use only the provided commit messages and notes.
- Output valid JSON only: {"draft_markdown":"...","classifications":[{"sha":"...","work_type":"..."}]}.
- work_type must be one of: feature, bug, refactor, test, chore, style.`;

const TEAM_FACING_EXAMPLE = `Example — multi-repo voice:

GOOD Summary (2 repos):
**tku-sparring:** Released 2.1.5, fixing bracket matches that did not advance after a winner was declared.

**standup-log:** Shipped phase 10–11 hardening including voice notes, empty-workday flow, and multi-format copy.

GOOD What I did (2 repos):
### tku-sparring
- Released 2.1.5 with bracket advancement fix (PR 175)

### standup-log
- Shipped phase 11 features including on-device voice notes and guided empty workday (PR 6)`;

function commitFirstLine(message: string): string {
  return message.split('\n')[0]?.trim() ?? message.trim();
}

function formatCommitLine(commit: GenerateDraftCommitInput): string {
  const line = commitFirstLine(commit.message);
  const pr =
    commit.pr_number != null && commit.pr_title
      ? ` (PR #${commit.pr_number}: ${commit.pr_title})`
      : commit.pr_number != null
        ? ` (PR #${commit.pr_number})`
        : '';
  const disposition =
    commit.signal_disposition === 'in_progress'
      ? ' [in progress]'
      : ' [shipped]';
  return `    - sha:${commit.sha} | ${line}${pr}${disposition}`;
}

function formatRepoActivitySection(
  repo: ReturnType<typeof groupCommitsForDraft>[number]
): string[] {
  const shippedLines: string[] = [];
  const inProgressLines: string[] = [];

  for (const theme of repo.prThemes) {
    const header =
      theme.prNumber != null
        ? `  PR #${theme.prNumber}${theme.prTitle ? `: ${theme.prTitle}` : ''}`
        : '  Direct commits';
    const commitLines = theme.commits.map(formatCommitLine);
    const block = [header, ...commitLines].join('\n');
    const isInProgress = theme.commits.every(
      (c) => c.signal_disposition === 'in_progress'
    );
    if (isInProgress && theme.commits.length > 0) {
      inProgressLines.push(block);
    } else {
      shippedLines.push(block);
    }
  }

  const lines = [
    `Repository: ${repo.repositoryShortName} (${repo.repositoryFullName})`,
  ];
  lines.push('  Shipped:');
  lines.push(shippedLines.length > 0 ? shippedLines.join('\n') : '    (none)');
  lines.push('  In progress:');
  lines.push(
    inProgressLines.length > 0 ? inProgressLines.join('\n') : '    (none)'
  );
  return lines;
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

export function buildDraftUserPrompt(input: GenerateDraftRequest): string {
  const repoGroups = groupCommitsForDraft(input.commits);
  const repoSections = repoGroups.flatMap((repo) => [
    ...formatRepoActivitySection(repo),
    '',
  ]);

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
  const repositoryCount = repoGroups.length;

  return [
    `Workday: ${input.workday}`,
    'This standup is FOR this calendar day only — not "yesterday" relative to today.',
    `Repositories with activity: ${repositoryCount}`,
    '',
    'Activity by repository (group commits by PR/theme — not one bullet per commit):',
    ...(repoSections.length > 0 ? repoSections : ['(none)']),
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
    `Repository count for this Workday: ${repositoryCount}.`,
    repositoryCount > 1
      ? 'Summary: **repo:** 1–3 sentences per repo with activity. What I did: ### repo subheadings with grouped bullets.'
      : 'Summary: 1–3 sentences, no repo label. What I did: flat bullets, no ### subheading.',
    'Do NOT copy commit subject lines verbatim when implementation-heavy — translate to team-facing outcomes.',
    'Populate Focusing on from carry-forward notes only (use "-" if none).',
    'Populate Blockers from blocker notes only (use "-" if none).',
    'Metrics: PRs open and PRs merged only. Do NOT add Tickets in progress unless a Manual Note mentions tickets.',
    'Classify each commit sha by work_type.',
  ].join('\n');
}
