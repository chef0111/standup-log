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
import type {
  ManualNoteInput,
  ManualNoteRow,
} from '@/features/standup/types/manual-note';
import * as React from 'react';
import { Switch, View } from 'react-native';

type NoteEditorSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  note?: ManualNoteRow | null;
  saving?: boolean;
  error?: string | null;
  onSave: (input: ManualNoteInput) => Promise<void>;
};

export function NoteEditorSheet({
  open,
  onOpenChange,
  note,
  saving = false,
  error,
  onSave,
}: NoteEditorSheetProps) {
  const [body, setBody] = React.useState('');
  const [isBlocker, setIsBlocker] = React.useState(false);
  const [isCarryForward, setIsCarryForward] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setBody(note?.body ?? '');
      setIsBlocker(note?.is_blocker ?? false);
      setIsCarryForward(note?.is_carry_forward ?? false);
    }
  }, [open, note]);

  const handleSave = async () => {
    await onSave({
      body,
      is_blocker: isBlocker,
      is_carry_forward: isCarryForward,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle>{note ? 'Edit note' : 'Add note'}</DialogTitle>
        <DialogDescription>
          Manual notes add context that commits do not capture.
        </DialogDescription>
      </DialogHeader>

      <View className="gap-4">
        <View className="gap-2">
          <Label>Note</Label>
          <Textarea
            value={body}
            onChangeText={setBody}
            placeholder="What should your team know?"
            autoFocus
          />
        </View>

        <View className="flex-row items-center justify-between gap-3">
          <Label>Blocker</Label>
          <Switch value={isBlocker} onValueChange={setIsBlocker} />
        </View>

        <View className="flex-row items-center justify-between gap-3">
          <Label>Carry forward</Label>
          <Switch value={isCarryForward} onValueChange={setIsCarryForward} />
        </View>

        {error ? (
          <Text className="text-destructive text-sm">{error}</Text>
        ) : null}
      </View>

      <DialogFooter>
        <Button
          variant="outline"
          disabled={saving}
          onPress={() => onOpenChange(false)}
        >
          <Text>Cancel</Text>
        </Button>
        <Button disabled={saving} onPress={() => void handleSave()}>
          {saving ? <ButtonSpinner /> : null}
          <Text>Save</Text>
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
