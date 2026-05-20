import { GithubIcon } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { ButtonSpinner } from '@/components/ui/button-spinner';
import { Text } from '@/components/ui/text';
import {
  AuthStatusView,
  SignInLanding,
  signInWithGitHub,
  useAuth,
} from '@/features/auth';
import { useThemeColor } from '@/features/theme';
import { track } from '@/lib/analytics';
import { AppError, userFacingMessage } from '@/lib/errors';
import { getSupabase } from '@/utils/supabase';
import { Redirect, Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as React from 'react';
import { View } from 'react-native';

type SignInPhase = 'idle' | 'loading' | 'success';

const BUTTON_ICON_SLOT = 20;

export default function SignInScreen() {
  const router = useRouter();
  const { configured, session } = useAuth();
  const foreground = useThemeColor('--color-foreground');
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
      track('github_oauth_failure', {
        error_code: e instanceof AppError ? e.category : 'unknown',
      });
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
      <StatusBar style="light" />
      <SignInLanding>
        <Button
          disabled={busy || !configured}
          onPress={onGitHub}
          className="bg-background h-14 w-full rounded-full"
          size="lg"
        >
          <View
            className="items-center justify-center"
            style={{ width: BUTTON_ICON_SLOT, height: BUTTON_ICON_SLOT }}
          >
            {busy ? (
              <ButtonSpinner color={foreground} size={BUTTON_ICON_SLOT} />
            ) : (
              <GithubIcon size={BUTTON_ICON_SLOT} color={foreground} />
            )}
          </View>
          <Text className="text-foreground text-base font-semibold">
            {busy ? 'Opening GitHub…' : 'Continue with GitHub'}
          </Text>
        </Button>

        {message ? (
          <Text
            selectable
            className="text-destructive text-center text-sm leading-relaxed"
          >
            {message}
          </Text>
        ) : null}

        <Text className="text-center text-xs leading-relaxed text-zinc-500">
          By continuing, you agree to connect GitHub for repository access used
          to build your standup updates.
        </Text>
      </SignInLanding>
    </>
  );
}
