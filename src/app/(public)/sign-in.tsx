import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { AppError, userFacingMessage } from '@/lib/errors';
import { getOAuthRedirectUri, signInWithGitHub } from '@/lib/oauth';
import { useAuth } from '@/providers/auth-provider';
import { Stack } from 'expo-router';
import * as React from 'react';
import { ScrollView, View } from 'react-native';

export default function SignInScreen() {
  const { configured } = useAuth();
  const [busy, setBusy] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);

  const onGitHub = React.useCallback(async () => {
    setMessage(null);
    setBusy(true);
    try {
      await signInWithGitHub();
    } catch (e) {
      const text = e instanceof AppError ? e.message : userFacingMessage('auth');
      setMessage(text);
    } finally {
      setBusy(false);
    }
  }, []);

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
        {configured ? (
          <View className="gap-2 rounded-lg border border-border bg-muted/20 p-4">
            <Text className="text-xs text-muted-foreground">OAuth redirect (add in Supabase Auth → URL configuration)</Text>
            <Text variant="code" className="text-xs text-muted-foreground">
              {getOAuthRedirectUri()}
            </Text>
          </View>
        ) : null}
        <Button disabled={busy || !configured} onPress={onGitHub}>
          <Text>{busy ? 'Opening GitHub…' : 'Continue with GitHub'}</Text>
        </Button>
        {message ? <Text className="text-destructive">{message}</Text> : null}
      </ScrollView>
    </>
  );
}
