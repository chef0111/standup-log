import { Text } from '@/components/ui/text';
import type { ActivityCommitRow } from '@/features/standup/types/activity-commit';
import * as React from 'react';
import { View } from 'react-native';

type ActivityListProps = {
  commits: ActivityCommitRow[];
  emptyMessage?: string;
};

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString(undefined, {
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
}

function ActivityListItem({ item }: { item: ActivityCommitRow }) {
  const repo =
    item.repository_full_name.split('/').pop() ?? item.repository_full_name;
  const firstLine = item.message.split('\n')[0]?.trim() ?? item.message;

  return (
    <View className="border-border gap-1 border-b py-3">
      <View className="flex-row items-center justify-between gap-2">
        <Text className="text-muted-foreground text-xs font-medium">
          {repo}
        </Text>
        <Text className="text-muted-foreground text-xs">
          {formatTime(item.committed_at)}
        </Text>
      </View>
      <Text className="text-foreground text-sm leading-snug">{firstLine}</Text>
      {item.pr_number != null ? (
        <Text className="text-primary text-xs">
          PR #{item.pr_number}
          {item.pr_title ? `: ${item.pr_title}` : ''}
        </Text>
      ) : null}
    </View>
  );
}

export function ActivityList({ commits, emptyMessage }: ActivityListProps) {
  if (commits.length === 0) {
    return (
      <View className="py-6">
        <Text className="text-muted-foreground text-center text-sm">
          {emptyMessage ??
            'No commits for this Workday yet. Refresh to sync from GitHub.'}
        </Text>
      </View>
    );
  }

  return (
    <View>
      {commits.map((item) => (
        <ActivityListItem key={item.sha} item={item} />
      ))}
    </View>
  );
}
