import {
  VOICE_NOTE_MAX_SECONDS,
  formatVoiceCountdown,
} from '@/features/standup/lib/voice/voice-note-constants';
import { describe, expect, it } from 'vitest';

describe('voice note constants', () => {
  it('caps countdown display at max seconds', () => {
    expect(formatVoiceCountdown(99)).toBe(`${VOICE_NOTE_MAX_SECONDS}s`);
    expect(formatVoiceCountdown(12)).toBe('12s');
  });
});
