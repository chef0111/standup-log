import { useAppColorScheme } from '@/context/theme-provider';
import {
  THEME_COLORS,
  themeColorTokenFromVariable,
} from '@/features/theme/lib/theme-colors';

export function useThemeColor(
  variable:
    | '--color-foreground'
    | '--color-primary-foreground' = '--color-foreground'
): string {
  const { colorScheme } = useAppColorScheme();
  const scheme = colorScheme === 'dark' ? 'dark' : 'light';
  const token = themeColorTokenFromVariable(variable);
  return THEME_COLORS[scheme][token];
}
