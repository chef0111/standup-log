import {
  groupCommitsForDraft,
  type GenerateDraftCommitInput,
  type RepoDraftGroup,
} from './group-commits-for-draft.ts';

const SUMMARY_HEADING = /^##\s*Summary\s*$/im;
const WHAT_I_DID_HEADING = /^##\s*✅\s*What I did\s*$/im;
const BULLET_LINE = /^-\s+/;
const PR_NUMBERS_IN_TEXT = /PR\s*#?\s*(\d+)/gi;

function formatWhatIDidSection(repoGroups: RepoDraftGroup[]): string {
  if (repoGroups.length === 0) {
    return '-';
  }
  const multiRepo = repoGroups.length > 1;
  const parts: string[] = [];
  for (const repo of repoGroups) {
    if (multiRepo) {
      parts.push(`### ${repo.repositoryShortName}`);
    }
    parts.push('-');
  }
  return parts.join('\n');
}

function parseSections(markdown: string): {
  summary: string;
  completedWork: string;
} {
  const extract = (pattern: RegExp): string => {
    const match = markdown.match(pattern);
    if (!match || match.index === undefined) {
      return '';
    }
    const start = match.index + match[0].length;
    const rest = markdown.slice(start);
    const nextHeading = rest.search(/^##\s+/m);
    const body = nextHeading === -1 ? rest : rest.slice(0, nextHeading);
    return body.trim();
  };
  return {
    summary: extract(SUMMARY_HEADING),
    completedWork: extract(WHAT_I_DID_HEADING),
  };
}

function buildPrToRepoMap(repoGroups: RepoDraftGroup[]): Map<number, string> {
  const map = new Map<number, string>();
  for (const repo of repoGroups) {
    for (const theme of repo.prThemes) {
      if (theme.prNumber != null) {
        map.set(theme.prNumber, repo.repositoryShortName);
      }
    }
  }
  return map;
}

function extractPrNumbers(text: string): number[] {
  const numbers = new Set<number>();
  for (const match of text.matchAll(PR_NUMBERS_IN_TEXT)) {
    const n = Number(match[1]);
    if (!Number.isNaN(n)) {
      numbers.add(n);
    }
  }
  return [...numbers];
}

function reposInText(
  text: string,
  prToRepo: Map<number, string>,
  repoGroups: RepoDraftGroup[]
): string[] {
  const fromPr = [
    ...new Set(
      extractPrNumbers(text)
        .map((pr) => prToRepo.get(pr))
        .filter((name): name is string => Boolean(name))
    ),
  ];
  if (fromPr.length > 0) {
    return fromPr;
  }

  const lower = text.toLowerCase();
  const fromName = repoGroups
    .filter((r) => lower.includes(r.repositoryShortName.toLowerCase()))
    .map((r) => r.repositoryShortName);
  return [...new Set(fromName)];
}

function hasRepoHeadings(
  workSection: string,
  repoGroups: RepoDraftGroup[]
): boolean {
  if (repoGroups.length <= 1) {
    return true;
  }
  return repoGroups.every((repo) =>
    workSection.includes(`### ${repo.repositoryShortName}`)
  );
}

function summaryHasRepoLabels(
  summarySection: string,
  repoGroups: RepoDraftGroup[]
): boolean {
  if (repoGroups.length <= 1) {
    return true;
  }
  return repoGroups.every((repo) =>
    summarySection.includes(`**${repo.repositoryShortName}:**`)
  );
}

function structureWorkByRepo(
  workSection: string,
  repoGroups: RepoDraftGroup[]
): string {
  if (repoGroups.length <= 1) {
    return workSection;
  }
  if (hasRepoHeadings(workSection, repoGroups)) {
    return workSection;
  }

  const bullets: string[] = [];
  for (const line of workSection.split('\n')) {
    const trimmed = line.trim();
    if (BULLET_LINE.test(trimmed)) {
      bullets.push(trimmed);
    }
  }

  if (bullets.length === 0) {
    return formatWhatIDidSection(repoGroups);
  }

  const prToRepo = buildPrToRepoMap(repoGroups);
  const byRepo = new Map<string, string[]>();
  const unassigned: string[] = [];

  for (const bullet of bullets) {
    const repos = reposInText(bullet, prToRepo, repoGroups);
    if (repos.length === 1) {
      const repo = repos[0]!;
      const list = byRepo.get(repo) ?? [];
      list.push(bullet);
      byRepo.set(repo, list);
    } else if (repos.length > 1) {
      const list = byRepo.get(repos[0]!) ?? [];
      list.push(bullet);
      byRepo.set(repos[0]!, list);
    } else {
      unassigned.push(bullet);
    }
  }

  if (unassigned.length > 0) {
    const fallbackRepo =
      [...byRepo.entries()].sort((a, b) => b[1].length - a[1].length)[0]?.[0] ??
      repoGroups[0]?.repositoryShortName;
    if (fallbackRepo) {
      const list = byRepo.get(fallbackRepo) ?? [];
      byRepo.set(fallbackRepo, [...list, ...unassigned]);
    }
  }

  const parts: string[] = [];
  for (const repo of repoGroups) {
    const repoBullets = byRepo.get(repo.repositoryShortName);
    if (!repoBullets?.length) {
      continue;
    }
    parts.push(`### ${repo.repositoryShortName}`, ...repoBullets, '');
  }

  while (parts.length > 0 && parts[parts.length - 1] === '') {
    parts.pop();
  }

  return parts.length > 0
    ? parts.join('\n')
    : formatWhatIDidSection(repoGroups);
}

function splitSummarySentences(summarySection: string): string[] {
  const trimmed = summarySection.trim();
  if (!trimmed) {
    return [];
  }
  const parts = trimmed.split(/(?<=[.!?])\s+/).map((s) => s.trim());
  return parts.filter((s) => s.length > 0);
}

function structureSummaryByRepo(
  summarySection: string,
  repoGroups: RepoDraftGroup[]
): string {
  if (repoGroups.length <= 1) {
    return summarySection;
  }
  if (summaryHasRepoLabels(summarySection, repoGroups)) {
    return summarySection;
  }

  const sentences = splitSummarySentences(summarySection);
  if (sentences.length === 0) {
    return summarySection;
  }

  const prToRepo = buildPrToRepoMap(repoGroups);
  const byRepo = new Map<string, string[]>();
  const unassigned: string[] = [];

  for (const sentence of sentences) {
    const repos = reposInText(sentence, prToRepo, repoGroups);
    if (repos.length === 1) {
      const repo = repos[0]!;
      const list = byRepo.get(repo) ?? [];
      list.push(sentence);
      byRepo.set(repo, list);
    } else if (repos.length > 1) {
      const list = byRepo.get(repos[0]!) ?? [];
      list.push(sentence);
      byRepo.set(repos[0]!, list);
    } else {
      unassigned.push(sentence);
    }
  }

  if (unassigned.length > 0 && byRepo.size === 0) {
    const perRepo = Math.ceil(unassigned.length / repoGroups.length);
    repoGroups.forEach((repo, index) => {
      const chunk = unassigned.slice(
        index * perRepo,
        index * perRepo + perRepo
      );
      if (chunk.length > 0) {
        byRepo.set(repo.repositoryShortName, chunk);
      }
    });
  } else if (unassigned.length > 0) {
    const fallbackRepo =
      [...byRepo.entries()].sort((a, b) => b[1].length - a[1].length)[0]?.[0] ??
      repoGroups[0]?.repositoryShortName;
    if (fallbackRepo) {
      const list = byRepo.get(fallbackRepo) ?? [];
      byRepo.set(fallbackRepo, [...list, ...unassigned]);
    }
  }

  return repoGroups
    .map((repo) => {
      const sents = byRepo.get(repo.repositoryShortName);
      if (!sents?.length) {
        return null;
      }
      return `**${repo.repositoryShortName}:** ${sents.join(' ')}`;
    })
    .filter((line): line is string => line != null)
    .join('\n\n');
}

function replaceStandupDraftSection(
  markdown: string,
  section: 'summary' | 'completedWork',
  newBody: string
): string {
  const pattern = section === 'summary' ? SUMMARY_HEADING : WHAT_I_DID_HEADING;
  const match = markdown.match(pattern);
  if (!match || match.index === undefined) {
    return markdown;
  }

  const headingEnd = match.index + match[0].length;
  const rest = markdown.slice(headingEnd);
  const nextHeading = rest.search(/^##\s+/m);
  const afterSection = nextHeading === -1 ? '' : rest.slice(nextHeading);
  const before = markdown.slice(0, headingEnd);
  const normalizedBody = newBody.trim();

  const rebuilt = `${before}\n\n${normalizedBody}${afterSection ? `\n\n${afterSection.trimStart()}` : ''}`;
  return rebuilt.replace(/\n{3,}/g, '\n\n');
}

export function applyMultiRepoStructure(
  draftMarkdown: string,
  commits: GenerateDraftCommitInput[]
): string {
  const repoGroups = groupCommitsForDraft(commits);
  if (repoGroups.length <= 1) {
    return draftMarkdown;
  }

  const parsed = parseSections(draftMarkdown);
  let result = draftMarkdown;

  if (parsed.completedWork) {
    const structured = structureWorkByRepo(parsed.completedWork, repoGroups);
    if (structured !== parsed.completedWork) {
      result = replaceStandupDraftSection(result, 'completedWork', structured);
    }
  }

  const summarySection = parseSections(result).summary;
  if (summarySection) {
    const structuredSummary = structureSummaryByRepo(
      summarySection,
      repoGroups
    );
    if (structuredSummary !== summarySection) {
      result = replaceStandupDraftSection(result, 'summary', structuredSummary);
    }
  }

  return result;
}
