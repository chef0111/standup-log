import { Button } from '@/components/ui/button';
import { ButtonSpinner } from '@/components/ui/button-spinner';
import { Text } from '@/components/ui/text';
import { useAuth } from '@/features/auth';
import { AiGenerationQuota } from '@/features/standup/components/ai-generation-quota';
import { EmptyWorkdayGuide } from '@/features/standup/components/empty-workday-guide';
import { isWorkdayInputEmpty } from '@/features/standup/lib/build-no-update-standup';
import { CopyFormatPicker } from '@/features/standup/components/copy-format-picker';
import { CopyToast } from '@/features/standup/components/copy-toast';
import { StandupMarkdownEditor } from '@/features/standup/components/standup-markdown-editor';
import { useStandupCopy } from '@/features/standup/hooks/use-standup-copy';
import type { CopyFormat } from '@/features/standup/lib/format-standup';
import {
  buildEmptyStandupTemplate,
  composeManualMarkdown,
  isStandupMarkdownEmpty,
  isStandupSummaryReady,
} from '@/features/standup/lib/compose-standup-markdown';
import { saveStandupUpdate } from '@/features/standup/lib/standup-api';
import type { SupabaseClient } from '@supabase/supabase-js';
import { useRouter } from 'expo-router';
import { SaveIcon, StarsIcon } from 'lucide-react-native';
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
    aiLoading,
    aiError,
    aiRateLimited,
    regenerateDraft,
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

  const summaryReady = React.useMemo(
    () => isStandupSummaryReady(markdown),
    [markdown]
  );

  const [sessionCopyFormat, setSessionCopyFormat] =
    React.useState<CopyFormat | null>(null);

  const { copying, toastMessage, copySummary, copyFull, copyFormat } =
    useStandupCopy(workday, markdown, { formatOverride: sessionCopyFormat });

  React.useEffect(() => {
    setMarkdown(baselineMarkdown);
    setGuideDismissed(false);
  }, [baselineMarkdown, workday]);

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
      <View className="flex-row items-center justify-between gap-2">
        <Text className="text-foreground text-sm font-medium">
          Standup draft
        </Text>
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

      <Button disabled={saving} onPress={() => void handleSave()}>
        {saving ? (
          <ButtonSpinner />
        ) : (
          <SaveIcon className="text-primary-foreground" />
        )}
        <Text>Save</Text>
      </Button>

      <View className="gap-2">
        <Text className="text-muted-foreground text-xs">Copy format</Text>
        <CopyFormatPicker
          value={copyFormat}
          onChange={setSessionCopyFormat}
          disabled={copying}
        />
      </View>

      <View className="flex-row flex-wrap gap-2">
        <Button
          variant="outline"
          disabled={copying || !summaryReady}
          onPress={() => void copySummary()}
          className="flex-1"
        >
          <Text>Copy summary</Text>
        </Button>
        <Button
          variant="outline"
          disabled={copying}
          onPress={copyFull}
          className="flex-1"
        >
          <Text>Copy full</Text>
        </Button>
      </View>

      {!summaryReady ? (
        <Text className="text-muted-foreground text-xs leading-relaxed">
          Generate or write the Summary section to enable Copy summary.
        </Text>
      ) : null}

      <Button
        variant="secondary"
        disabled={aiLoading || aiRateLimited}
        onPress={() => void regenerateDraft()}
      >
        {aiLoading ? <ButtonSpinner /> : <StarsIcon />}
        <Text>{providerDraft || initialSaved ? 'Regenerate' : 'Generate'}</Text>
      </Button>

      {aiError ? (
        <Text className="text-muted-foreground text-center text-sm">
          {aiError}
        </Text>
      ) : null}

      {status ? (
        <Text className="text-muted-foreground text-center text-sm">
          {status}
        </Text>
      ) : null}

      <CopyToast message={toastMessage} />
    </View>
  );
}
