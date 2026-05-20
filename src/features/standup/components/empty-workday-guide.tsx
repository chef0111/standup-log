import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { buildNoUpdateStandupMarkdown } from '@/features/standup/lib/build-no-update-standup';
import { formatWorkdayHeading } from '@/features/standup/lib/compose-standup-markdown';
import type { Workday } from '@/features/standup/types/workday';
import * as React from 'react';
import { View } from 'react-native';

type EmptyWorkdayGuideProps = {
  workday: Workday;
  onHadWork: () => void;
  onAddBlockerNote: () => void;
  onApplyDraft: (markdown: string) => void;
  onDismiss: () => void;
};

type GuideStep = 'any_work' | 'blockers' | 'preview';

export function EmptyWorkdayGuide({
  workday,
  onHadWork,
  onAddBlockerNote,
  onApplyDraft,
  onDismiss,
}: EmptyWorkdayGuideProps) {
  const [step, setStep] = React.useState<GuideStep>('any_work');
  const preview = React.useMemo(
    () => buildNoUpdateStandupMarkdown(workday),
    [workday]
  );

  return (
    <View className="border-border bg-muted/30 gap-3 rounded-lg border p-4">
      <Text className="text-foreground text-sm font-medium">
        Empty Workday
      </Text>
      <Text className="text-muted-foreground text-xs leading-relaxed">
        No commits or notes for {formatWorkdayHeading(workday)}. A quick guide
        can help you record a no-update standup.
      </Text>

      {step === 'any_work' ? (
        <View className="gap-2">
          <Text className="text-foreground text-sm">
            Any work to report for this day?
          </Text>
          <View className="flex-row flex-wrap gap-2">
            <Button size="sm" onPress={onHadWork}>
              <Text>Yes — add context</Text>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onPress={() => setStep('blockers')}
            >
              <Text>No update</Text>
            </Button>
          </View>
        </View>
      ) : null}

      {step === 'blockers' ? (
        <View className="gap-2">
          <Text className="text-foreground text-sm">Any blockers?</Text>
          <View className="flex-row flex-wrap gap-2">
            <Button size="sm" variant="outline" onPress={onAddBlockerNote}>
              <Text>Yes — add blocker note</Text>
            </Button>
            <Button size="sm" onPress={() => setStep('preview')}>
              <Text>No blockers</Text>
            </Button>
          </View>
        </View>
      ) : null}

      {step === 'preview' ? (
        <View className="gap-2">
          <Text className="text-foreground text-sm">
            Preview a no-update standup you can edit before copying.
          </Text>
          <Text
            selectable
            className="text-muted-foreground font-mono text-xs leading-relaxed"
            numberOfLines={6}
          >
            {preview}
          </Text>
          <View className="flex-row flex-wrap gap-2">
            <Button size="sm" onPress={() => onApplyDraft(preview)}>
              <Text>Use this draft</Text>
            </Button>
            <Button size="sm" variant="ghost" onPress={onDismiss}>
              <Text>Dismiss</Text>
            </Button>
          </View>
        </View>
      ) : null}

      {step !== 'preview' ? (
        <Button size="sm" variant="ghost" onPress={onDismiss}>
          <Text>Skip guide</Text>
        </Button>
      ) : null}
    </View>
  );
}
