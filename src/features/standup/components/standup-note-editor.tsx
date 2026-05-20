import { NoteEditorSheet } from '@/features/standup/components/notes/note-editor-sheet';
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
