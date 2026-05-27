import type { GenerateDraftCommitInput } from '@/features/standup/lib/ai-draft-types';

export type PrThemeGroup = {
  prNumber: number | null;
  prTitle: string | null;
  commits: GenerateDraftCommitInput[];
};

export type RepoDraftGroup = {
  repositoryShortName: string;
  repositoryFullName: string;
  prThemes: PrThemeGroup[];
};

export function repositoryShortName(fullName: string): string {
  return fullName.split('/').pop() ?? fullName;
}

function prThemeKey(commit: GenerateDraftCommitInput): string {
  if (commit.pr_number != null) {
    return `pr:${commit.pr_number}`;
  }
  return 'direct';
}

function sortCommitsNewestFirst(
  commits: GenerateDraftCommitInput[]
): GenerateDraftCommitInput[] {
  return [...commits];
}

function groupPrThemes(commits: GenerateDraftCommitInput[]): PrThemeGroup[] {
  const byKey = new Map<string, GenerateDraftCommitInput[]>();
  for (const commit of commits) {
    const key = prThemeKey(commit);
    const list = byKey.get(key) ?? [];
    list.push(commit);
    byKey.set(key, list);
  }

  const themes: PrThemeGroup[] = [];
  for (const [, themeCommits] of byKey) {
    const prNumber = themeCommits[0]?.pr_number ?? null;
    const prTitle =
      themeCommits.find((c) => c.pr_title)?.pr_title ??
      themeCommits[0]?.pr_title ??
      null;
    themes.push({
      prNumber,
      prTitle,
      commits: sortCommitsNewestFirst(themeCommits),
    });
  }

  themes.sort((a, b) => {
    if (a.prNumber == null && b.prNumber == null) {
      return 0;
    }
    if (a.prNumber == null) {
      return 1;
    }
    if (b.prNumber == null) {
      return -1;
    }
    return a.prNumber - b.prNumber;
  });

  return themes;
}

export function groupCommitsForDraft(
  commits: GenerateDraftCommitInput[]
): RepoDraftGroup[] {
  const byRepo = new Map<string, GenerateDraftCommitInput[]>();
  for (const commit of commits) {
    const list = byRepo.get(commit.repository_full_name) ?? [];
    list.push(commit);
    byRepo.set(commit.repository_full_name, list);
  }

  const repos: RepoDraftGroup[] = [];
  for (const [repositoryFullName, repoCommits] of byRepo) {
    repos.push({
      repositoryShortName: repositoryShortName(repositoryFullName),
      repositoryFullName,
      prThemes: groupPrThemes(repoCommits),
    });
  }

  repos.sort((a, b) =>
    a.repositoryShortName.localeCompare(b.repositoryShortName)
  );

  return repos;
}

export function commitFirstLine(message: string): string {
  return message.split('\n')[0]?.trim() ?? message.trim();
}

export function formatPrThemeBullet(theme: PrThemeGroup): string {
  const lead =
    theme.prTitle?.trim() ||
    commitFirstLine(theme.commits[0]?.message ?? 'Work on repository');
  if (theme.prNumber != null) {
    const titleSuffix = theme.prTitle ? `: ${theme.prTitle}` : '';
    return `- ${lead} (PR #${theme.prNumber}${titleSuffix})`;
  }
  if (theme.commits.length > 1) {
    return `- ${lead} (${theme.commits.length} commits)`;
  }
  return `- ${lead}`;
}

export function formatWhatIDidSection(repoGroups: RepoDraftGroup[]): string {
  if (repoGroups.length === 0) {
    return '-';
  }

  const multiRepo = repoGroups.length > 1;
  const parts: string[] = [];

  for (const repo of repoGroups) {
    const bullets = repo.prThemes.map(formatPrThemeBullet);
    if (bullets.length === 0) {
      continue;
    }
    if (multiRepo) {
      parts.push(`### ${repo.repositoryShortName}`, bullets.join('\n'), '');
    } else {
      parts.push(...bullets);
    }
  }

  while (parts.length > 0 && parts[parts.length - 1] === '') {
    parts.pop();
  }

  return parts.length > 0 ? parts.join('\n') : '-';
}

export const FALLBACK_SUMMARY_PROMPT_SINGLE =
  '*(Write 1–3 outcome sentences for your team.)*';

export function formatFallbackSummarySection(
  repoGroups: RepoDraftGroup[]
): string {
  if (repoGroups.length === 0) {
    return FALLBACK_SUMMARY_PROMPT_SINGLE;
  }
  if (repoGroups.length === 1) {
    return FALLBACK_SUMMARY_PROMPT_SINGLE;
  }
  return repoGroups
    .map(
      (repo) =>
        `**${repo.repositoryShortName}:** ${FALLBACK_SUMMARY_PROMPT_SINGLE}`
    )
    .join('\n\n');
}
