import { useUnstableNativeVariable } from 'nativewind';

export function useThemeColor(
  variable:
    | '--color-foreground'
    | '--color-primary-foreground' = '--color-foreground'
): string | undefined {
  return useUnstableNativeVariable(variable);
}
