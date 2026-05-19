import { Text } from '@/components/ui/text';
import type { GithubRepoRow } from '@/lib/github-repos';
import { FlashList } from '@shopify/flash-list';
import { Image } from 'expo-image';
import * as React from 'react';
import { Pressable, View } from 'react-native';

type RowProps = {
  item: GithubRepoRow;
  selected: boolean;
  onToggle: () => void;
};

const RepositoryRow = React.memo(function RepositoryRow({ item, selected, onToggle }: RowProps) {
  return (
    <Pressable
      onPress={onToggle}
      className={`flex-row items-center gap-3 border-b border-border px-4 py-3 active:bg-accent/40 ${
        selected ? 'bg-primary/5' : ''
      }`}>
      <View
        className={`size-5 items-center justify-center rounded-md border ${
          selected ? 'border-primary bg-primary' : 'border-muted-foreground bg-background'
        }`}>
        {selected ? <Text className="text-[10px] font-bold text-primary-foreground">✓</Text> : null}
      </View>
      {item.ownerAvatarUrl ? (
        <Image
          source={{ uri: item.ownerAvatarUrl }}
          style={{ width: 36, height: 36, borderRadius: 18 }}
          accessibilityLabel={`Owner avatar for ${item.full_name}`}
        />
      ) : (
        <View className="size-9 items-center justify-center rounded-full bg-muted">
          <Text className="text-xs font-semibold text-muted-foreground">{item.full_name[0]?.toUpperCase() ?? '?'}</Text>
        </View>
      )}
      <View className="min-w-0 flex-1">
        <Text className="font-medium text-foreground" numberOfLines={1}>
          {item.full_name}
        </Text>
        {item.private ? (
          <Text className="text-xs text-muted-foreground">Private</Text>
        ) : (
          <Text className="text-xs text-muted-foreground">Public</Text>
        )}
      </View>
    </Pressable>
  );
});

type RepositoryListProps = {
  data: GithubRepoRow[];
  selectedIds: ReadonlySet<number>;
  onToggle: (repo: GithubRepoRow) => void;
  emptyLabel: string;
};

export function RepositoryList({ data, selectedIds, onToggle, emptyLabel }: RepositoryListProps) {
  const renderItem = React.useCallback(
    ({ item }: { item: GithubRepoRow }) => (
      <RepositoryRow
        item={item}
        selected={selectedIds.has(item.id)}
        onToggle={() => {
          onToggle(item);
        }}
      />
    ),
    [onToggle, selectedIds]
  );

  if (data.length === 0) {
    return (
      <View className="flex-1 items-center justify-center p-8">
        <Text className="text-center text-muted-foreground">{emptyLabel}</Text>
      </View>
    );
  }

  return (
    <FlashList
      style={{ flex: 1 }}
      data={data}
      keyExtractor={(item) => String(item.id)}
      renderItem={renderItem}
      estimatedItemSize={76}
      extraData={Array.from(selectedIds).sort().join(',')}
    />
  );
}
