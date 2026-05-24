import { Card } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import * as React from 'react';
import { View } from 'react-native';

type SettingsSectionProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
};

export function SettingsSection({
  title,
  description,
  children,
  className,
}: SettingsSectionProps) {
  return (
    <Card variant="elevated" className={cn('gap-3 p-5', className)}>
      <View className="gap-1">
        <Text className="text-foreground text-base font-semibold">{title}</Text>
        {description ? (
          <Text
            selectable
            className="text-muted-foreground text-sm leading-relaxed"
          >
            {description}
          </Text>
        ) : null}
      </View>
      {children}
    </Card>
  );
}
