import { VOICE_NOTE_MAX_SECONDS } from '@/features/voice/lib/voice-note-constants';
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from 'expo-speech-recognition';
import * as React from 'react';
import { Platform } from 'react-native';

export type VoiceCapturePhase =
  | 'idle'
  | 'recording'
  | 'review'
  | 'error'
  | 'unavailable';

export function useVoiceNoteCapture() {
  const [phase, setPhase] = React.useState<VoiceCapturePhase>('idle');
  const [transcript, setTranscript] = React.useState('');
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = React.useState(VOICE_NOTE_MAX_SECONDS);
  const phaseRef = React.useRef(phase);
  const countdownRef = React.useRef<ReturnType<typeof setInterval> | null>(null);
  const stopTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  phaseRef.current = phase;

  const clearTimers = React.useCallback(() => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
    if (stopTimerRef.current) {
      clearTimeout(stopTimerRef.current);
      stopTimerRef.current = null;
    }
  }, []);

  const reset = React.useCallback(() => {
    clearTimers();
    try {
      ExpoSpeechRecognitionModule.abort();
    } catch {
      // ignore if not started
    }
    setPhase('idle');
    setTranscript('');
    setErrorMessage(null);
    setSecondsLeft(VOICE_NOTE_MAX_SECONDS);
  }, [clearTimers]);

  useSpeechRecognitionEvent('result', (event) => {
    const text = event.results[0]?.transcript ?? '';
    if (text.length > 0) {
      setTranscript(text);
    }
    if (event.isFinal && phaseRef.current === 'recording') {
      clearTimers();
      setPhase('review');
    }
  });

  useSpeechRecognitionEvent('error', (event) => {
    clearTimers();
    setErrorMessage(event.message ?? 'Speech recognition failed.');
    setPhase('error');
  });

  useSpeechRecognitionEvent('end', () => {
    if (phaseRef.current === 'recording') {
      clearTimers();
      setPhase('review');
    }
  });

  React.useEffect(() => () => clearTimers(), [clearTimers]);

  const startRecording = React.useCallback(async () => {
    setErrorMessage(null);
    setTranscript('');
    setSecondsLeft(VOICE_NOTE_MAX_SECONDS);

    const available = ExpoSpeechRecognitionModule.isRecognitionAvailable();
    if (!available) {
      setPhase('unavailable');
      setErrorMessage(
        'Speech recognition is not available on this device. Add a text note instead.'
      );
      return;
    }

    const permissions =
      await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!permissions.granted) {
      setPhase('error');
      setErrorMessage(
        'Microphone and speech recognition are required for voice notes. Enable them in Settings or add a text note.'
      );
      return;
    }

    setPhase('recording');
    countdownRef.current = setInterval(() => {
      setSecondsLeft((s) => Math.max(0, s - 1));
    }, 1000);

    stopTimerRef.current = setTimeout(() => {
      void ExpoSpeechRecognitionModule.stop();
    }, VOICE_NOTE_MAX_SECONDS * 1000);

    ExpoSpeechRecognitionModule.start({
      lang: 'en-US',
      interimResults: true,
      continuous: true,
      maxAlternatives: 1,
      requiresOnDeviceRecognition: Platform.OS === 'ios',
    });
  }, []);

  const stopEarly = React.useCallback(() => {
    clearTimers();
    void ExpoSpeechRecognitionModule.stop();
  }, [clearTimers]);

  const retry = React.useCallback(() => {
    reset();
    void startRecording();
  }, [reset, startRecording]);

  return {
    phase,
    transcript,
    setTranscript,
    errorMessage,
    secondsLeft,
    startRecording,
    stopEarly,
    retry,
    reset,
  };
}
