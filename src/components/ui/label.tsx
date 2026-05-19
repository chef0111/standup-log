import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import * as React from 'react';

type LabelProps = React.ComponentProps<typeof Text> & {
  nativeID?: string;
};

function Label({ className, ...props }: LabelProps) {
  return (
    <Text
      className={cn(
        'text-foreground text-sm font-medium leading-none',
        className
      )}
      {...props}
    />
  );
}

export { Label };
