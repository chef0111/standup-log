import { AuthStatusView } from '@/components/auth/auth-status';
import { GithubIcon } from '@/components/icons/github-icon';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useAuth } from '@/context/auth-provider';
import { AppError, userFacingMessage } from '@/lib/errors';
import { getOAuthRedirectUri, signInWithGitHub } from '@/lib/oauth';
import { getSupabase } from '@/utils/supabase';
import { Redirect, Stack, useRouter } from 'expo-router';
import { useUnstableNativeVariable } from 'nativewind';
import * as React from 'react';
import { ActivityIndicator, Platform, ScrollView, View } from 'react-native';

type SignInPhase = 'idle' | 'loading' | 'success';

const spinnerColor = Platform.select({
  ios: undefined,
  android: '#fafafa',
  default: '#fafafa',
});

export default function SignInScreen() {
  const router = useRouter();
  const { configured, session } = useAuth();
  const primaryForeground = useUnstableNativeVariable('--color-primary-foreground');
  const [phase, setPhase] = React.useState<SignInPhase>('idle');
  const [message, setMessage] = React.useState<string | null>(null);

  if (session) {
    return <Redirect href="/" />;
  }

  const onGitHub = React.useCallback(async () => {
    setMessage(null);
    setPhase('loading');
    try {
      await signInWithGitHub();
      const supabase = getSupabase();
      const { data } = supabase ? await supabase.auth.getSession() : { data: { session: null } };
      if (!data.session) {
        setPhase('idle');
        return;
      }
      setPhase('success');
      await new Promise((resolve) => setTimeout(resolve, 1200));
      router.replace('/');
    } catch (e) {
      setPhase('idle');
      const text = e instanceof AppError ? e.message : userFacingMessage('auth');
      setMessage(text);
    }
  }, [router]);

  if (phase === 'success') {
    return (
      <>
        <Stack.Screen options={{ title: 'Sign in' }} />
        <AuthStatusView
          variant="success"
          successTitle="Signed in successfully"
          successDetail="Opening your workspace…"
        />
      </>
    );
  }

  const busy = phase === 'loading';

  return (
    <>
      <Stack.Screen options={{ title: 'Sign in' }} />
      <ScrollView
        className="flex-1 bg-background"
        contentContainerClassName="flex-grow justify-center gap-6 p-6"
        keyboardShouldPersistTaps="handled">
        <View className="flex-row justify-end">
          <ThemeToggle />
        </View>
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
            <Text className="text-xs text-muted-foreground">
              OAuth redirect (add in Supabase Auth → URL configuration)
            </Text>
            <Text variant="code" className="text-xs text-muted-foreground">
              {getOAuthRedirectUri()}
            </Text>
          </View>
        ) : null}
        <Button disabled={busy || !configured} onPress={onGitHub}>
          {busy ? (
            <ActivityIndicator size="small" color={spinnerColor} />
          ) : (
            <GithubIcon size={18} color={primaryForeground ?? undefined} />
          )}
          <Text>{busy ? 'Opening GitHub…' : 'Continue with GitHub'}</Text>
        </Button>
        {message ? <Text className="text-destructive">{message}</Text> : null}
      </ScrollView>
    </>
  );
}
