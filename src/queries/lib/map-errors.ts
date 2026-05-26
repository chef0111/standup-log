import { categorizeError, userFacingMessage } from '@/lib/errors';

export function mapQueryError(error: unknown): string {
  if (error instanceof Error && error.message === 'Not signed in.') {
    return error.message;
  }
  return userFacingMessage(categorizeError(error));
}
