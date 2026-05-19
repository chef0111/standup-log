import '@/global.css';

import { AuthProvider } from '@/context/auth-provider';
import { NAV_THEME } from '@/lib/theme';
import { loadThemePreference } from '@/lib/theme-preference';
import { cn } from '@/lib/utils';
import { ThemeProvider } from '@react-navigation/native';
import { PortalHost } from '@rn-primitives/portal';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'nativewind';
import * as React from 'react';
import { View } from 'react-native';

export {
    // Catch any errors thrown by the Layout component.
    ErrorBoundary
} from 'expo-router';

export default function RootLayout() {
  const { colorScheme, setColorScheme } = useColorScheme();
  const scheme = colorScheme === 'dark' ? 'dark' : 'light';

  React.useEffect(() => {
    void loadThemePreference().then((saved) => {
      if (saved) {
        setColorScheme(saved);
      }
    });
  }, [setColorScheme]);

  return (
    <View className={cn('flex-1', scheme === 'dark' && 'dark')}>
      <ThemeProvider value={NAV_THEME[scheme]}>
        <AuthProvider>
          <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
          <Stack screenOptions={{ headerShown: false }} />
          <PortalHost />
        </AuthProvider>
      </ThemeProvider>
    </View>
  );
}
