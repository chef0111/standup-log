/**
 * Resolved theme colors for props that cannot use className (SVG `color`, tab bar, Reanimated).
 * Reanimated does not parse `oklch()` — use hex here. Keep in sync with :root / .dark in src/global.css.
 */
export const THEME_COLORS = {
  light: {
    foreground: '#09090b',
    primaryForeground: '#fafafa',
    popover: '#ffffff',
    card: '#ffffff',
    primary: '#18181b',
    mutedForeground: '#71717a',
    border: '#e4e4e7',
    hero: '#000000',
    heroForeground: '#fafafa',
    sheet: '#ffffff',
    sheetForeground: '#09090b',
    success: '#22c55e',
  },
  dark: {
    foreground: '#fafafa',
    primaryForeground: '#18181b',
    popover: '#18181b',
    card: '#18181b',
    primary: '#e4e4e7',
    mutedForeground: '#a1a1aa',
    border: '#3f3f46',
    hero: '#09090b',
    heroForeground: '#fafafa',
    sheet: '#18181b',
    sheetForeground: '#fafafa',
    success: '#22c55e',
  },
} as const;

export type ThemeColorToken = keyof (typeof THEME_COLORS)['light'];

export type ThemeColorVariable =
  | '--color-foreground'
  | '--color-primary-foreground'
  | '--color-popover'
  | '--color-card'
  | '--color-primary'
  | '--color-muted-foreground'
  | '--color-border'
  | '--color-hero'
  | '--color-hero-foreground'
  | '--color-sheet'
  | '--color-sheet-foreground'
  | '--color-success';

const VARIABLE_TO_TOKEN: Record<ThemeColorVariable, ThemeColorToken> = {
  '--color-foreground': 'foreground',
  '--color-primary-foreground': 'primaryForeground',
  '--color-popover': 'popover',
  '--color-card': 'card',
  '--color-primary': 'primary',
  '--color-muted-foreground': 'mutedForeground',
  '--color-border': 'border',
  '--color-hero': 'hero',
  '--color-hero-foreground': 'heroForeground',
  '--color-sheet': 'sheet',
  '--color-sheet-foreground': 'sheetForeground',
  '--color-success': 'success',
};

export function themeColorTokenFromVariable(
  variable: ThemeColorVariable
): ThemeColorToken {
  return VARIABLE_TO_TOKEN[variable];
}

export function resolveThemeColor(
  scheme: 'light' | 'dark',
  variable: ThemeColorVariable
): string {
  return THEME_COLORS[scheme][themeColorTokenFromVariable(variable)];
}
