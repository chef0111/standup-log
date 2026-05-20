import { Button } from '@/components/ui/button';
import { ButtonSpinner } from '@/components/ui/button-spinner';
import { Text } from '@/components/ui/text';
import { useAuth } from '@/features/auth';
import { fetchUserProfile } from '@/features/profile';
import { CopyToast } from '@/features/standup/components/copy-toast';
import { StandupCopyFormatPicker } from '@/features/standup/components/standup-copy-format-picker';
import { StandupSectionField } from '@/features/standup/components/standup-section-field';
import {
  composeManualStandup,
  isStandupEmpty,
  type StandupSections,
} from '@/features/standup/lib/compose-standup';
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
import { Alert, View } from 'react-native';
import { useStandup } from '../context/standup';

async function persistStandup(
  supabase: SupabaseClient,
  userId: string,
  workday: string,
  sections: StandupSections
): Promise<string | null> {
  const { error } = await saveStandupUpdate(
    supabase,
    userId,
    workday,
    sections
  );
  return error;
}

export function StandupEditor() {
  const { supabase, session } = useAuth();
  const {
    workday,
    commits,
    notes,
    carryForwardNotes,
    savedSections: initialSections,
    draftSections,
    aiLoading,
    aiError,
    regenerateDraft,
    onStandupSaved: onSaved,
  } = useStandup();
  const composed = React.useMemo(
    () =>
      composeManualStandup({
        commits,
        notes,
        carryForwardNotes,
      }),
    [commits, notes, carryForwardNotes]
  );

  const baselineSections = initialSections ?? draftSections ?? composed;

  const [sections, setSections] =
    React.useState<StandupSections>(baselineSections);
  const [copyFormat, setCopyFormat] = React.useState<CopyFormat>('plain');
  const [saving, setSaving] = React.useState(false);
  const [copying, setCopying] = React.useState(false);
  const [status, setStatus] = React.useState<string | null>(null);
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    setSections(baselineSections);
  }, [baselineSections]);

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

  const updateSection = (key: keyof StandupSections, value: string) => {
    setSections((prev) => ({ ...prev, [key]: value }));
  };

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
      sections
    );
    setSaving(false);
    if (error) {
      setStatus(error);
      return;
    }
    onSaved?.(sections);
    setStatus('Standup saved.');
  };

  const performCopy = async () => {
    if (!supabase || !session) {
      return;
    }
    setCopying(true);
    setStatus(null);
    try {
      await Clipboard.setStringAsync(formatStandup(sections, copyFormat));
      const { streakIncremented, error } = await recordStandupCopy(
        supabase,
        session.user.id,
        workday,
        sections,
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
    if (isStandupEmpty(sections)) {
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
      <StandupSectionField
        label="Yesterday"
        value={sections.yesterday}
        onChangeText={(v) => updateSection('yesterday', v)}
        placeholder="What you completed…"
      />
      <StandupSectionField
        label="Today"
        value={sections.today}
        onChangeText={(v) => updateSection('today', v)}
        placeholder="What you are working on…"
      />
      <StandupSectionField
        label="Blockers"
        value={sections.blockers}
        onChangeText={(v) => updateSection('blockers', v)}
        placeholder="No blockers"
      />

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
        disabled={aiLoading}
        onPress={() => void regenerateDraft()}
      >
        {aiLoading && <ButtonSpinner />}
        <Text>Generate</Text>
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
