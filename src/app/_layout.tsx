import { AuthProvider } from '@/context/auth';
import { AppThemeProvider, useAppColorScheme } from '@/context/theme';
import '@/global.css';
import { NAV_THEME } from '@/lib/theme';
import { cn } from '@/lib/utils';
import { QueryProvider } from '@/queries/query-provider';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_900Black,
  useFonts,
} from '@expo-google-fonts/inter';
import { ThemeProvider } from '@react-navigation/native';
import { PortalHost } from '@rn-primitives/portal';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export { ErrorBoundary } from 'expo-router';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter: Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
    'Inter-Black': Inter_900Black,
  });

  if (!fontsLoaded) {
    return (
      <View className="bg-background flex-1 items-center justify-center">
        <ActivityIndicator />
      </View>
    );
  }

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
    <GestureHandlerRootView className="flex-1">
      <View
        className={cn(
          'bg-background flex-1 will-change-auto',
          scheme === 'dark' && 'dark'
        )}
      >
        <ThemeProvider value={NAV_THEME[scheme]}>
          <AuthProvider>
            <QueryProvider>
              <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
              <Stack screenOptions={{ headerShown: false }} />
              <PortalHost />
            </QueryProvider>
          </AuthProvider>
        </ThemeProvider>
      </View>
    </GestureHandlerRootView>
  );
}
