import { useAuth } from '@/context/auth';
import { buildGenerateDraftRequest } from '@/features/standup/lib/build-generate-draft-request';
import { composeManualMarkdown } from '@/features/standup/lib/compose-standup-markdown';
import { generateAiDraft } from '@/features/standup/lib/generate-ai-draft';
import {
  isLikelyOffline,
  readWorkdaySnapshot,
  writeWorkdaySnapshot,
} from '@/features/standup/lib/offline-cache';
import { updateCommitWorkTypes } from '@/features/standup/lib/update-commit-work-types';
import {
  clampWorkdayToBounds,
  defaultTargetWorkday,
  getWorkdayPickerBounds,
} from '@/features/standup/lib/workday/workday';
import type { ManualNoteRow } from '@/features/standup/types/manual-note';
import type { Workday } from '@/features/standup/types/workday';
import { track } from '@/lib/analytics';
import { markFirstEvent } from '@/lib/analytics-flags';
import { categorizeError, userFacingMessage } from '@/lib/errors';
import { useActivitySync } from '@/queries/activity/use-activity-sync';
import { useManualNoteMutations } from '@/queries/notes/use-manual-note-mutations';
import { useManualNotesQuery } from '@/queries/notes/use-manual-notes-query';
import { useProfileQuery } from '@/queries/profile/use-profile-query';
import { useStandupUpdateQuery } from '@/queries/standup/use-standup-update-query';
import * as React from 'react';
import { StandupContext, type StandupContextValue } from './context';

type StandupProviderProps = {
  children: React.ReactNode;
  initialWorkday?: Workday;
};

export function StandupProvider({
  children,
  initialWorkday,
}: StandupProviderProps) {
  const { supabase, session } = useAuth();
  const profileQuery = useProfileQuery();
  const isPro = Boolean(profileQuery.data?.is_pro);
  const [workday, setWorkday] = React.useState(
    () => initialWorkday ?? defaultTargetWorkday()
  );
  const [editorOpen, setEditorOpen] = React.useState(false);
  const [editingNote, setEditingNote] = React.useState<ManualNoteRow | null>(
    null
  );
  const [noteSaving, setNoteSaving] = React.useState(false);
  const [noteError, setNoteError] = React.useState<string | null>(null);
  const [savedMarkdown, setSavedMarkdown] = React.useState<string | null>(null);
  const [draftMarkdown, setDraftMarkdown] = React.useState<string | null>(null);
  const [draftSource, setDraftSource] = React.useState<
    'ai' | 'fallback' | 'saved' | null
  >(null);
  const [editorMarkdown, setEditorMarkdown] = React.useState('');
  const [aiLoading, setAiLoading] = React.useState(false);
  const [aiError, setAiError] = React.useState<string | null>(null);
  const [aiRateLimited, setAiRateLimited] = React.useState(false);
  const [aiRetryAfterSeconds, setAiRetryAfterSeconds] = React.useState<
    number | null
  >(null);
  const [offlineBanner, setOfflineBanner] = React.useState<string | null>(null);
  const standupQuery = useStandupUpdateQuery(workday);
  const loadingStandup = isLikelyOffline() ? false : standupQuery.isLoading;

  const pickerBounds = React.useMemo(
    () => getWorkdayPickerBounds({ isPro }),
    [isPro]
  );

  React.useEffect(() => {
    setWorkday((current) => clampWorkdayToBounds(current, pickerBounds));
  }, [pickerBounds]);

  React.useEffect(() => {
    if (!initialWorkday) {
      return;
    }
    setWorkday(clampWorkdayToBounds(initialWorkday, pickerBounds));
  }, [initialWorkday, pickerBounds]);

  const {
    commits,
    syncing,
    loading: loadingActivity,
    error: activityError,
    rateLimitResetAt,
    token,
    tokenLoading,
    refresh,
    updateCommitWorkType,
  } = useActivitySync(workday, isPro);

  const {
    notes,
    carryForwardNotes,
    loading: loadingNotes,
    error: notesError,
  } = useManualNotesQuery(workday);

  const { addNote, editNote, removeNote } = useManualNoteMutations(workday);

  const composeInput = React.useMemo(
    () => ({ workday, commits, notes, carryForwardNotes }),
    [workday, commits, notes, carryForwardNotes]
  );

  const manualMarkdown = React.useMemo(
    () => composeManualMarkdown(composeInput),
    [composeInput]
  );

  React.useEffect(() => {
    if (isLikelyOffline()) {
      const cached = readWorkdaySnapshot(workday);
      if (cached?.draftMarkdown) {
        setSavedMarkdown(cached.draftMarkdown);
        setOfflineBanner('Offline — showing cached standup.');
      } else {
        setSavedMarkdown(null);
        setOfflineBanner(null);
      }
      return;
    }

    if (standupQuery.isLoading) {
      return;
    }

    if (standupQuery.isError) {
      const cached = readWorkdaySnapshot(workday);
      if (cached?.draftMarkdown) {
        setSavedMarkdown(cached.draftMarkdown);
        setOfflineBanner('Could not reach server — using cached standup.');
      } else {
        setSavedMarkdown(null);
        setOfflineBanner(null);
      }
      return;
    }

    const standup = standupQuery.data;
    if (standup?.draft_markdown?.trim()) {
      setSavedMarkdown(standup.draft_markdown);
      setDraftSource('saved');
      setOfflineBanner(null);
    } else {
      setSavedMarkdown(null);
      setDraftSource(null);
      setOfflineBanner(null);
    }
  }, [
    standupQuery.data,
    standupQuery.isError,
    standupQuery.isLoading,
    workday,
  ]);

  React.useEffect(() => {
    setDraftMarkdown(null);
    setDraftSource(null);
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
      setDraftSource('fallback');
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
      setDraftSource('ai');
      if (result.draft.classifications.length > 0) {
        await updateCommitWorkTypes(
          supabase,
          session.user.id,
          result.draft.classifications
        );
      }
      const firstDraft = await markFirstEvent(
        session.user.id,
        'first_draft_generated'
      );
      track('draft_generated', {
        workday,
        first_draft: firstDraft,
      });
    } else {
      setDraftMarkdown(manualMarkdown);
      setDraftSource('fallback');
      track('draft_generation_failed', {
        workday,
        error_code: result.error ?? 'fallback',
      });
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
    setDraftSource(null);
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
        setNoteError(userFacingMessage(categorizeError(result.error)));
        return;
      }
      setEditorOpen(false);
      setEditingNote(null);
      track('manual_note_created', {
        is_blocker: input.is_blocker,
        is_carry_forward: input.is_carry_forward,
      });
    },
    [addNote, editNote, editingNote]
  );

  const onStandupSaved = React.useCallback((markdown: string) => {
    setSavedMarkdown(markdown);
    setDraftMarkdown(null);
    setDraftSource('saved');
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
      rateLimitResetAt,
      token,
      tokenLoading,
      refreshActivity,
      updateCommitWorkType,
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
      draftSource,
      aiLoading,
      aiError,
      aiRateLimited,
      aiRetryAfterSeconds,
      regenerateDraft,
      onStandupSaved,
      editorMarkdown,
      setEditorMarkdown,
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
      rateLimitResetAt,
      token,
      tokenLoading,
      refreshActivity,
      updateCommitWorkType,
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
      draftSource,
      aiLoading,
      aiError,
      aiRateLimited,
      aiRetryAfterSeconds,
      regenerateDraft,
      onStandupSaved,
      editorMarkdown,
      loadingStandup,
      loading,
    ]
  );

  return (
    <StandupContext.Provider value={value}>{children}</StandupContext.Provider>
  );
}
