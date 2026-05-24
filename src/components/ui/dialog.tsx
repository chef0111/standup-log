import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import * as React from 'react';
import {
  Modal,
  Platform,
  Pressable,
  View,
  type ModalProps,
} from 'react-native';

type DialogProps = ModalProps & {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
};

function Dialog({ open, onOpenChange, children, ...props }: DialogProps) {
  return (
    <Modal
      visible={open}
      transparent
      animationType="fade"
      onRequestClose={() => onOpenChange(false)}
      {...props}
    >
      <Pressable
        className="flex-1 items-center justify-center bg-black/50 p-4"
        onPress={() => onOpenChange(false)}
      >
        <Pressable
          className={cn(
            'bg-background border-border w-full max-w-md rounded-xl border p-4',
            Platform.select({ web: 'shadow-lg' })
          )}
          onPress={(e) => e.stopPropagation()}
        >
          {children}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function DialogHeader({
  className,
  ...props
}: React.ComponentProps<typeof View>) {
  return <View className={cn('gap-1.5 pb-4', className)} {...props} />;
}

function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof Text>) {
  return (
    <Text
      variant="h3"
      className={cn('text-foreground border-0 pb-0 text-lg', className)}
      {...props}
    />
  );
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof Text>) {
  return (
    <Text
      className={cn('text-muted-foreground text-sm leading-relaxed', className)}
      {...props}
    />
  );
}

function DialogFooter({
  className,
  ...props
}: React.ComponentProps<typeof View>) {
  return (
    <View
      className={cn('flex-row justify-end gap-2 pt-4', className)}
      {...props}
    />
  );
}

export { Dialog, DialogDescription, DialogFooter, DialogHeader, DialogTitle };
