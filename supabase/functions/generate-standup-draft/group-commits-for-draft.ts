export type GenerateDraftCommitInput = {
  sha: string;
  message: string;
  repository_full_name: string;
  pr_number: number | null;
  pr_title: string | null;
  pr_state?: string | null;
  pr_merged_at?: string | null;
  signal_disposition?: 'shipped' | 'in_progress';
};

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

function repositoryShortName(fullName: string): string {
  return fullName.split('/').pop() ?? fullName;
}

function prThemeKey(commit: GenerateDraftCommitInput): string {
  if (commit.pr_number != null) {
    return `pr:${commit.pr_number}`;
  }
  return 'direct';
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
      commits: [...themeCommits],
    });
  }

  themes.sort((a, b) => {
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
