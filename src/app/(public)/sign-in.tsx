import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Stack } from 'expo-router';
import { ScrollView, View } from 'react-native';

export default function SignInScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Sign in' }} />
      <ScrollView
        className="flex-1 bg-background"
        contentContainerClassName="flex-grow justify-center gap-6 p-6"
        keyboardShouldPersistTaps="handled">
        <View className="gap-2">
          <Text variant="h2" className="text-foreground">
            StandupLog
          </Text>
          <Text className="text-lg text-muted-foreground">
            Turn yesterday&apos;s commits and notes into a standup update.
          </Text>
        </View>
        <Text className="text-muted-foreground">
          GitHub sign-in is wired in the next step of the build. Once Supabase Auth is configured, you will sign in
          here with GitHub.
        </Text>
        <Button disabled>
          <Text>Continue with GitHub</Text>
        </Button>
      </ScrollView>
    </>
  );
}
