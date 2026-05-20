import { Button } from '@/components/ui/button';
import { ButtonSpinner } from '@/components/ui/button-spinner';
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Text } from '@/components/ui/text';
import {
  STORED_WORK_TYPE_OPTIONS,
  storedWorkTypeDisplay,
  type StoredWorkType,
} from '@/features/standup/lib/activity/stored-work-type';
import type { ActivityCommitRow } from '@/features/standup/types/activity-commit';
import { cn } from '@/lib/utils';
import * as React from 'react';
import { Pressable, View } from 'react-native';

type WorkTypePickerSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  commit: ActivityCommitRow | null;
  saving?: boolean;
  error?: string | null;
  onSave: (workType: StoredWorkType) => Promise<void>;
};

export function WorkTypePickerSheet({
  open,
  onOpenChange,
  commit,
  saving = false,
  error,
  onSave,
}: WorkTypePickerSheetProps) {
  const initial = storedWorkTypeDisplay(commit?.work_type ?? null)?.type ?? 'feature';
  const [selected, setSelected] = React.useState<StoredWorkType>(initial);

  React.useEffect(() => {
    if (open && commit) {
      setSelected(
        storedWorkTypeDisplay(commit.work_type)?.type ?? 'feature'
      );
    }
  }, [open, commit]);

  const handleSave = async () => {
    await onSave(selected);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle>Work type</DialogTitle>
        <DialogDescription>
          Classify this commit for your weekly summary.
        </DialogDescription>
      </DialogHeader>
      <View className="flex-row flex-wrap gap-2 py-2">
        {STORED_WORK_TYPE_OPTIONS.map((option) => {
          const isSelected = selected === option.value;
          return (
            <Pressable
              key={option.value}
              accessibilityRole="button"
              onPress={() => setSelected(option.value)}
            >
              <View
                className={cn(
                  'border-border rounded-md border px-3 py-2',
                  isSelected && 'border-primary bg-primary/10'
                )}
              >
                <Text className="text-foreground text-sm">{option.label}</Text>
              </View>
            </Pressable>
          );
        })}
      </View>
      {error ? (
        <Text selectable className="text-destructive text-sm">
          {error}
        </Text>
      ) : null}
      <DialogFooter>
        <Button disabled={saving || !commit} onPress={() => void handleSave()}>
          {saving ? <ButtonSpinner /> : null}
          <Text>Save</Text>
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
