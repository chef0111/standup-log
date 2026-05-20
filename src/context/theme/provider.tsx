import {
  loadThemePreference,
  saveThemePreference,
} from '@/lib/theme-preference';
import * as React from 'react';
import {
  Appearance,
  Platform,
  useColorScheme as useRNColorScheme,
} from 'react-native';
import { ThemeContext, type AppColorScheme } from './context';

function toAppScheme(value: string | null | undefined): AppColorScheme {
  return value === 'dark' ? 'dark' : 'light';
}

function applyNativeAppearance(scheme: AppColorScheme) {
  if (Platform.OS === 'web') {
    return;
  }
  if (typeof Appearance.setColorScheme === 'function') {
    Appearance.setColorScheme(scheme);
  }
}

function applyWebDocumentClass(scheme: AppColorScheme) {
  if (Platform.OS !== 'web' || typeof document === 'undefined') {
    return;
  }
  document.documentElement.classList.toggle('dark', scheme === 'dark');
}

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useRNColorScheme();
  const [colorScheme, setColorSchemeState] = React.useState<AppColorScheme>(
    () => toAppScheme(systemScheme)
  );

  const setColorScheme = React.useCallback((scheme: AppColorScheme) => {
    setColorSchemeState(scheme);
    applyNativeAppearance(scheme);
    applyWebDocumentClass(scheme);
    void saveThemePreference(scheme);
  }, []);

  React.useEffect(() => {
    applyWebDocumentClass(colorScheme);
  }, [colorScheme]);

  React.useEffect(() => {
    void loadThemePreference().then((saved) => {
      if (saved) {
        setColorScheme(saved);
      }
    });
  }, [setColorScheme]);

  const value = React.useMemo(
    () => ({ colorScheme, setColorScheme }),
    [colorScheme, setColorScheme]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}
