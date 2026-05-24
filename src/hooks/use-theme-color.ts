import { useAppColorScheme } from '@/context/theme';
import { resolveThemeColor, type ThemeColorVariable } from '@/lib/theme-colors';

export type { ThemeColorVariable } from '@/lib/theme-colors';

/** Hex colors safe for SVG, ActivityIndicator, and Reanimated (not oklch CSS variables). */
export function useThemeColor(
  variable: ThemeColorVariable = '--color-foreground'
): string {
  const { colorScheme } = useAppColorScheme();
  const scheme = colorScheme === 'dark' ? 'dark' : 'light';
  return resolveThemeColor(scheme, variable);
}
