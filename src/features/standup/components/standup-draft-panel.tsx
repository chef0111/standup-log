import { Button } from '@/components/ui/button';
import { ButtonSpinner } from '@/components/ui/button-spinner';
import { Text } from '@/components/ui/text';
import { useAuth } from '@/features/auth';
import { AiGenerationQuota } from '@/features/standup/components/ai-generation-quota';
import { CopyToast } from '@/features/standup/components/copy-toast';
import {
  StandupMarkdownEditor,
  type StandupEditorMode,
} from '@/features/standup/components/standup-markdown-editor';
import {
  buildEmptyStandupTemplate,
  composeManualMarkdown,
  formatWorkdayHeading,
  isStandupMarkdownEmpty,
  isStandupSummaryReady,
} from '@/features/standup/lib/compose-standup-markdown';
import {
  formatStandupForCopy,
  formatStandupSummaryForCopy,
} from '@/features/standup/lib/format-standup';
import { recordStandupCopy } from '@/features/standup/lib/record-standup-copy';
import { saveStandupUpdate } from '@/features/standup/lib/standup-api';
import type { SupabaseClient } from '@supabase/supabase-js';
import * as Clipboard from 'expo-clipboard';
import { CopyIcon, SaveIcon, StarsIcon } from 'lucide-react-native';
import * as React from 'react';
import { Alert, Pressable, View } from 'react-native';
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

function ModeToggle({
  mode,
  onChange,
}: {
  mode: StandupEditorMode;
  onChange: (mode: StandupEditorMode) => void;
}) {
  return (
    <View className="flex-row gap-2">
      {(['edit', 'preview'] as const).map((option) => {
        const selected = mode === option;
        return (
          <Pressable
            key={option}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            onPress={() => onChange(option)}
            className={
              selected
                ? 'bg-primary rounded-md px-3 py-1.5'
                : 'border-border bg-muted/40 rounded-md border px-3 py-1.5'
            }
          >
            <Text
              className={
                selected
                  ? 'text-primary-foreground text-sm font-medium capitalize'
                  : 'text-foreground text-sm capitalize'
              }
            >
              {option}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function StandupDraftPanel() {
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
  } = useStandup();

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

  const [markdown, setMarkdown] = React.useState(baselineMarkdown);
  const [editorMode, setEditorMode] = React.useState<StandupEditorMode>('edit');
  const [saving, setSaving] = React.useState(false);
  const [copying, setCopying] = React.useState(false);
  const [status, setStatus] = React.useState<string | null>(null);
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);

  const summaryReady = React.useMemo(
    () => isStandupSummaryReady(markdown),
    [markdown]
  );

  React.useEffect(() => {
    setMarkdown(baselineMarkdown);
  }, [baselineMarkdown]);

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

  const recordCopy = async (toastLabel: string) => {
    if (!supabase || !session) {
      return;
    }
    const { streakIncremented, error } = await recordStandupCopy(
      supabase,
      session.user.id,
      workday,
      markdown
    );
    if (error) {
      setStatus(error);
      return;
    }
    setToastMessage(
      streakIncremented ? `${toastLabel} · Streak +1` : toastLabel
    );
  };

  const performCopySummary = async () => {
    if (!supabase || !session) {
      return;
    }
    setCopying(true);
    setStatus(null);
    try {
      await Clipboard.setStringAsync(formatStandupSummaryForCopy(markdown));
      await recordCopy('Summary copied');
    } catch {
      setStatus('Could not copy. Try again.');
    } finally {
      setCopying(false);
    }
  };

  const performCopyFull = async () => {
    if (!supabase || !session) {
      return;
    }
    setCopying(true);
    setStatus(null);
    try {
      await Clipboard.setStringAsync(formatStandupForCopy(markdown));
      await recordCopy('Full standup copied');
    } catch {
      setStatus('Could not copy. Try again.');
    } finally {
      setCopying(false);
    }
  };

  const handleCopyFull = () => {
    if (isStandupMarkdownEmpty(markdown)) {
      Alert.alert(
        'Empty standup',
        'This standup has no activity or notes. Copy anyway?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Copy', onPress: () => void performCopyFull() },
        ]
      );
      return;
    }
    void performCopyFull();
  };

  return (
    <View className="relative gap-4">
      <Text className="text-foreground text-sm font-medium">
        Standup for {formatWorkdayHeading(workday)}
      </Text>

      <ModeToggle mode={editorMode} onChange={setEditorMode} />

      <StandupMarkdownEditor
        mode={editorMode}
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

      <View className="flex-row flex-wrap gap-2">
        <Button
          variant="outline"
          disabled={copying || !summaryReady}
          onPress={() => void performCopySummary()}
          className="flex-1"
        >
          {copying ? <ButtonSpinner /> : <CopyIcon />}
          <Text>Copy summary</Text>
        </Button>
        <Button
          variant="outline"
          disabled={copying}
          onPress={handleCopyFull}
          className="flex-1"
        >
          {copying ? <ButtonSpinner /> : <CopyIcon />}
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
