import { useAppColorScheme } from '@/context/theme';
import { themes } from 'react-native-remark';

type RemarkThemeOptions = {
  /** Keep markdown preview on the dark terminal palette even when the app is in light mode. */
  forceDark?: boolean;
};

export function useRemarkTheme(options?: RemarkThemeOptions) {
  const colorScheme = useAppColorScheme();
  const useDark =
    options?.forceDark === true || colorScheme.colorScheme === 'dark';
  return useDark ? themes.defaultTheme : themes.githubTheme;
}
