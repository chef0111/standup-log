/**
 * Product-level error categories for user-facing copy (auth, GitHub, AI, network).
 * Map thrown values / API errors here — no transport-specific strings in UI components.
 */

export type ErrorCategory = 'auth' | 'github' | 'ai' | 'network' | 'config' | 'unknown';

export function categorizeError(error: unknown): ErrorCategory {
  if (error && typeof error === 'object' && 'category' in error) {
    const c = (error as { category?: string }).category;
    if (
      c === 'auth' ||
      c === 'github' ||
      c === 'ai' ||
      c === 'network' ||
      c === 'config' ||
      c === 'unknown'
    ) {
      return c;
    }
  }
  const message = error instanceof Error ? error.message : String(error);
  const lower = message.toLowerCase();
  if (lower.includes('network') || lower.includes('fetch')) {
    return 'network';
  }
  if (lower.includes('unauthorized') || lower.includes('forbidden') || lower.includes('401')) {
    return 'auth';
  }
  if (lower.includes('github') || lower.includes('rate limit')) {
    return 'github';
  }
  if (lower.includes('config') || lower.includes('missing')) {
    return 'config';
  }
  return 'unknown';
}

export function userFacingMessage(category: ErrorCategory): string {
  switch (category) {
    case 'auth':
      return 'Sign-in failed or your session expired. Try signing in again.';
    case 'github':
      return 'GitHub could not complete that action. Check your connection or try again.';
    case 'ai':
      return 'The assistant is temporarily unavailable. You can still edit and copy your standup.';
    case 'network':
      return 'You appear to be offline or the request timed out. Check your connection and try again.';
    case 'config':
      return 'This build is missing server configuration. See the setup screen for details.';
    default:
      return 'Something went wrong. Try again.';
  }
}

export class AppError extends Error {
  readonly category: ErrorCategory;

  constructor(category: ErrorCategory, message?: string) {
    super(message ?? userFacingMessage(category));
    this.name = 'AppError';
    this.category = category;
  }
}
