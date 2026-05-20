import { useAuth } from '@/context/auth';
import { AuthStatusView } from '@/features/auth/components/auth-status';
import { createSessionFromUrl } from '@/features/auth/lib/oauth';
import * as Linking from 'expo-linking';
import { Redirect, useRouter } from 'expo-router';
import * as React from 'react';
import { Platform } from 'react-native';

function getCallbackUrl(): string {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return window.location.href;
  }
  return '';
}

type CallbackStatus = 'working' | 'success' | 'error';

export default function AuthCallbackScreen() {
  const router = useRouter();
  const { loading: authLoading } = useAuth();
  const [status, setStatus] = React.useState<CallbackStatus>('working');

  React.useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const url = getCallbackUrl() || (await Linking.getInitialURL()) || '';

        if (!url.includes('auth/callback')) {
          if (!cancelled) {
            setStatus('error');
          }
          return;
        }

        await createSessionFromUrl(url);

        if (Platform.OS === 'web' && typeof window !== 'undefined') {
          window.history.replaceState(null, '', '/auth/callback');
        }

        if (!cancelled) {
          setStatus('success');
        }

        await new Promise((resolve) => setTimeout(resolve, 1200));

        if (!cancelled) {
          router.replace('/');
        }
      } catch {
        if (!cancelled) {
          setStatus('error');
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router]);

  if (status === 'working' || authLoading) {
    return (
      <AuthStatusView variant="loading" loadingMessage="Completing sign-in…" />
    );
  }

  if (status === 'success') {
    return (
      <AuthStatusView
        variant="success"
        successTitle="Signed in successfully"
        successDetail="Taking you to StandupLog…"
      />
    );
  }

  return <Redirect href="/(public)/sign-in" />;
}
