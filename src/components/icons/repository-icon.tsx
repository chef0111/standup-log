import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/utils';
import type { LucideProps } from 'lucide-react-native';
import { BookMarked } from 'lucide-react-native';

type RepositoryIconProps = Pick<LucideProps, 'size' | 'color' | 'className'>;

/** Repo / library glyph — Lucide for correct optical centering (Octicon repo-16 is viewBox-offset). */
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
