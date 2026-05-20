import { useActivitySync } from '@/features/activity';
import { useAuth } from '@/features/auth';
import { useManualNotes, type ManualNoteRow } from '@/features/notes';
import { fetchUserProfile } from '@/features/profile';
import { buildGenerateDraftRequest } from '@/features/standup/lib/build-generate-draft-request';
import { composeManualMarkdown } from '@/features/standup/lib/compose-standup-markdown';
import { generateAiDraft } from '@/features/standup/lib/generate-ai-draft';
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
  const [editorOpen, setEditorOpen] = React.useState(false);
  const [editingNote, setEditingNote] = React.useState<ManualNoteRow | null>(
    null
  );
  const [noteSaving, setNoteSaving] = React.useState(false);
  const [noteError, setNoteError] = React.useState<string | null>(null);
  const [savedMarkdown, setSavedMarkdown] = React.useState<string | null>(null);
  const [draftMarkdown, setDraftMarkdown] = React.useState<string | null>(null);
  const [aiLoading, setAiLoading] = React.useState(false);
  const [aiError, setAiError] = React.useState<string | null>(null);
  const [aiRateLimited, setAiRateLimited] = React.useState(false);
  const [aiRetryAfterSeconds, setAiRetryAfterSeconds] = React.useState<
    number | null
  >(null);
  const [loadingStandup, setLoadingStandup] = React.useState(true);
  const [offlineBanner, setOfflineBanner] = React.useState<string | null>(null);

  const pickerBounds = React.useMemo(
    () => getWorkdayPickerBounds({ isPro }),
    [isPro]
  );

  useFocusEffect(
    React.useCallback(() => {
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

  const composeInput = React.useMemo(
    () => ({ workday, commits, notes, carryForwardNotes }),
    [workday, commits, notes, carryForwardNotes]
  );

  const manualMarkdown = React.useMemo(
    () => composeManualMarkdown(composeInput),
    [composeInput]
  );

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
        if (cached?.draftMarkdown) {
          setSavedMarkdown(cached.draftMarkdown);
          setOfflineBanner('Offline — showing cached standup.');
        } else {
          setSavedMarkdown(null);
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
        if (cached?.draftMarkdown) {
          setSavedMarkdown(cached.draftMarkdown);
          setOfflineBanner('Could not reach server — using cached standup.');
        } else {
          setSavedMarkdown(null);
        }
      } else if (standup?.draft_markdown?.trim()) {
        setSavedMarkdown(standup.draft_markdown);
      } else {
        setSavedMarkdown(null);
      }
      setLoadingStandup(false);
    }

    void loadStandup();
    return () => {
      cancelled = true;
    };
  }, [supabase, workday]);

  React.useEffect(() => {
    setDraftMarkdown(null);
    setAiError(null);
    setAiRateLimited(false);
    setAiRetryAfterSeconds(null);
  }, [workday]);

  const runAiDraft = React.useCallback(async () => {
    if (!supabase || !session) {
      return;
    }

    if (loadingActivity || loadingNotes || loadingStandup) {
      return;
    }

    setAiLoading(true);
    setAiError(null);
    setAiRateLimited(false);
    setAiRetryAfterSeconds(null);

    if (isLikelyOffline()) {
      setDraftMarkdown(manualMarkdown);
      setAiLoading(false);
      setAiError(userFacingMessage('network'));
      return;
    }

    const result = await generateAiDraft(
      supabase,
      buildGenerateDraftRequest(workday, commits, notes)
    );

    if (result.rateLimited) {
      setAiRateLimited(true);
      setAiRetryAfterSeconds(result.retryAfterSeconds);
      setAiError('Rate limit reached. Try again in a minute.');
      setAiLoading(false);
      return;
    }

    if (result.draft && !result.fallback) {
      setDraftMarkdown(result.draft.draft_markdown);
      if (result.draft.classifications.length > 0) {
        await updateCommitWorkTypes(
          supabase,
          session.user.id,
          result.draft.classifications
        );
      }
    } else {
      setDraftMarkdown(manualMarkdown);
      setAiError(
        result.error && result.error !== 'rate_limited'
          ? userFacingMessage('ai')
          : userFacingMessage('ai')
      );
    }

    setAiLoading(false);
  }, [
    commits,
    loadingActivity,
    loadingNotes,
    loadingStandup,
    manualMarkdown,
    notes,
    session,
    supabase,
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
      draftMarkdown: savedMarkdown ?? draftMarkdown,
      cachedAt: new Date().toISOString(),
    });
  }, [
    workday,
    commits,
    notes,
    carryForwardNotes,
    savedMarkdown,
    draftMarkdown,
    loadingActivity,
    loadingNotes,
    loadingStandup,
  ]);

  const onWorkdayChange = React.useCallback((next: Workday) => {
    setWorkday(next);
    setSavedMarkdown(null);
    setDraftMarkdown(null);
    setAiError(null);
    setAiRateLimited(false);
    setAiRetryAfterSeconds(null);
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

  const onStandupSaved = React.useCallback((markdown: string) => {
    setSavedMarkdown(markdown);
    setDraftMarkdown(null);
    setOfflineBanner(null);
  }, []);

  const regenerateDraft = React.useCallback(async () => {
    await runAiDraft();
  }, [runAiDraft]);

  const refreshActivity = React.useCallback(() => {
    void refresh();
  }, [refresh]);

  const loading = loadingActivity || loadingNotes || loadingStandup;

  const value = React.useMemo<StandupContextValue>(
    () => ({
      workday,
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
      savedMarkdown,
      draftMarkdown,
      aiLoading,
      aiError,
      aiRateLimited,
      aiRetryAfterSeconds,
      regenerateDraft,
      onStandupSaved,
      loadingStandup,
      loading,
    }),
    [
      workday,
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
      savedMarkdown,
      draftMarkdown,
      aiLoading,
      aiError,
      aiRateLimited,
      aiRetryAfterSeconds,
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
