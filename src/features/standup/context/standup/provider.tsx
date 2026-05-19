import { useActivitySync } from '@/features/activity';
import { useAuth } from '@/features/auth';
import { useManualNotes, type ManualNoteRow } from '@/features/notes';
import { fetchUserProfile } from '@/features/profile';
import { buildGenerateDraftRequest } from '@/features/standup/lib/build-generate-draft-request';
import {
  composeManualStandup,
  type StandupSections,
} from '@/features/standup/lib/compose-standup';
import { generateAiDraft } from '@/features/standup/lib/generate-ai-draft';
import { mergeAiDraft } from '@/features/standup/lib/merge-ai-draft';
import {
  isLikelyOffline,
  readWorkdaySnapshot,
  writeWorkdaySnapshot,
} from '@/features/standup/lib/offline-cache';
import { fetchStandupUpdate } from '@/features/standup/lib/standup-api';
import { updateCommitWorkTypes } from '@/features/standup/lib/update-commit-work-types';
import {
  clampWorkdayToBounds,
  defaultTargetWorkday,
  getWorkdayPickerBounds,
} from '@/features/workday';
import type { Workday } from '@/features/workday/types/workday';
import { userFacingMessage } from '@/lib/errors';
import { useFocusEffect } from '@react-navigation/native';
import * as React from 'react';
import { StandupContext, type StandupContextValue } from './context';

