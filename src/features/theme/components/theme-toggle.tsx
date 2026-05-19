import { Icon } from '@/components/ui/icon';
import { useAppColorScheme } from '@/context/theme-provider';
import { cn } from '@/lib/utils';
import { Moon, Sun } from 'lucide-react-native';
import * as React from 'react';
import { Pressable } from 'react-native';

type ThemeToggleProps = {
  className?: string;
};

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { colorScheme, setColorScheme } = useAppColorScheme();
  const isDark = colorScheme === 'dark';

  const onToggle = React.useCallback(() => {
    setColorScheme(isDark ? 'light' : 'dark');
  }, [isDark, setColorScheme]);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={
        isDark ? 'Switch to light mode' : 'Switch to dark mode'
      }
      onPress={onToggle}
      className={cn(
        'border-border bg-background active:bg-accent size-9 items-center justify-center rounded-md border',
        className
      )}
    >
      <Icon as={isDark ? Sun : Moon} size={18} className="text-foreground" />
    </Pressable>
  );
}
