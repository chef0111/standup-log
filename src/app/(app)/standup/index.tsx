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
import { fetchUserProfile } from '@/features/profile';
import { ScreenFooter } from '@/features/shell';
import {
  fetchStandupUpdate,
  isLikelyOffline,
  readWorkdaySnapshot,
  StandupEditor,
  writeWorkdaySnapshot,
  type StandupSections,
} from '@/features/standup';
import {
  clampWorkdayToBounds,
  defaultTargetWorkday,
  FREE_TIER_WORKDAY_HISTORY_DAYS,
  getWorkdayPickerBounds,
  WorkdayDatePicker,
} from '@/features/workday';
import { useSafeRouterBack } from '@/hooks/use-safe-router-back';
import { useFocusEffect } from '@react-navigation/native';
import { Stack, useRouter } from 'expo-router';
import { Plus, RefreshCw } from 'lucide-react-native';
import * as React from 'react';
import { ActivityIndicator, ScrollView, View } from 'react-native';

export default function StandupScreen() {
  const router = useRouter();
  const goBack = useSafeRouterBack('/(app)');
  const { supabase, session } = useAuth();
  const [isPro, setIsPro] = React.useState(false);
  const [workday, setWorkday] = React.useState(defaultTargetWorkday());
  const [workdayPickerKey, setWorkdayPickerKey] = React.useState(0);
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

  const pickerBounds = React.useMemo(
    () => getWorkdayPickerBounds({ isPro }),
    [isPro]
  );

  useFocusEffect(
    React.useCallback(() => {
      setWorkday(defaultTargetWorkday());
      setSavedSections(null);
      setOfflineBanner(null);
      setWorkdayPickerKey((key) => key + 1);

      if (!supabase || !session) {
        return;
      }

      void fetchUserProfile(supabase, session).then(({ profile }) => {
        if (profile) {
          setIsPro(Boolean(profile.is_pro));
        }
      });
    }, [session, supabase])
  );

  React.useEffect(() => {
    setWorkday((current) => clampWorkdayToBounds(current, pickerBounds));
  }, [pickerBounds]);

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

  const onWorkdayChange = React.useCallback((next: string) => {
    setWorkday(next);
    setSavedSections(null);
    setOfflineBanner(null);
  }, []);

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
          <View className="relative gap-2">
            <Text className="text-muted-foreground text-xs uppercase tracking-wide">
              Workday
            </Text>
            <WorkdayDatePicker
              key={workdayPickerKey}
              workday={workday}
              bounds={pickerBounds}
              onWorkdayChange={onWorkdayChange}
            />
            {!isPro ? (
              <Text className="text-muted-foreground text-xs leading-relaxed">
                Free accounts: last {FREE_TIER_WORKDAY_HISTORY_DAYS} days.
                Upgrade to Pro for full history.
              </Text>
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
          <Button variant="outline" onPress={goBack}>
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
