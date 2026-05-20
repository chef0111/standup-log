import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import type { ManualNoteRow } from '@/features/standup/types/manual-note';
import { FlashList } from '@shopify/flash-list';
import { Pencil, Trash2 } from 'lucide-react-native';
import * as React from 'react';
import { View } from 'react-native';

type NotesListProps = {
  notes: ManualNoteRow[];
  onEdit: (note: ManualNoteRow) => void;
  onDelete: (note: ManualNoteRow) => void;
  emptyMessage?: string;
};

function NoteListItem({
  item,
  onEdit,
  onDelete,
}: {
  item: ManualNoteRow;
  onEdit: (note: ManualNoteRow) => void;
  onDelete: (note: ManualNoteRow) => void;
}) {
  return (
    <View className="border-border gap-2 border-b py-3">
      <Text className="text-foreground text-sm leading-relaxed">
        {item.body}
      </Text>
      <View className="flex-row flex-wrap items-center gap-2">
        {item.is_blocker ? (
          <Text className="bg-destructive/10 text-destructive rounded-full px-2 py-0.5 text-xs">
            Blocker
          </Text>
        ) : null}
        {item.is_carry_forward ? (
          <Text className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs">
            Carry forward
          </Text>
        ) : null}
        <View className="ml-auto flex-row gap-1">
          <Button
            variant="ghost"
            size="icon"
            accessibilityLabel="Edit note"
            onPress={() => onEdit(item)}
          >
            <Icon as={Pencil} size={16} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            accessibilityLabel="Delete note"
            onPress={() => onDelete(item)}
          >
            <Icon as={Trash2} size={16} className="text-destructive" />
          </Button>
        </View>
      </View>
    </View>
  );
}

export function NotesList({
  notes,
  onEdit,
  onDelete,
  emptyMessage,
}: NotesListProps) {
  if (notes.length === 0) {
    return (
      <View className="py-4">
        <Text className="text-muted-foreground text-center text-sm">
          {emptyMessage ??
            'No notes for this Workday. Add context GitHub cannot see.'}
        </Text>
      </View>
    );
  }

  return (
    <FlashList
      data={notes}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <NoteListItem item={item} onEdit={onEdit} onDelete={onDelete} />
      )}
      scrollEnabled={false}
    />
  );
}