export function StandupProvider({ children }: { children: React.ReactNode }) {
  const { supabase, session } = useAuth();
  const [isPro, setIsPro] = React.useState(false);
  const [workday, setWorkday] = React.useState(defaultTargetWorkday);
  const [workdayPickerKey, setWorkdayPickerKey] = React.useState(0);
  const [editorOpen, setEditorOpen] = React.useState(false);
  const [editingNote, setEditingNote] = React.useState<ManualNoteRow | null>(
    null
  );
  const [noteSaving, setNoteSaving] = React.useState(false);
  const [noteError, setNoteError] = React.useState<string | null>(null);
  const [savedSections, setSavedSections] =
    React.useState<StandupSections | null>(null);
  const [draftSections, setDraftSections] =
    React.useState<StandupSections | null>(null);
  const [aiLoading, setAiLoading] = React.useState(false);
  const [aiError, setAiError] = React.useState<string | null>(null);
  const [loadingStandup, setLoadingStandup] = React.useState(true);
  const [offlineBanner, setOfflineBanner] = React.useState<string | null>(null);
  const autoAiWorkdayRef = React.useRef<string | null>(null);

  const pickerBounds = React.useMemo(
    () => getWorkdayPickerBounds({ isPro }),
    [isPro]
  );

  useFocusEffect(
    React.useCallback(() => {
      setWorkday(defaultTargetWorkday());
      setSavedSections(null);
      setDraftSections(null);
      setAiError(null);
      autoAiWorkdayRef.current = null;
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

  const composeInput = React.useMemo(
    () => ({ commits, notes, carryForwardNotes }),
    [commits, notes, carryForwardNotes]
  );

  const runAiDraft = React.useCallback(
    async (showErrorOnFailure: boolean) => {
      if (!supabase || !session) {
        return;
      }

      const manual = composeManualStandup(composeInput);
      setAiLoading(true);
      setAiError(null);

      if (isLikelyOffline()) {
        setDraftSections(manual);
        setAiLoading(false);
        if (showErrorOnFailure) {
          setAiError(userFacingMessage('network'));
        }
        return;
      }

      const { draft, fallback } = await generateAiDraft(
        supabase,
        buildGenerateDraftRequest(workday, commits, notes)
      );

      if (draft && !fallback) {
        setDraftSections(
          mergeAiDraft({ aiYesterday: draft.yesterday, manual })
        );
        if (draft.classifications.length > 0) {
          await updateCommitWorkTypes(
            supabase,
            session.user.id,
            draft.classifications
          );
        }
      } else {
        setDraftSections(manual);
        if (showErrorOnFailure) {
          setAiError(userFacingMessage('ai'));
        }
      }

      setAiLoading(false);
    },
    [commits, composeInput, notes, session, supabase, workday]
  );

  React.useEffect(() => {
    if (savedSections) {
      autoAiWorkdayRef.current = null;
      return;
    }

    if (loadingActivity || loadingNotes || loadingStandup) {
      return;
    }

    if (isLikelyOffline()) {
      setDraftSections(composeManualStandup(composeInput));
      return;
    }

    if (autoAiWorkdayRef.current === workday) {
      return;
    }

    autoAiWorkdayRef.current = workday;
    void runAiDraft(false);
  }, [
    composeInput,
    loadingActivity,
    loadingNotes,
    loadingStandup,
    runAiDraft,
    savedSections,
    workday,
  ]);

  React.useEffect(() => {
    if (loadingActivity || loadingNotes || loadingStandup) {
      return;
    }
    writeWorkdaySnapshot({
      workday,
      commits,
      notes,
      carryForwardNotes,
      sections: savedSections ?? draftSections,
      cachedAt: new Date().toISOString(),
    });
  }, [
    workday,
    commits,
    notes,
    carryForwardNotes,
    savedSections,
    draftSections,
    loadingActivity,
    loadingNotes,
    loadingStandup,
  ]);

  const onWorkdayChange = React.useCallback((next: Workday) => {
    setWorkday(next);
    setSavedSections(null);
    setDraftSections(null);
    setAiError(null);
    autoAiWorkdayRef.current = null;
    setOfflineBanner(null);
  }, []);

  const openAddNote = React.useCallback(() => {
    setEditingNote(null);
    setNoteError(null);
    setEditorOpen(true);
  }, []);

  const openEditNote = React.useCallback((note: ManualNoteRow) => {
    setEditingNote(note);
    setNoteError(null);
    setEditorOpen(true);
  }, []);

  const handleSaveNote = React.useCallback(
    async (input: {
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
    },
    [addNote, editNote, editingNote]
  );

  const onStandupSaved = React.useCallback((sections: StandupSections) => {
    setSavedSections(sections);
    setOfflineBanner(null);
  }, []);

  const regenerateDraft = React.useCallback(async () => {
    autoAiWorkdayRef.current = null;
    await runAiDraft(true);
    autoAiWorkdayRef.current = workday;
  }, [runAiDraft, workday]);

  const refreshActivity = React.useCallback(() => {
    void refresh();
  }, [refresh]);

  const loading = loadingActivity || loadingNotes || loadingStandup;

  const value = React.useMemo<StandupContextValue>(
    () => ({
      workday,
      workdayPickerKey,
      pickerBounds,
      isPro,
      onWorkdayChange,
      offlineBanner,
      commits,
      loadingActivity,
      syncing,
      activityError,
      token,
      tokenLoading,
      refreshActivity,
      notes,
      carryForwardNotes,
      loadingNotes,
      notesError,
      removeNote,
      editorOpen,
      setEditorOpen,
      editingNote,
      openAddNote,
      openEditNote,
      noteSaving,
      noteError,
      handleSaveNote,
      savedSections,
      draftSections,
      aiLoading,
      aiError,
      regenerateDraft,
      onStandupSaved,
      loadingStandup,
      loading,
    }),
    [
      workday,
      workdayPickerKey,
      pickerBounds,
      isPro,
      onWorkdayChange,
      offlineBanner,
      commits,
      loadingActivity,
      syncing,
      activityError,
      token,
      tokenLoading,
      refreshActivity,
      notes,
      carryForwardNotes,
      loadingNotes,
      notesError,
      removeNote,
      editorOpen,
      editingNote,
      openAddNote,
      openEditNote,
      noteSaving,
      noteError,
      handleSaveNote,
      savedSections,
      draftSections,
      aiLoading,
      aiError,
      regenerateDraft,
      onStandupSaved,
      loadingStandup,
      loading,
    ]
  );

  return (
    <StandupContext.Provider value={value}>{children}</StandupContext.Provider>
  );
}
