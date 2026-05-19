import { cn } from '@/lib/utils';
import * as React from 'react';
import { Platform, TextInput, type TextInputProps } from 'react-native';

type TextareaProps = TextInputProps & {
  className?: string;
};

const Textarea = React.forwardRef<TextInput, TextareaProps>(
  (
    { className, multiline = true, textAlignVertical = 'top', ...props },
    ref
  ) => {
    return (
      <TextInput
        ref={ref}
        multiline={multiline}
        textAlignVertical={textAlignVertical}
        placeholderTextColor="var(--color-muted-foreground)"
        className={cn(
          'border-input bg-background/50 text-foreground min-h-22 w-full rounded-md border px-3 py-2 text-sm',
          Platform.select({
            web: 'focus-visible:border-ring focus-visible:ring-ring/50 outline-none focus-visible:ring-[3px]',
          }),
          props.editable === false && 'opacity-50',
          className
        )}
        {...props}
      />
    );
  }
);

Textarea.displayName = 'Textarea';

export { Textarea };
