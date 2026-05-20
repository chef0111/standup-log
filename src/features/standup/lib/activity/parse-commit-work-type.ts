export type CommitWorkType = 'feature' | 'bug' | 'refactor' | 'chore' | 'style';

export type ParsedCommitWorkType = {
  type: CommitWorkType;
  symbol: '+' | '!' | '~' | '$';
  label: CommitWorkType;
};

const PREFIX_MAP: Record<
  string,
  { type: CommitWorkType; symbol: '+' | '!' | '~' | '$' }
> = {
  feat: { type: 'feature', symbol: '+' },
  fix: { type: 'bug', symbol: '!' },
  refactor: { type: 'refactor', symbol: '~' },
  chore: { type: 'chore', symbol: '~' },
  docs: { type: 'chore', symbol: '~' },
  test: { type: 'chore', symbol: '~' },
  style: { type: 'style', symbol: '$' },
  ci: { type: 'chore', symbol: '~' },
  build: { type: 'chore', symbol: '~' },
  perf: { type: 'chore', symbol: '~' },
};

const CONVENTIONAL_PREFIX_RE = /^(\w+)(?:\([^)]+\))?!?:\s*/;

/** Infer Work Type badge from a conventional commit first line, if recognized. */
export function parseCommitWorkType(
  message: string
): ParsedCommitWorkType | null {
  const firstLine = message.split('\n')[0]?.trim() ?? '';
  const match = firstLine.match(CONVENTIONAL_PREFIX_RE);
  if (!match) {
    return null;
  }

  const mapped = PREFIX_MAP[match[1].toLowerCase()];
  if (!mapped) {
    return null;
  }

  return {
    type: mapped.type,
    symbol: mapped.symbol,
    label: mapped.type,
  };
}

export function commitFirstLine(message: string): string {
  return message.split('\n')[0]?.trim() ?? message;
}
