import { Text, TextClassContext } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { View, type ViewProps } from 'react-native';

const cardVariants = cva('rounded-3xl', {
  variants: {
    variant: {
      default: cn('border-border bg-card border shadow-sm shadow-black/5'),
      elevated: cn('bg-card border-0'),
      sheet: 'bg-sheet border-0',
      inset: cn('bg-muted/40 border-0'),
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

const elevatedShadowStyle = {
  boxShadow: 'var(--shadow-elevated)',
  borderCurve: 'continuous' as const,
};

type CardProps = ViewProps & VariantProps<typeof cardVariants>;

function Card({ className, variant, style, ...props }: CardProps) {
  return (
    <View
      className={cn(cardVariants({ variant }), className)}
      style={[variant === 'elevated' ? elevatedShadowStyle : undefined, style]}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: ViewProps) {
  return <View className={cn('gap-1.5 p-5', className)} {...props} />;
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
      <View className={cn('p-5 pt-0', className)} {...props} />
    </TextClassContext.Provider>
  );
}

function CardFooter({ className, ...props }: ViewProps) {
  return (
    <View
      className={cn('flex-row items-center p-5 pt-0', className)}
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
