import { GithubIcon } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import {
  AuthStatusView,
  OAuthDevHint,
  signInWithGitHub,
  useAuth,
} from '@/features/auth';
import { useThemeColor } from '@/features/theme';
import { AppError, userFacingMessage } from '@/lib/errors';
import { getSupabase } from '@/utils/supabase';
import { Redirect, Stack, useRouter } from 'expo-router';
import * as React from 'react';
import { ActivityIndicator, Platform, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type SignInPhase = 'idle' | 'loading' | 'success';

const spinnerColor = Platform.select({
  ios: undefined,
  android: '#fafafa',
  default: '#fafafa',
});

export default function SignInScreen() {
  const router = useRouter();
  const { configured, session } = useAuth();
  const primaryForeground = useThemeColor('--color-primary-foreground');
  const [phase, setPhase] = React.useState<SignInPhase>('idle');
  const [message, setMessage] = React.useState<string | null>(null);

  const onGitHub = React.useCallback(async () => {
    setMessage(null);
    setPhase('loading');
    try {
      await signInWithGitHub();
      const supabase = getSupabase();
      const { data } = supabase
        ? await supabase.auth.getSession()
        : { data: { session: null } };
      if (!data.session) {
        setPhase('idle');
        return;
      }
      setPhase('success');
      await new Promise((resolve) => setTimeout(resolve, 800));
      router.replace('/');
    } catch (e) {
      setPhase('idle');
      const text =
        e instanceof AppError ? e.message : userFacingMessage('auth');
      setMessage(text);
    }
  }, [router]);

  if (session && phase === 'idle') {
    return <Redirect href="/" />;
  }

  if (phase === 'success') {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
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
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView className="bg-background flex-1">
        <View className="flex-1 px-6">
          <View className="mx-auto w-full max-w-sm flex-1 justify-center pb-16">
            <View className="gap-10">
              <View className="gap-4">
                <View className="border-border bg-muted/30 size-12 items-center justify-center rounded-lg border">
                  <Text className="text-foreground text-lg font-bold">S</Text>
                </View>
                <View className="gap-2">
                  <Text className="text-foreground text-4xl font-semibold tracking-tight">
                    StandupLog
                  </Text>
                  <Text className="text-muted-foreground text-base leading-relaxed">
                    Turn yesterday&apos;s commits and notes into a clear standup
                    update — in minutes, not hours.
                  </Text>
                </View>
              </View>

              <View className="border-border gap-5 rounded-lg border p-6">
                <View className="gap-1">
                  <Text className="text-foreground text-sm font-medium">
                    Sign in to continue
                  </Text>
                  <Text className="text-muted-foreground text-sm">
                    Use your GitHub account. We only read activity from repos
                    you choose.
                  </Text>
                </View>

                <Button
                  disabled={busy || !configured}
                  onPress={onGitHub}
                  className="h-11 w-full"
                  size="lg"
                >
                  {busy ? (
                    <ActivityIndicator size="small" color={spinnerColor} />
                  ) : (
                    <GithubIcon size={18} color={primaryForeground} />
                  )}
                  <Text>
                    {busy ? 'Opening GitHub…' : 'Continue with GitHub'}
                  </Text>
                </Button>

                {message ? (
                  <Text className="text-destructive text-center text-sm">
                    {message}
                  </Text>
                ) : null}

                {!configured ? (
                  <Text className="text-muted-foreground text-center text-sm">
                    Add Supabase env vars to `.env.local`, then restart Expo.
                  </Text>
                ) : null}
              </View>

              {configured ? <OAuthDevHint /> : null}

              <Text className="text-muted-foreground text-center text-xs leading-relaxed">
                By continuing, you agree to connect GitHub for repository access
                used to build your standup updates.
              </Text>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </>
  );
}
