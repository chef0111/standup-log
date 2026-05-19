/**
 * Resolved theme colors for props that cannot use className (e.g. SVG `color`).
 * Keep in sync with :root / .dark in src/global.css.
 */
export const THEME_COLORS = {
  light: {
    foreground: 'hsl(0 0% 0%)',
    primaryForeground: 'hsl(0 0% 100%)',
  },
  dark: {
    foreground: 'hsl(0 0% 100%)',
    primaryForeground: 'hsl(0 0% 0%)',
  },
} as const;

export type ThemeColorToken = keyof (typeof THEME_COLORS)['light'];

export function themeColorTokenFromVariable(variable: string): ThemeColorToken {
  return variable === '--color-primary-foreground'
    ? 'primaryForeground'
    : 'foreground';
}
