import { cn } from '@/lib/utils';
import * as PopoverPrimitive from '@rn-primitives/popover';
import * as React from 'react';
import { Platform, StyleSheet } from 'react-native';

function Popover(props: React.ComponentProps<typeof PopoverPrimitive.Root>) {
  return <PopoverPrimitive.Root {...props} />;
}

const PopoverTrigger = React.forwardRef<
  React.ComponentRef<typeof PopoverPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Trigger>
>((props, ref) => {
  return <PopoverPrimitive.Trigger ref={ref} {...props} />;
});
PopoverTrigger.displayName = 'PopoverTrigger';

function PopoverContent({
  className,
  align = 'start',
  side = 'bottom',
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Content> & {
  className?: string;
}) {
  const content = (
    <PopoverPrimitive.Content
      align={align}
      side={side}
      sideOffset={sideOffset}
      className={cn(
        'bg-popover text-popover-foreground border-border z-50 rounded-md border p-4 outline-none',
        Platform.select({ web: 'shadow-md shadow-black/5' }),
        className
      )}
      {...props}
    />
  );

  if (Platform.OS === 'web') {
    // Radix PopoverPortal uses asChild and requires a single child.
    return <PopoverPrimitive.Portal>{content}</PopoverPrimitive.Portal>;
  }

  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Overlay
        closeOnPress
        style={StyleSheet.absoluteFill}
        className="absolute inset-0"
      />
      {content}
    </PopoverPrimitive.Portal>
  );
}

export { Popover, PopoverContent, PopoverTrigger };
