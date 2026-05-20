import { AppError } from '@/lib/errors';

export class GithubRateLimitError extends AppError {
  readonly resetAt: number;

  constructor(resetAt: number) {
    super(
      'github',
      `GitHub rate limit reached. Try again after ${formatResetTime(resetAt)}.`
    );
    this.name = 'GithubRateLimitError';
    this.resetAt = resetAt;
  }
}

export function formatResetTime(resetAtMs: number): string {
  return new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(resetAtMs));
}

export function parseRateLimitResetMs(res: Response): number | null {
  const resetHeader = res.headers.get('x-ratelimit-reset');
  if (!resetHeader) {
    return null;
  }
  const seconds = Number(resetHeader);
  if (!Number.isFinite(seconds)) {
    return null;
  }
  return seconds * 1000;
}

export function parseRateLimitRemaining(res: Response): number | null {
  const remaining = res.headers.get('x-ratelimit-remaining');
  if (remaining == null) {
    return null;
  }
  const parsed = Number(remaining);
  return Number.isFinite(parsed) ? parsed : null;
}

export function assertGithubRateLimit(res: Response): void {
  const remaining = res.headers.get('x-ratelimit-remaining');
  if (remaining === '0') {
    const resetAt = parseRateLimitResetMs(res) ?? Date.now() + 60_000;
    throw new GithubRateLimitError(resetAt);
  }
}

export function githubHttpErrorMessage(status: number): string {
  if (status === 401) {
    return 'GitHub session expired. Reconnect your account and try again.';
  }
  if (status === 403) {
    return 'GitHub blocked this request (permissions or abuse limit). Try again later or reconnect.';
  }
  return `GitHub request failed (${status}).`;
}

export function isGithubRateLimitError(
  error: unknown
): error is GithubRateLimitError {
  return error instanceof GithubRateLimitError;
}
