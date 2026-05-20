import { Button } from '@/components/ui/button';
import { ButtonSpinner } from '@/components/ui/button-spinner';
import { Text } from '@/components/ui/text';
import { useAuth } from '@/features/auth';
import { fetchUserProfile } from '@/features/profile';
import { AiGenerationQuota } from '@/features/standup/components/ai-generation-quota';
import { CopyToast } from '@/features/standup/components/copy-toast';
import {
  StandupMarkdownEditor,
  type StandupEditorMode,
} from '@/features/standup/components/standup-markdown-editor';
import { StandupCopyFormatPicker } from '@/features/standup/components/standup-copy-format-picker';
import {
  buildEmptyStandupTemplate,
  composeManualMarkdown,
  formatWorkdayHeading,
  isStandupMarkdownEmpty,
} from '@/features/standup/lib/compose-standup-markdown';
import {
  COPY_FORMAT_LABELS,
  formatStandup,
  isCopyFormat,
  type CopyFormat,
} from '@/features/standup/lib/format-standup';
import { recordStandupCopy } from '@/features/standup/lib/record-standup-copy';
import { saveStandupUpdate } from '@/features/standup/lib/standup-api';
import type { SupabaseClient } from '@supabase/supabase-js';
import * as Clipboard from 'expo-clipboard';
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
  const [copyFormat, setCopyFormat] = React.useState<CopyFormat>('plain');
  const [saving, setSaving] = React.useState(false);
  const [copying, setCopying] = React.useState(false);
  const [status, setStatus] = React.useState<string | null>(null);
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    setMarkdown(baselineMarkdown);
  }, [baselineMarkdown]);

  React.useEffect(() => {
    if (!supabase || !session) {
      return;
    }
    void fetchUserProfile(supabase, session).then(({ profile }) => {
      const format = profile?.default_copy_format;
      if (format && isCopyFormat(format)) {
        setCopyFormat(format);
      }
    });
  }, [session, supabase]);

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

  const performCopy = async () => {
    if (!supabase || !session) {
      return;
    }
    setCopying(true);
    setStatus(null);
    try {
      await Clipboard.setStringAsync(formatStandup(markdown, copyFormat));
      const { streakIncremented, error } = await recordStandupCopy(
        supabase,
        session.user.id,
        workday,
        markdown,
        copyFormat
      );
      if (error) {
        setStatus(error);
        return;
      }
      const label = COPY_FORMAT_LABELS[copyFormat];
      setToastMessage(
        streakIncremented
          ? `Copied · ${label} · Streak +1`
          : `Copied · ${label}`
      );
    } catch {
      setStatus('Could not copy. Try again.');
    } finally {
      setCopying(false);
    }
  };

  const handleCopy = () => {
    if (isStandupMarkdownEmpty(markdown)) {
      Alert.alert(
        'Empty standup',
        'This standup has no activity or notes. Copy anyway?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Copy', onPress: () => void performCopy() },
        ]
      );
      return;
    }
    void performCopy();
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

      <View className="gap-2">
        <Text className="text-muted-foreground text-xs">Copy format</Text>
        <StandupCopyFormatPicker value={copyFormat} onChange={setCopyFormat} />
      </View>

      <View className="flex-row flex-wrap gap-2">
        <Button
          disabled={saving}
          onPress={() => void handleSave()}
          className="flex-1"
        >
          {saving && <ButtonSpinner />}
          <Text>Save</Text>
        </Button>
        <Button
          variant="outline"
          disabled={copying}
          onPress={handleCopy}
          className="flex-1"
        >
          {copying && <ButtonSpinner />}
          <Text>Copy</Text>
        </Button>
      </View>

      <Button
        variant="secondary"
        disabled={aiLoading || aiRateLimited}
        onPress={() => void regenerateDraft()}
      >
        {aiLoading && <ButtonSpinner />}
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
