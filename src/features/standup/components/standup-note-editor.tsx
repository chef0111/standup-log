import { NoteEditorSheet } from '@/features/notes';
import * as React from 'react';
import { useStandup } from '../context/standup';

export function StandupNoteEditor() {
  const {
    editorOpen,
    setEditorOpen,
    editingNote,
    noteSaving,
    noteError,
    handleSaveNote,
  } = useStandup();

  return (
    <NoteEditorSheet
      open={editorOpen}
      onOpenChange={setEditorOpen}
      note={editingNote}
      saving={noteSaving}
      error={noteError}
      onSave={handleSaveNote}
    />
  );
}
