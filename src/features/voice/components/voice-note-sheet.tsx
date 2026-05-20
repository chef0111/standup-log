import { Button } from '@/components/ui/button';
import { ButtonSpinner } from '@/components/ui/button-spinner';
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';
import { Textarea } from '@/components/ui/textarea';
import { useVoiceNoteCapture } from '@/features/voice/hooks/use-voice-note-capture';
import { formatVoiceCountdown } from '@/features/voice/lib/voice-note-constants';
import type { ManualNoteInput } from '@/features/notes/types/manual-note';
import * as React from 'react';
import { Switch, View } from 'react-native';

type VoiceNoteSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  saving?: boolean;
  error?: string | null;
  onSave: (input: ManualNoteInput) => Promise<void>;
};

export function VoiceNoteSheet({
  open,
  onOpenChange,
  saving = false,
  error,
  onSave,
}: VoiceNoteSheetProps) {
  const {
    phase,
    transcript,
    setTranscript,
    errorMessage,
    secondsLeft,
    startRecording,
    stopEarly,
    retry,
    reset,
  } = useVoiceNoteCapture();

  const [isBlocker, setIsBlocker] = React.useState(false);
  const [isCarryForward, setIsCarryForward] = React.useState(false);

  React.useEffect(() => {
    if (!open) {
      reset();
      return;
    }
    setIsBlocker(false);
    setIsCarryForward(false);
    reset();
    void startRecording();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- start when sheet opens only
  }, [open]);

  const handleCancel = () => {
    reset();
    onOpenChange(false);
  };

  const handleSave = async () => {
    const body = transcript.trim();
    if (body.length === 0) {
      return;
    }
    await onSave({
      body,
      is_blocker: isBlocker,
      is_carry_forward: isCarryForward,
    });
    reset();
    onOpenChange(false);
  };

  const showTranscript =
    phase === 'review' || phase === 'error' || phase === 'unavailable';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle>Voice note</DialogTitle>
        <DialogDescription>
          Speak for up to 30 seconds. Transcription stays on your device.
        </DialogDescription>
      </DialogHeader>

      {phase === 'recording' ? (
        <View className="gap-2 py-2">
          <Text className="text-foreground text-sm font-medium">Listening…</Text>
          <Text className="text-muted-foreground font-mono text-xs">
            {formatVoiceCountdown(secondsLeft)} remaining
          </Text>
          <Button variant="outline" onPress={stopEarly}>
            <Text>Stop early</Text>
          </Button>
        </View>
      ) : null}

      {(errorMessage || error) && phase !== 'recording' ? (
        <Text selectable className="text-destructive text-sm">
          {errorMessage ?? error}
        </Text>
      ) : null}

      {showTranscript ? (
        <View className="gap-3">
          <Label nativeID="voice-transcript">Transcript</Label>
          <Textarea
            nativeID="voice-transcript"
            value={transcript}
            onChangeText={setTranscript}
            placeholder="Review and edit before saving…"
            numberOfLines={4}
          />
          <View className="flex-row items-center justify-between">
            <Text className="text-foreground text-sm">Blocker</Text>
            <Switch value={isBlocker} onValueChange={setIsBlocker} />
          </View>
          <View className="flex-row items-center justify-between">
            <Text className="text-foreground text-sm">Carry forward</Text>
            <Switch value={isCarryForward} onValueChange={setIsCarryForward} />
          </View>
        </View>
      ) : null}

      <DialogFooter className="flex-row flex-wrap gap-2">
        {(phase === 'error' || phase === 'unavailable') && (
          <Button variant="outline" onPress={() => void retry()}>
            <Text>Retry</Text>
          </Button>
        )}
        <Button variant="outline" onPress={handleCancel}>
          <Text>Cancel</Text>
        </Button>
        {phase === 'review' ? (
          <Button
            disabled={saving || transcript.trim().length === 0}
            onPress={() => void handleSave()}
          >
            {saving ? <ButtonSpinner /> : null}
            <Text>Save note</Text>
          </Button>
        ) : null}
      </DialogFooter>
    </Dialog>
  );
}
