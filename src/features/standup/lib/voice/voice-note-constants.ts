export const VOICE_NOTE_MAX_SECONDS = 30;

export function formatVoiceCountdown(seconds: number): string {
  const clamped = Math.max(0, Math.min(VOICE_NOTE_MAX_SECONDS, seconds));
  return `${clamped}s`;
}
