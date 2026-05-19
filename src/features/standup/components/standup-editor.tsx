import { Button } from '@/components/ui/button';
import { ButtonSpinner } from '@/components/ui/button-spinner';
import { Text } from '@/components/ui/text';
import type { ActivityCommitRow } from '@/features/activity/types/activity-commit';
import { useAuth } from '@/features/auth';
import type { ManualNoteRow } from '@/features/notes/types/manual-note';
import { StandupSectionField } from '@/features/standup/components/standup-section-field';
import {
  composeManualStandup,
  isStandupEmpty,
  type StandupSections,
} from '@/features/standup/lib/compose-standup';
import { formatPlainStandup } from '@/features/standup/lib/format-plain';
import { saveStandupUpdate } from '@/features/standup/lib/standup-api';
import type { Workday } from '@/features/workday/types/workday';
import type { SupabaseClient } from '@supabase/supabase-js';
import * as Clipboard from 'expo-clipboard';
import * as React from 'react';
import { Alert, View } from 'react-native';

type StandupEditorProps = {
  workday: Workday;
  commits: ActivityCommitRow[];
  notes: ManualNoteRow[];
  carryForwardNotes: ManualNoteRow[];
  initialSections?: StandupSections | null;
  onSaved?: (sections: StandupSections) => void;
};

async function persistStandup(
  supabase: SupabaseClient,
  userId: string,
  workday: Workday,
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

export function StandupEditor({
  workday,
  commits,
  notes,
  carryForwardNotes,
  initialSections,
  onSaved,
}: StandupEditorProps) {
  const { supabase, session } = useAuth();
  const composed = React.useMemo(
    () =>
      composeManualStandup({
        commits,
        notes,
        carryForwardNotes,
      }),
    [commits, notes, carryForwardNotes]
  );

  const [sections, setSections] = React.useState<StandupSections>(
    initialSections ?? composed
  );
  const [saving, setSaving] = React.useState(false);
  const [copying, setCopying] = React.useState(false);
  const [status, setStatus] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (initialSections) {
      setSections(initialSections);
      return;
    }
    setSections(composed);
  }, [composed, initialSections]);

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

  const copyPlain = async () => {
    setCopying(true);
    setStatus(null);
    try {
      await Clipboard.setStringAsync(formatPlainStandup(sections));
      setStatus('Copied to clipboard.');
    } catch {
      setStatus('Could not copy. Try again.');
    }
    setCopying(false);
  };

  const handleCopy = () => {
    if (isStandupEmpty(sections)) {
      Alert.alert(
        'Empty standup',
        'This standup has no activity or notes. Copy anyway?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Copy', onPress: () => void copyPlain() },
        ]
      );
      return;
    }
    void copyPlain();
  };

  return (
    <View className="gap-4">
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

      <View className="flex-row flex-wrap gap-2">
        <Button
          disabled={saving}
          onPress={() => void handleSave()}
          className="flex-1"
        >
          {saving ? <ButtonSpinner /> : null}
          <Text>Save</Text>
        </Button>
        <Button
          variant="outline"
          disabled={copying}
          onPress={handleCopy}
          className="flex-1"
        >
          {copying ? <ButtonSpinner /> : null}
          <Text>Copy plain</Text>
        </Button>
      </View>

      <Button variant="secondary" disabled>
        <Text>Regenerate (AI coming soon)</Text>
      </Button>

      {status ? (
        <Text className="text-muted-foreground text-center text-sm">
          {status}
        </Text>
      ) : null}
    </View>
  );
}
