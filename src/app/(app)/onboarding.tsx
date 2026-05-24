import { RepositoryPickerScreen } from '@/features/repositories/components/repository-picker-screen';
import { RepositoryPickerProvider } from '@/features/repositories/context/repository-picker';
import { Stack, useRouter } from 'expo-router';

export default function OnboardingRepositoriesScreen() {
  const router = useRouter();

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Select repositories',
          headerTransparent: true,
          headerStyle: { backgroundColor: 'transparent' },
          headerTintColor: '#fff',
        }}
      />
      <RepositoryPickerProvider
        mode="onboarding"
        onComplete={() => router.replace('/(app)')}
      >
        <RepositoryPickerScreen />
      </RepositoryPickerProvider>
    </>
  );
}
