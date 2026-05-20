import { Textarea } from '@/components/ui/textarea';
import { useAppColorScheme } from '@/features/theme';
import * as React from 'react';
import { ScrollView, View } from 'react-native';
import { Markdown, themes } from 'react-native-remark';

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
  const colorScheme = useAppColorScheme();
  const theme =
    colorScheme === 'dark' ? themes.defaultTheme : themes.githubTheme;

  if (mode === 'edit') {
    return (
      <Textarea
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        className="font-mono min-h-60 text-sm leading-relaxed"
        autoCapitalize="sentences"
        autoCorrect
      />
    );
  }

  return (
    <ScrollView
      className="border-border bg-muted/20 max-h-96 rounded-md border p-3"
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
