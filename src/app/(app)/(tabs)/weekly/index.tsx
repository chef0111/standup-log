import { Text } from '@/components/ui/text';
import { ScreenHeaderActions } from '@/features/shell';
import { Stack } from 'expo-router';
import * as React from 'react';
import { ScrollView, View } from 'react-native';

export default function WeeklyPlaceholderScreen() {
  return (
    <>
      <Stack.Screen
        options={{
          title: 'Weekly',
          headerRight: () => <ScreenHeaderActions />,
        }}
      />
      <ScrollView
        className="flex-1"
        contentContainerClassName="mx-auto w-full max-w-lg flex-grow gap-4 px-5 pb-4 pt-2"
        contentInsetAdjustmentBehavior="automatic"
      >
        <View className="gap-2">
          <Text variant="h3" className="border-0 pb-0">
            Weekly Summary
          </Text>
          <Text selectable className="text-muted-foreground text-sm leading-relaxed">
            Your week-at-a-glance breakdown by Work Type will appear here.
          </Text>
        </View>
      </ScrollView>
    </>
  );
}
