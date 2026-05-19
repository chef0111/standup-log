import { TextClassContext } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import type { LucideIcon, LucideProps } from 'lucide-react-native';
import { useCssElement } from 'nativewind';
import * as React from 'react';

type IconProps = LucideProps & {
  as: LucideIcon;
} & React.RefAttributes<LucideIcon>;

/**
 * A wrapper component for Lucide icons with `className` support via `react-native-css` / NativeWind.
 *
 * @example
 * ```tsx
 * import { ArrowRight } from 'lucide-react-native';
 * <Icon as={ArrowRight} className="text-red-500" size={16} />
 * ```
 */
export function Icon({ as: IconComponent, className, size = 14, ...props }: IconProps) {
  const textClass = React.useContext(TextClassContext);
  return useCssElement(
    IconComponent,
    {
      ...props,
      size,
      className: cn('text-foreground', textClass, className),
    },
    { className: 'style' }
  );
}
