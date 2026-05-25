import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { useRouter } from 'expo-router';
import { ChevronRight, History } from 'lucide-react-native';
import * as React from 'react';
import { Pressable, View } from 'react-native';

export function HomeStandupHistoryLink() {
  const router = useRouter();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="View all standups"
      onPress={() => {
        router.push('/history');
      }}
    >
      <Card variant="elevated" className="flex-row items-center gap-3 p-5">
        <View className="bg-muted/80 size-9 items-center justify-center rounded-md">
          <Icon as={History} size={18} className="text-foreground" />
        </View>
        <View className="min-w-0 flex-1 gap-0.5">
          <Text className="text-foreground text-base font-semibold">
            View all standups
          </Text>
          <Text className="text-muted-foreground text-sm">
            Browse saved standups by Workday
          </Text>
        </View>
        <Icon as={ChevronRight} size={18} className="text-muted-foreground" />
      </Card>
    </Pressable>
  );
}
