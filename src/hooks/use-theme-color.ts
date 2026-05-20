import { useUnstableNativeVariable } from 'nativewind';

export type ThemeColorVariable =
  | '--color-foreground'
  | '--color-primary-foreground'
  | '--color-popover'
  | '--color-card'
  | '--color-primary'
  | '--color-muted-foreground'
  | '--color-border';

export function useThemeColor(
  variable: ThemeColorVariable = '--color-foreground'
): string | undefined {
  return useUnstableNativeVariable(variable);
}
