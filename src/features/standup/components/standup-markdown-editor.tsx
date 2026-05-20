import { Textarea } from '@/components/ui/textarea';
import { useRemarkTheme } from '@/features/standup/lib/remark-theme';
import * as React from 'react';
import { ScrollView, View } from 'react-native';
import { Markdown } from 'react-native-remark';

export type StandupEditorMode = 'edit' | 'preview';

type StandupMarkdownEditorProps = {
  mode: StandupEditorMode;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
};

export function StandupMarkdownEditor({
  mode,
  value,
  onChangeText,
  placeholder,
}: StandupMarkdownEditorProps) {
  const theme = useRemarkTheme();

  if (mode === 'edit') {
    return (
      <Textarea
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        className="min-h-99 font-mono text-sm leading-relaxed"
        autoCapitalize="sentences"
        autoCorrect
      />
    );
  }

  return (
    <ScrollView
      className="border-border bg-muted/20 max-h-99 rounded-md border p-3"
      nestedScrollEnabled
    >
      <View className="min-h-48">
        {value.trim().length > 0 ? (
          <Markdown markdown={value} theme={theme} />
        ) : (
          <View />
        )}
      </View>
    </ScrollView>
  );
}
