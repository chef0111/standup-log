import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import * as React from 'react';
import { View } from 'react-native';

type StandupSectionFieldProps = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
};

export function StandupSectionField({
  label,
  value,
  onChangeText,
  placeholder,
}: StandupSectionFieldProps) {
  return (
    <View className="gap-2">
      <Label>{label}</Label>
      <Textarea
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        className="min-h-[120px]"
      />
    </View>
  );
}
