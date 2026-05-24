import { Text, TextClassContext } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { Platform, View, type ViewProps } from 'react-native';

const cardVariants = cva('rounded-lg', {
  variants: {
    variant: {
      default: cn(
        'border-border bg-card border',
        Platform.select({ web: 'shadow-sm shadow-black/5' })
      ),
      sheet: 'bg-sheet border-0',
      inset: cn(
        'border-border/60 bg-muted/30 border',
        Platform.select({ web: 'shadow-none' })
      ),
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

type CardProps = ViewProps & VariantProps<typeof cardVariants>;

function Card({ className, variant, ...props }: CardProps) {
  return (
    <View className={cn(cardVariants({ variant }), className)} {...props} />
  );
}

function CardHeader({ className, ...props }: ViewProps) {
  return <View className={cn('gap-1.5 p-6', className)} {...props} />;
}

function CardTitle({
  className,
  ...props
}: React.ComponentProps<typeof Text> & { className?: string }) {
  return (
    <Text
      className={cn(
        'text-card-foreground text-lg font-semibold leading-none',
        className
      )}
      {...props}
    />
  );
}

function CardDescription({
  className,
  ...props
}: React.ComponentProps<typeof Text> & { className?: string }) {
  return (
    <Text
      className={cn('text-muted-foreground text-sm', className)}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: ViewProps) {
  return (
    <TextClassContext.Provider value="text-card-foreground">
      <View className={cn('p-6 pt-0', className)} {...props} />
    </TextClassContext.Provider>
  );
}

function CardFooter({ className, ...props }: ViewProps) {
  return (
    <View
      className={cn('flex-row items-center p-6 pt-0', className)}
      {...props}
    />
  );
}

export {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  cardVariants,
};
