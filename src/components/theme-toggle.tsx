import { Icon } from '@/components/ui/icon';
import { saveThemePreference, type ThemePreference } from '@/lib/theme-preference';
import { cn } from '@/lib/utils';
import { Moon, Sun } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import * as React from 'react';
import { Pressable } from 'react-native';

type ThemeToggleProps = {
  className?: string;
};

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { colorScheme, setColorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const onToggle = React.useCallback(() => {
    const next: ThemePreference = isDark ? 'light' : 'dark';
    setColorScheme(next);
    void saveThemePreference(next);
  }, [isDark, setColorScheme]);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      onPress={onToggle}
      className={cn(
        'size-10 items-center justify-center rounded-full border border-border bg-muted/40 active:bg-accent',
        className
      )}>
      <Icon as={isDark ? Sun : Moon} size={20} className="text-foreground" />
    </Pressable>
  );
}
