import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { StandupDraftPanel } from '@/features/standup/components/standup-draft-panel';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Eye } from 'lucide-react-native';
import * as React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useStandup } from '../context/standup';

export function StandupDraftSection() {
  const { loading } = useStandup();
  const foreground = useThemeColor('--color-foreground');

  return (
    <Card variant="elevated" className="gap-3 p-5">
      {loading ? (
        <View className="flex-col gap-4">
          <View className="flex-row items-center justify-between">
            <Text className="text-foreground text-lg font-bold">
              Standup draft
            </Text>
            <Button variant="outline" size="sm">
              <Icon as={Eye} />
              <Text className="text-foreground text-sm font-medium">
                View standup
              </Text>
            </Button>
          </View>
          <ActivityIndicator color={foreground} />
        </View>
      ) : (
        <StandupDraftPanel />
      )}
    </Card>
  );
}
