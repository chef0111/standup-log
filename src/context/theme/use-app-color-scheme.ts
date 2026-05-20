import * as React from 'react';
import { ThemeContext, type ThemeContextValue } from './context';

export function useAppColorScheme(): ThemeContextValue {
  const value = React.useContext(ThemeContext);
  if (!value) {
    throw new Error('useAppColorScheme must be used within AppThemeProvider');
  }
  return value;
}
