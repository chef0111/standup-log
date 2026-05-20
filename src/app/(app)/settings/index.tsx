import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useSafeRouterBack } from '@/hooks/use-safe-router-back';
import { Stack, useRouter } from 'expo-router';
import * as React from 'react';
import { ScrollView, View } from 'react-native';

export default function SettingsScreen() {
  const router = useRouter();
  const goBack = useSafeRouterBack('/(app)');

  return (
    <>
      <Stack.Screen options={{ title: 'Settings', headerShown: true }} />
      <View className="bg-background flex-1">
        <ScrollView
          className="flex-1"
          contentContainerClassName="mx-auto w-full max-w-lg gap-4 px-5 pb-4 pt-2"
          showsVerticalScrollIndicator={false}
        >
          <Button
            variant="outline"
            onPress={() => router.push('/(app)/settings/repositories')}
          >
            <Text>Manage repositories</Text>
          </Button>
          <Button variant="ghost" onPress={goBack}>
            <Text>Back to home</Text>
          </Button>
        </ScrollView>
      </View>
    </>
  );
}
