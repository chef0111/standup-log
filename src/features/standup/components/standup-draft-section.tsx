import { Text } from '@/components/ui/text';
import { StandupDraftPanel } from '@/features/standup/components/standup-draft-panel';
import { useThemeColor } from '@/hooks/use-theme-color';
import * as React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useStandup } from '../context/standup';

export function StandupDraftSection() {
  const { loading } = useStandup();
  const foreground = useThemeColor('--color-foreground');

  return (
    <View className="gap-3">
      <View className="flex-row items-center justify-between gap-2">
        <Text className="text-foreground text-sm font-medium">Standup draft</Text>
      </View>
      {loading ? (
        <ActivityIndicator color={foreground} />
      ) : (
        <StandupDraftPanel />
      )}
    </View>
  );
}
