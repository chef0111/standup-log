import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { StandupHistoryRow } from '@/features/standup/components/history/standup-history-row';
import type { StandupHistoryItem } from '@/features/standup/lib/history/standup-history-item';
import type { Workday } from '@/features/standup/types/workday';
import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import * as React from 'react';
import { View } from 'react-native';

type StandupHistoryListProps = {
  items: StandupHistoryItem[];
  totalCount: number;
  onItemPress: (workday: Workday) => void;
  onClearFilters?: () => void;
};

export function StandupHistoryList({
  items,
  totalCount,
  onItemPress,
  onClearFilters,
}: StandupHistoryListProps) {
  const router = useRouter();

  const renderItem = React.useCallback(
    ({ item }: { item: StandupHistoryItem }) => (
      <StandupHistoryRow item={item} onPress={onItemPress} />
    ),
    [onItemPress]
  );

  const ItemSeparator = React.useCallback(() => <View className="h-3" />, []);

  if (totalCount === 0) {
    return (
      <View className="flex-1 items-center justify-center gap-4 p-8">
        <Text className="text-muted-foreground text-center text-sm leading-relaxed">
          No saved standups yet. Generate your first update from commits and
          notes.
        </Text>
        <Button
          variant="charcoal"
          size="pill"
          onPress={() => {
            router.push('/standup');
          }}
        >
          <Text>Generate standup</Text>
        </Button>
      </View>
    );
  }

  if (items.length === 0) {
    return (
      <View className="flex-1 items-center justify-center gap-4 p-8">
        <Text className="text-muted-foreground text-center text-sm leading-relaxed">
          No standups match your filters.
        </Text>
        {onClearFilters ? (
          <Button variant="outline" size="pill" onPress={onClearFilters}>
            <Text>Clear filters</Text>
          </Button>
        ) : null}
      </View>
    );
  }

  return (
    <FlashList
      data={items}
      keyExtractor={(item) => item.workday}
      renderItem={renderItem}
      estimatedItemSize={96}
      ItemSeparatorComponent={ItemSeparator}
      contentContainerStyle={{ paddingBottom: 8 }}
    />
  );
}
