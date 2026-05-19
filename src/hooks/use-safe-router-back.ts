import type { Href } from 'expo-router';
import { useNavigation, useRouter } from 'expo-router';
import * as React from 'react';

/** `router.back()` when possible; otherwise `router.replace(fallback)` (avoids GO_BACK errors on web). */
export function useSafeRouterBack(fallback: Href = '/(app)') {
  const router = useRouter();
  const navigation = useNavigation();

  return React.useCallback(() => {
    if (navigation.canGoBack()) {
      router.back();
    } else {
      router.replace(fallback);
    }
  }, [fallback, navigation, router]);
}
