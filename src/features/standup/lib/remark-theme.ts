import { useAppColorScheme } from '@/context/theme';
import { themes } from 'react-native-remark';

export function useRemarkTheme() {
  const colorScheme = useAppColorScheme();
  return colorScheme.colorScheme === 'dark'
    ? themes.defaultTheme
    : themes.githubTheme;
}
