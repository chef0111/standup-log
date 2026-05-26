import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { NotesList } from '@/features/standup/components/notes/notes-list';
import { VoiceNoteSheet } from '@/features/standup/components/voice/voice-note-sheet';
import { useThemeColor } from '@/hooks/use-theme-color';
import { cn } from '@/lib/utils';
import { Mic, Plus } from 'lucide-react-native';
import * as React from 'react';
import { ActivityIndicator, ScrollView, View } from 'react-native';
import { useStandup } from '../context/standup';

type StandupNotesSectionProps = {
  embedded?: boolean;
};

export function StandupNotesSection({
  embedded = false,
}: StandupNotesSectionProps) {
  const {
    loading,
    notesError,
    notes,
    openAddNote,
    openEditNote,
    removeNote,
    handleSaveNote,
    noteSaving,
    noteError,
  } = useStandup();
  const [voiceOpen, setVoiceOpen] = React.useState(false);
  const foreground = useThemeColor('--color-foreground');

  const content = (
    <>
      <View className="flex-row items-center justify-between">
        <Text className="text-foreground text-sm font-medium">Notes</Text>
        <View className="flex-row gap-2">
          <Button variant="outline" size="sm" onPress={openAddNote}>
            <Plus size={14} />
            <Text>Add note</Text>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onPress={() => setVoiceOpen(true)}
          >
            <Mic size={14} />
            <Text>Voice</Text>
          </Button>
        </View>
      </View>
      {loading ? (
        <ActivityIndicator color={foreground} />
      ) : (
        <>
          {notesError && (
            <Text className="text-destructive text-sm">{notesError}</Text>
          )}
          <ScrollView
            nestedScrollEnabled
            style={{ maxHeight: 256 }}
            showsVerticalScrollIndicator={false}
          >
            <NotesList
              notes={notes}
              onEdit={openEditNote}
              onDelete={(note) => {
                void removeNote(note.id);
              }}
            />
          </ScrollView>
        </>
      )}
      <VoiceNoteSheet
        open={voiceOpen}
        onOpenChange={setVoiceOpen}
        saving={noteSaving}
        error={noteError}
        onSave={handleSaveNote}
      />
    </>
  );

  if (embedded) {
    return <View className="gap-3">{content}</View>;
  }

  return <Card className={cn('gap-3 p-4')}>{content}</Card>;
}
