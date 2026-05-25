import { GithubIcon } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { ButtonSpinner } from '@/components/ui/button-spinner';
import { Text } from '@/components/ui/text';
import { useAuth } from '@/context/auth';
import { AuthStatusView } from '@/features/auth/components/auth-status';
import { SignInLanding } from '@/features/auth/components/sign-in-landing';
import { signInWithGitHub } from '@/features/auth/lib/oauth';
import { track } from '@/lib/analytics';
import { AppError, userFacingMessage } from '@/lib/errors';
import { Redirect, Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as React from 'react';
import { View } from 'react-native';

type SignInPhase = 'idle' | 'loading' | 'success';

const BUTTON_ICON_SLOT = 20;

export default function SignInScreen() {
  const router = useRouter();
  const { configured, session, authError, clearAuthError } = useAuth();
  const [phase, setPhase] = React.useState<SignInPhase>('idle');
  const [message, setMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (authError) {
      setMessage(authError);
      clearAuthError();
    }
  }, [authError, clearAuthError]);

  const onGitHub = React.useCallback(async () => {
    setMessage(null);
    setPhase('loading');
    try {
      const signedInSession = await signInWithGitHub();
      if (!signedInSession) {
        setPhase('idle');
        return;
      }
      setPhase('success');
      await new Promise((resolve) => setTimeout(resolve, 800));
      router.replace('/(app)/(tabs)');
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
    return <Redirect href="/(app)/(tabs)" />;
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
          variant="charcoal"
          disabled={busy || !configured}
          onPress={onGitHub}
          className="h-14 w-full"
          size="pill"
        >
          <View
            className="items-center justify-center"
            style={{ width: BUTTON_ICON_SLOT, height: BUTTON_ICON_SLOT }}
          >
            {busy ? (
              <ButtonSpinner color="white" size={BUTTON_ICON_SLOT} />
            ) : (
              <GithubIcon size={BUTTON_ICON_SLOT} color="white" />
            )}
          </View>
          <Text className="text-base font-semibold text-white">
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
