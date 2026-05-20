import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { NotesList } from '@/features/notes';
import { useThemeColor } from '@/features/theme';
import { Plus } from 'lucide-react-native';
import * as React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useStandup } from '../context/standup';

export function StandupNotesSection() {
  const { loading, notesError, notes, openAddNote, openEditNote, removeNote } =
    useStandup();
  const foreground = useThemeColor('--color-foreground');

  return (
    <Card className="gap-3 p-4">
      <View className="flex-row items-center justify-between">
        <Text className="text-foreground text-sm font-medium">Notes</Text>
        <Button variant="outline" size="sm" onPress={openAddNote}>
          <Plus size={14} />
          <Text>Add note</Text>
        </Button>
      </View>
      {loading ? (
        <ActivityIndicator color={foreground} />
      ) : (
        <>
          {notesError ? (
            <Text className="text-destructive text-sm">{notesError}</Text>
          ) : null}
          <NotesList
            notes={notes}
            onEdit={openEditNote}
            onDelete={(note) => {
              void removeNote(note.id);
            }}
          />
        </>
      )}
    </Card>
  );
}
