import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/utils';
import type { LucideProps } from 'lucide-react-native';
import { BookMarked } from 'lucide-react-native';
import * as React from 'react';

type RepositoryIconProps = Pick<LucideProps, 'size' | 'color' | 'className'>;

export function RepositoryIcon({
  size = 28,
  color,
  className,
}: RepositoryIconProps) {
  return (
    <Icon
      as={BookMarked}
      size={size}
      color={color}
      className={cn('text-foreground', className)}
    />
  );
}
