import { useActivitySync } from '@/features/activity';
import type { ManualNoteRow } from '@/features/notes';
import type { StandupSections } from '@/features/standup/lib/compose-standup';
import type {
  Workday,
  WorkdayPickerBounds,
} from '@/features/workday/types/workday';
import * as React from 'react';

export type StandupContextValue = {
  workday: Workday;
  workdayPickerKey: number;
  pickerBounds: WorkdayPickerBounds;
  isPro: boolean;
  onWorkdayChange: (next: Workday) => void;
  offlineBanner: string | null;
  commits: ReturnType<typeof useActivitySync>['commits'];
  loadingActivity: boolean;
  syncing: boolean;
  activityError: string | null;
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
  savedSections: StandupSections | null;
  draftSections: StandupSections | null;
  aiLoading: boolean;
  aiError: string | null;
  regenerateDraft: () => Promise<void>;
  onStandupSaved: (sections: StandupSections) => void;
  loadingStandup: boolean;
  loading: boolean;
};

export const StandupContext = React.createContext<
  StandupContextValue | undefined
>(undefined);
