import { useActivitySync } from '@/features/activity';
import type { ManualNoteRow } from '@/features/notes';
import type {
  Workday,
  WorkdayPickerBounds,
} from '@/features/workday/types/workday';
import * as React from 'react';

export type StandupContextValue = {
  workday: Workday;
  pickerBounds: WorkdayPickerBounds;
  isPro: boolean;
  onWorkdayChange: (next: Workday) => void;
  offlineBanner: string | null;
  commits: ReturnType<typeof useActivitySync>['commits'];
  loadingActivity: boolean;
  syncing: boolean;
  activityError: string | null;
  rateLimitResetAt: number | null;
  token: ReturnType<typeof useActivitySync>['token'];
  tokenLoading: boolean;
  refreshActivity: () => void;
  notes: ManualNoteRow[];
  carryForwardNotes: ManualNoteRow[];
  loadingNotes: boolean;
  notesError: string | null;
  removeNote: (noteId: string) => Promise<{ error: string | null }>;
  editorOpen: boolean;
  setEditorOpen: (open: boolean) => void;
  editingNote: ManualNoteRow | null;
  openAddNote: () => void;
  openEditNote: (note: ManualNoteRow) => void;
  noteSaving: boolean;
  noteError: string | null;
  handleSaveNote: (input: {
    body: string;
    is_blocker: boolean;
    is_carry_forward: boolean;
  }) => Promise<void>;
  savedMarkdown: string | null;
  draftMarkdown: string | null;
  aiLoading: boolean;
  aiError: string | null;
  aiRateLimited: boolean;
  aiRetryAfterSeconds: number | null;
  regenerateDraft: () => Promise<void>;
  onStandupSaved: (markdown: string) => void;
  loadingStandup: boolean;
  loading: boolean;
};

export const StandupContext = React.createContext<
  StandupContextValue | undefined
>(undefined);
