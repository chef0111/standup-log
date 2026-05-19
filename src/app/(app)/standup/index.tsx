import { Button } from '@/components/ui/button';
import { ButtonSpinner } from '@/components/ui/button-spinner';
import { Card } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { ActivityList, useActivitySync } from '@/features/activity';
import { signInWithGitHub, useAuth } from '@/features/auth';
import {
  NoteEditorSheet,
  NotesList,
  useManualNotes,
  type ManualNoteRow,
} from '@/features/notes';
import { ScreenFooter } from '@/features/shell';
import {
  StandupEditor,
  fetchStandupUpdate,
  isLikelyOffline,
  readWorkdaySnapshot,
  writeWorkdaySnapshot,
  type StandupSections,
} from '@/features/standup';
import {
  defaultTargetWorkday,
  formatWorkdayLocal,
  parseWorkdayParam,
} from '@/features/workday';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Calendar, Plus, RefreshCw } from 'lucide-react-native';
import * as React from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  View,
} from 'react-native';

function workdayToDate(workday: string): Date {
  const [y, m, d] = workday.split('-').map(Number);
  return new Date(y, m - 1, d, 12, 0, 0);
}

function dateToWorkday(date: Date): string {
  return formatWorkdayLocal(date);
}

export default function StandupScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ workday?: string }>();
  const { supabase } = useAuth();

  const initialWorkday =
    parseWorkdayParam(
      typeof params.workday === 'string' ? params.workday : undefined
    ) ?? defaultTargetWorkday();

  const [workday, setWorkday] = React.useState(initialWorkday);
  const [showDatePicker, setShowDatePicker] = React.useState(false);
  const [editorOpen, setEditorOpen] = React.useState(false);
  const [editingNote, setEditingNote] = React.useState<ManualNoteRow | null>(
    null
  );
  const [noteSaving, setNoteSaving] = React.useState(false);
  const [noteError, setNoteError] = React.useState<string | null>(null);
  const [savedSections, setSavedSections] =
    React.useState<StandupSections | null>(null);
  const [loadingStandup, setLoadingStandup] = React.useState(true);
  const [offlineBanner, setOfflineBanner] = React.useState<string | null>(null);

  const {
    commits,
    syncing,
    loading: loadingActivity,
    error: activityError,
    token,
    tokenLoading,
    refresh,
  } = useActivitySync(workday);

  const {
    notes,
    carryForwardNotes,
    loading: loadingNotes,
    error: notesError,
    addNote,
    editNote,
    removeNote,
  } = useManualNotes(workday);

  React.useEffect(() => {
    let cancelled = false;

    async function loadStandup() {
      if (!supabase) {
        setLoadingStandup(false);
        return;
      }

      setLoadingStandup(true);

      if (isLikelyOffline()) {
        const cached = readWorkdaySnapshot(workday);
        if (cached) {
          setSavedSections(cached.sections);
          setOfflineBanner('Offline — showing cached standup.');
        }
        setLoadingStandup(false);
        return;
      }

      const { standup, error } = await fetchStandupUpdate(supabase, workday);
      if (cancelled) {
        return;
      }
      if (error) {
        const cached = readWorkdaySnapshot(workday);
        if (cached?.sections) {
          setSavedSections(cached.sections);
          setOfflineBanner('Could not reach server — using cached standup.');
        }
      } else if (standup) {
        setSavedSections({
          yesterday: standup.yesterday_text,
          today: standup.today_text,
          blockers: standup.blockers_text,
        });
      } else {
        setSavedSections(null);
      }
      setLoadingStandup(false);
    }

    void loadStandup();
    return () => {
      cancelled = true;
    };
  }, [supabase, workday]);

  React.useEffect(() => {
    if (loadingActivity || loadingNotes || loadingStandup) {
      return;
    }
    writeWorkdaySnapshot({
      workday,
      commits,
      notes,
      carryForwardNotes,
      sections: savedSections,
      cachedAt: new Date().toISOString(),
    });
  }, [
    workday,
    commits,
    notes,
    carryForwardNotes,
    savedSections,
    loadingActivity,
    loadingNotes,
    loadingStandup,
  ]);

  const onDateChange = (_event: unknown, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (date) {
      setWorkday(dateToWorkday(date));
      setSavedSections(null);
      setOfflineBanner(null);
    }
  };

  const handleSaveNote = async (input: {
    body: string;
    is_blocker: boolean;
    is_carry_forward: boolean;
  }) => {
    setNoteSaving(true);
    setNoteError(null);
    const result = editingNote
      ? await editNote(editingNote.id, input)
      : await addNote(input);
    setNoteSaving(false);
    if (result.error) {
      setNoteError(result.error);
      return;
    }
    setEditorOpen(false);
    setEditingNote(null);
  };

  const loading = loadingActivity || loadingNotes || loadingStandup;

  return (
    <>
      <Stack.Screen options={{ title: 'Generate standup' }} />
      <View className="bg-background flex-1">
        <ScrollView
          className="flex-1"
          contentContainerClassName="mx-auto w-full max-w-lg gap-4 px-5 pb-4 pt-2"
          keyboardShouldPersistTaps="handled"
        >
          <View className="gap-2">
            <Text className="text-muted-foreground text-xs uppercase tracking-wide">
              Workday
            </Text>
            <Pressable
              className="border-border flex-row items-center gap-2 rounded-md border px-3 py-2"
              onPress={() => setShowDatePicker(true)}
            >
              <Calendar size={18} />
              <Text className="text-foreground text-sm font-medium">
                {workday}
              </Text>
            </Pressable>
            {showDatePicker ? (
              <DateTimePicker
                value={workdayToDate(workday)}
                mode="date"
                display={Platform.OS === 'ios' ? 'inline' : 'default'}
                onChange={onDateChange}
              />
            ) : null}
          </View>

          {offlineBanner ? (
            <Text className="text-muted-foreground text-center text-sm">
              {offlineBanner}
            </Text>
          ) : null}

          <Card className="gap-3 p-4">
            <View className="flex-row items-center justify-between">
              <Text className="text-foreground text-sm font-medium">
                Activity
              </Text>
              <Button
                variant="outline"
                size="sm"
                disabled={syncing || tokenLoading || !token}
                onPress={() => void refresh()}
              >
                {syncing ? <ButtonSpinner /> : <RefreshCw size={14} />}
                <Text>Refresh</Text>
              </Button>
            </View>
            {!token && !tokenLoading ? (
              <View className="gap-2">
                <Text className="text-muted-foreground text-sm">
                  GitHub access is unavailable. Reconnect to sync commits.
                </Text>
                <Button
                  variant="outline"
                  onPress={() => void signInWithGitHub()}
                >
                  <Text>Reconnect GitHub</Text>
                </Button>
                <Button
                  variant="ghost"
                  onPress={() => router.push('/(app)/settings')}
                >
                  <Text>Manage repositories</Text>
                </Button>
              </View>
            ) : loading ? (
              <ActivityIndicator />
            ) : (
              <>
                {activityError ? (
                  <Text className="text-destructive text-sm">
                    {activityError}
                  </Text>
                ) : null}
                <ActivityList commits={commits} />
              </>
            )}
          </Card>

          <Card className="gap-3 p-4">
            <View className="flex-row items-center justify-between">
              <Text className="text-foreground text-sm font-medium">Notes</Text>
              <Button
                variant="outline"
                size="sm"
                onPress={() => {
                  setEditingNote(null);
                  setNoteError(null);
                  setEditorOpen(true);
                }}
              >
                <Plus size={14} />
                <Text>Add note</Text>
              </Button>
            </View>
            {loading ? (
              <ActivityIndicator />
            ) : (
              <>
                {notesError ? (
                  <Text className="text-destructive text-sm">{notesError}</Text>
                ) : null}
                <NotesList
                  notes={notes}
                  onEdit={(note) => {
                    setEditingNote(note);
                    setNoteError(null);
                    setEditorOpen(true);
                  }}
                  onDelete={(note) => {
                    void removeNote(note.id);
                  }}
                />
              </>
            )}
          </Card>

          <Card className="gap-3 p-4">
            <Text className="text-foreground text-sm font-medium">
              Standup draft
            </Text>
            {loading ? (
              <ActivityIndicator />
            ) : (
              <StandupEditor
                workday={workday}
                commits={commits}
                notes={notes}
                carryForwardNotes={carryForwardNotes}
                initialSections={savedSections}
                onSaved={(sections) => {
                  setSavedSections(sections);
                  setOfflineBanner(null);
                }}
              />
            )}
          </Card>
        </ScrollView>

        <ScreenFooter className="mx-auto w-full max-w-lg">
          <Button variant="outline" onPress={() => router.back()}>
            <Text>Back</Text>
          </Button>
        </ScreenFooter>
      </View>

      <NoteEditorSheet
        open={editorOpen}
        onOpenChange={setEditorOpen}
        note={editingNote}
        saving={noteSaving}
        error={noteError}
        onSave={handleSaveNote}
      />
    </>
  );
}
