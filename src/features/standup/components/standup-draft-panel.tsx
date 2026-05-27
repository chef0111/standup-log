import { Button } from '@/components/ui/button';
import { ButtonSpinner } from '@/components/ui/button-spinner';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { AiGenerationQuota } from '@/features/standup/components/ai-generation-quota';
import { EmptyWorkdayGuide } from '@/features/standup/components/empty-workday-guide';
import { StandupMarkdownEditor } from '@/features/standup/components/standup-markdown-editor';
import { isWorkdayInputEmpty } from '@/features/standup/lib/build-no-update-standup';
import {
  buildEmptyStandupTemplate,
  composeManualMarkdown,
  isStandupMarkdownEmpty,
} from '@/features/standup/lib/compose-standup-markdown';
import { categorizeError, userFacingMessage } from '@/lib/errors';
import { useSaveStandupMutation } from '@/queries/standup/use-save-standup-mutation';
import { useRouter } from 'expo-router';
import { Eye, SaveIcon } from 'lucide-react-native';
import * as React from 'react';
import { View } from 'react-native';
import { useStandup } from '../context/standup';

export function StandupDraftPanel() {
  const router = useRouter();
  const saveMutation = useSaveStandupMutation();
  const {
    workday,
    commits,
    notes,
    carryForwardNotes,
    savedMarkdown: initialSaved,
    draftMarkdown: providerDraft,
    draftSource,
    setEditorMarkdown,
    onStandupSaved: onSaved,
    openAddNote,
    refreshActivity,
    syncing,
  } = useStandup();

  const [guideDismissed, setGuideDismissed] = React.useState(false);

  const composed = React.useMemo(
    () =>
      composeManualMarkdown({
        workday,
        commits,
        notes,
        carryForwardNotes,
      }),
    [workday, commits, notes, carryForwardNotes]
  );

  const baselineMarkdown =
    providerDraft ?? initialSaved ?? buildEmptyStandupTemplate(workday);

  const showEmptyGuide =
    !guideDismissed &&
    isWorkdayInputEmpty(commits.length, notes.length) &&
    isStandupMarkdownEmpty(baselineMarkdown);

  const [markdown, setMarkdown] = React.useState(baselineMarkdown);
  const [status, setStatus] = React.useState<string | null>(null);

  React.useEffect(() => {
    setMarkdown(baselineMarkdown);
    setGuideDismissed(false);
  }, [baselineMarkdown, workday]);

  React.useEffect(() => {
    setEditorMarkdown(markdown);
  }, [markdown, setEditorMarkdown]);

  const handleSave = async () => {
    setStatus(null);
    try {
      await saveMutation.mutateAsync({ workday, draftMarkdown: markdown });
      onSaved?.(markdown);
      setStatus('Standup saved.');
    } catch (error) {
      setStatus(userFacingMessage(categorizeError(error)));
    }
  };

  const onViewStandup = () => {
    router.push({ pathname: '/standup/read', params: { workday } });
  };

  return (
    <View className="relative gap-4">
      <View className="flex-row items-center justify-between">
        <Text className="text-foreground text-lg font-bold">Standup draft</Text>
        <Button variant="outline" size="sm" onPress={onViewStandup}>
          <Icon as={Eye} />
          <Text className="text-foreground text-sm font-medium">
            View standup
          </Text>
        </Button>
      </View>

      {draftSource === 'fallback' && (
        <View className="border-border bg-muted/40 rounded-xl border px-3 py-2">
          <Text className="text-foreground text-sm font-medium">
            Activity fallback
          </Text>
          <Text className="text-muted-foreground mt-1 text-sm">
            AI draft unavailable. Commits are grouped below — write per-repo
            summaries or tap Regenerate.
          </Text>
        </View>
      )}

      {showEmptyGuide && (
        <EmptyWorkdayGuide
          workday={workday}
          onRefreshActivity={refreshActivity}
          refreshing={syncing}
          onHadWork={() => {
            setGuideDismissed(true);
            openAddNote();
          }}
          onAddBlockerNote={() => {
            setGuideDismissed(true);
            openAddNote();
          }}
          onApplyDraft={(next) => {
            setMarkdown(next);
            setGuideDismissed(true);
          }}
          onDismiss={() => setGuideDismissed(true)}
        />
      )}

      <StandupMarkdownEditor
        mode="edit"
        value={markdown}
        onChangeText={setMarkdown}
        placeholder={composed}
      />

      <AiGenerationQuota />

      <Button
        disabled={saveMutation.isPending}
        variant="charcoal"
        size="pill"
        onPress={() => void handleSave()}
      >
        {saveMutation.isPending ? <ButtonSpinner /> : <Icon as={SaveIcon} />}
        <Text>Save</Text>
      </Button>

      {status && (
        <Text className="text-muted-foreground text-center text-sm">
          {status}
        </Text>
      )}
    </View>
  );
}
