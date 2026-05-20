import { RepositoryPickerScreen } from '@/features/repositories/components/repository-picker-screen';
import { RepositoryPickerProvider } from '@/features/repositories/context/repository-picker';
import { useSafeRouterBack } from '@/hooks/use-safe-router-back';
import { Stack } from 'expo-router';
import * as React from 'react';

export default function SettingsRepositoriesScreen() {
  const goBack = useSafeRouterBack('/settings');

  return (
    <>
      <Stack.Screen options={{ title: 'Repositories', headerShown: true }} />
      <RepositoryPickerProvider
        mode="manage"
        onComplete={goBack}
        onDismiss={goBack}
      >
        <RepositoryPickerScreen />
      </RepositoryPickerProvider>
    </>
  );
}
