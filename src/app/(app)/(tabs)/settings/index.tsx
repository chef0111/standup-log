import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { ScreenHeaderActions } from '@/features/shell';
import { Stack, useRouter } from 'expo-router';
import * as React from 'react';
import { ScrollView, View } from 'react-native';

export default function SettingsScreen() {
  const router = useRouter();

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Settings',
          headerShown: true,
          headerRight: () => <ScreenHeaderActions />,
        }}
      />
      <View className="bg-background flex-1">
        <ScrollView
          className="flex-1"
          contentContainerClassName="mx-auto w-full max-w-lg gap-4 px-5 pb-4 pt-2"
          contentInsetAdjustmentBehavior="automatic"
          showsVerticalScrollIndicator={false}
        >
          <Button
            variant="outline"
            onPress={() => router.push('/settings/repositories')}
          >
            <Text>Manage repositories</Text>
          </Button>
        </ScrollView>
      </View>
    </>
  );
}
