import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { useHomeWeekSnapshot } from '@/features/home/hooks/use-home-week-snapshot';
import { useRouter } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';
import * as React from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';

export function HomeWeekSnapshotCard() {
  const router = useRouter();
  const { weekLabel, commitCount, copiedCount, loading, error } =
    useHomeWeekSnapshot();

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => router.push('/history/summary')}
    >
      <Card variant="elevated" className="gap-3 p-5">
        <View className="flex-row items-center justify-between gap-2">
          <Text className="text-foreground text-base font-semibold">
            This week
          </Text>
          <Icon as={ChevronRight} size={18} className="text-muted-foreground" />
        </View>
        <Text className="text-muted-foreground text-sm">{weekLabel}</Text>
        {loading ? (
          <ActivityIndicator />
        ) : error ? (
          <Text className="text-destructive text-sm">{error}</Text>
        ) : (
          <Text className="text-foreground text-sm">
            {commitCount} commit{commitCount === 1 ? '' : 's'} · {copiedCount}{' '}
            copied standup{copiedCount === 1 ? '' : 's'}
          </Text>
        )}
      </Card>
    </Pressable>
  );
}
