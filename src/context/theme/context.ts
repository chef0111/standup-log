import type { ThemePreference } from '@/lib/theme-preference';
import * as React from 'react';

export type AppColorScheme = ThemePreference;

export type ThemeContextValue = {
  colorScheme: AppColorScheme;
  setColorScheme: (scheme: AppColorScheme) => void;
};

export const ThemeContext = React.createContext<ThemeContextValue | null>(null);
