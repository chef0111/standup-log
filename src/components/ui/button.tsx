import { TextClassContext } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { Platform, Pressable } from 'react-native';

const buttonVariants = cva(
  cn(
    'group shrink-0 flex-row items-center justify-center gap-2 rounded-md',
    Platform.select({
      web: 'shadow-none transition-all',
    }),
    Platform.select({
      web: "focus-visible:border-ring active:scale-97 focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive whitespace-nowrap outline-none focus-visible:ring-[3px] disabled:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
    })
  ),
  {
    variants: {
      variant: {
        default: cn(
          'bg-primary',
          Platform.select({
            web: 'active:bg-primary/90 active:scale-97 shadow-sm shadow-black/5 hover:bg-primary/90 transition-colors',
          })
        ),
        charcoal: cn(
          'bg-zinc-900 dark:bg-zinc-100',
          Platform.select({
            web: 'active:opacity-90 transition-opacity',
          })
        ),
        destructive: cn(
          'bg-destructive dark:bg-destructive/60',
          Platform.select({
            web: 'active:bg-destructive/90 shadow-sm shadow-black/5 hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40',
          })
        ),
        outline: cn(
          'border-border bg-card dark:bg-input/30 dark:bg-background border',
          Platform.select({
            web: 'active:bg-accent dark:active:bg-muted shadow-sm shadow-black/5 hover:bg-muted dark:hover:bg-muted dark:hover:bg-input/50 transition-colors',
          })
        ),
        secondary: cn(
          'bg-secondary',
          Platform.select({
            web: 'active:bg-secondary/80 shadow-sm shadow-black/5 hover:bg-secondary/80',
          })
        ),
        ghost: cn(
          Platform.select({
            web: 'active:bg-accent dark:active:bg-accent/50 hover:bg-accent dark:hover:bg-accent/50',
          })
        ),
        link: '',
      },
      size: {
        default: cn(
          'h-10 px-4 py-2 sm:h-9',
          Platform.select({ web: 'has-[>svg]:px-3' })
        ),
        sm: cn(
          'h-9 gap-1.5 rounded-md px-3 sm:h-8',
          Platform.select({ web: 'has-[>svg]:px-2.5' })
        ),
        lg: cn(
          'h-11 rounded-md px-6 sm:h-10',
          Platform.select({ web: 'has-[>svg]:px-4' })
        ),
        icon: 'h-10 w-10 sm:h-9 sm:w-9',
        pill: 'h-12 rounded-full px-6',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

const buttonTextVariants = cva(
  cn(
    'text-foreground text-sm font-medium',
    Platform.select({ web: 'pointer-events-none transition-colors' })
  ),
  {
    variants: {
      variant: {
        default: 'text-primary-foreground',
        charcoal: 'text-white dark:text-zinc-900',
        destructive: 'text-white',
        outline: cn(
          'group-active:text-accent-foreground',
          Platform.select({ web: 'group-hover:text-accent-foreground' })
        ),
        secondary: 'text-secondary-foreground',
        ghost: cn(
          Platform.select({ web: 'group-active:text-accent-foreground' })
        ),
        link: cn(
          'text-primary',
          Platform.select({
            web: 'group-active:underline underline-offset-4 hover:underline group-hover:underline',
          })
        ),
      },
      size: {
        default: '',
        sm: '',
        lg: '',
        icon: '',
        pill: 'text-base font-semibold',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

type ButtonProps = React.ComponentProps<typeof Pressable> &
  React.RefAttributes<typeof Pressable> &
  VariantProps<typeof buttonVariants>;

function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <TextClassContext.Provider value={buttonTextVariants({ variant, size })}>
      <Pressable
        className={cn(
          props.disabled && 'opacity-50',
          buttonVariants({ variant, size }),
          className
        )}
        role="button"
        {...props}
      />
    </TextClassContext.Provider>
  );
}

export { Button, buttonTextVariants, buttonVariants };
export type { ButtonProps };
