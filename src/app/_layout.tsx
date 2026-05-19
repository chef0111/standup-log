import { AuthProvider } from '@/context/auth-provider';
import { AppThemeProvider, useAppColorScheme } from '@/context/theme-provider';
import '@/global.css';
import { NAV_THEME } from '@/lib/theme';
import { cn } from '@/lib/utils';
import { ThemeProvider } from '@react-navigation/native';
import { PortalHost } from '@rn-primitives/portal';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as React from 'react';
import { View } from 'react-native';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export default function RootLayout() {
  return (
    <AppThemeProvider>
      <RootLayoutInner />
    </AppThemeProvider>
  );
}

function RootLayoutInner() {
  const { colorScheme } = useAppColorScheme();
  const scheme = colorScheme === 'dark' ? 'dark' : 'light';

  return (
    <View className={cn('bg-background flex-1', scheme === 'dark' && 'dark')}>
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
