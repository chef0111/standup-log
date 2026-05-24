import { Button } from '@/components/ui/button';
import { ButtonSpinner } from '@/components/ui/button-spinner';
import { Text } from '@/components/ui/text';
import { useAuth } from '@/context/auth';
import { AiGenerationQuota } from '@/features/standup/components/ai-generation-quota';
import { EmptyWorkdayGuide } from '@/features/standup/components/empty-workday-guide';
import { StandupMarkdownEditor } from '@/features/standup/components/standup-markdown-editor';
import { isWorkdayInputEmpty } from '@/features/standup/lib/build-no-update-standup';
import {
  buildEmptyStandupTemplate,
  composeManualMarkdown,
  isStandupMarkdownEmpty,
} from '@/features/standup/lib/compose-standup-markdown';
import { saveStandupUpdate } from '@/features/standup/lib/standup-api';
import type { SupabaseClient } from '@supabase/supabase-js';
import { useRouter } from 'expo-router';
import { SaveIcon } from 'lucide-react-native';
import * as React from 'react';
import { View } from 'react-native';
import { useStandup } from '../context/standup';

async function persistStandup(
  supabase: SupabaseClient,
  userId: string,
  workday: string,
  draftMarkdown: string
): Promise<string | null> {
  const { error } = await saveStandupUpdate(
    supabase,
    userId,
    workday,
    draftMarkdown
  );
  return error;
}

export function StandupDraftPanel() {
  const router = useRouter();
  const { supabase, session } = useAuth();
  const {
    workday,
    commits,
    notes,
    carryForwardNotes,
    savedMarkdown: initialSaved,
    draftMarkdown: providerDraft,
    setEditorMarkdown,
    onStandupSaved: onSaved,
    openAddNote,
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
  const [saving, setSaving] = React.useState(false);
  const [status, setStatus] = React.useState<string | null>(null);

  React.useEffect(() => {
    setMarkdown(baselineMarkdown);
    setGuideDismissed(false);
  }, [baselineMarkdown, workday]);

  React.useEffect(() => {
    setEditorMarkdown(markdown);
  }, [markdown, setEditorMarkdown]);

  const handleSave = async () => {
    if (!supabase || !session) {
      return;
    }
    setSaving(true);
    setStatus(null);
    const error = await persistStandup(
      supabase,
      session.user.id,
      workday,
      markdown
    );
    setSaving(false);
    if (error) {
      setStatus(error);
      return;
    }
    onSaved?.(markdown);
    setStatus('Standup saved.');
  };

  const onViewStandup = () => {
    router.push({ pathname: '/standup/read', params: { workday } });
  };

  return (
    <View className="relative gap-4">
      <View className="flex-row items-center justify-end">
        <Button variant="ghost" size="sm" onPress={onViewStandup}>
          <Text>View standup</Text>
        </Button>
      </View>

      {showEmptyGuide ? (
        <EmptyWorkdayGuide
          workday={workday}
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
      ) : null}

      <StandupMarkdownEditor
        mode="edit"
        value={markdown}
        onChangeText={setMarkdown}
        placeholder={composed}
      />

      <AiGenerationQuota />

      <Button disabled={saving} variant="charcoal" size="pill" onPress={() => void handleSave()}>
        {saving ? (
          <ButtonSpinner />
        ) : (
          <SaveIcon className="text-primary-foreground" />
        )}
        <Text>Save</Text>
      </Button>

      {status ? (
        <Text className="text-muted-foreground text-center text-sm">
          {status}
        </Text>
      ) : null}
    </View>
  );
}
