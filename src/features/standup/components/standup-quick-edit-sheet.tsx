import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Text } from '@/components/ui/text';
import { Textarea } from '@/components/ui/textarea';
import { extractStandupSummary } from '@/features/standup/lib/parse-standup-markdown';
import { saveStandupUpdate } from '@/features/standup/lib/standup-api';
import type { Workday } from '@/features/workday/types/workday';
import type { SupabaseClient } from '@supabase/supabase-js';
import * as React from 'react';
import { Pressable, View } from 'react-native';

type EditMode = 'summary' | 'full';

function mergeSummaryIntoMarkdown(
  markdown: string,
  summary: string
): string {
  const match = markdown.match(/^##\s*Summary\s*$/im);
  if (!match || match.index === undefined) {
    return markdown;
  }
  const start = match.index + match[0].length;
  const rest = markdown.slice(start);
  const nextHeading = rest.search(/^##\s+/m);
  const tail = nextHeading === -1 ? '' : rest.slice(nextHeading);
  const heading = markdown.slice(0, match.index + match[0].length);
  return `${heading}\n${summary.trim()}\n${tail.startsWith('\n') ? tail : `\n${tail}`}`;
}

type StandupQuickEditSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workday: Workday;
  markdown: string;
  supabase: SupabaseClient;
  userId: string;
  onSaved: (markdown: string) => void;
};

export function StandupQuickEditSheet({
  open,
  onOpenChange,
  workday,
  markdown,
  supabase,
  userId,
  onSaved,
}: StandupQuickEditSheetProps) {
  const [mode, setMode] = React.useState<EditMode>('summary');
  const [draft, setDraft] = React.useState('');
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!open) {
      return;
    }
    setDraft(
      mode === 'full' ? markdown : extractStandupSummary(markdown).trim()
    );
    setError(null);
  }, [markdown, mode, open]);

  const onSave = async () => {
    setSaving(true);
    setError(null);
    const nextMarkdown =
      mode === 'full' ? draft : mergeSummaryIntoMarkdown(markdown, draft);
    const { error: saveError } = await saveStandupUpdate(
      supabase,
      userId,
      workday,
      nextMarkdown
    );
    setSaving(false);
    if (saveError) {
      setError(saveError);
      return;
    }
    onSaved(nextMarkdown);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle>Quick edit</DialogTitle>
        <DialogDescription selectable>
          Update the Summary or full markdown, then save.
        </DialogDescription>
      </DialogHeader>

      <View className="flex-row gap-2 pb-3">
        {(['summary', 'full'] as const).map((option) => {
          const selected = mode === option;
          return (
            <Pressable
              key={option}
              onPress={() => setMode(option)}
              className={
                selected
                  ? 'bg-primary rounded-md px-3 py-1.5'
                  : 'border-border bg-muted/40 rounded-md border px-3 py-1.5'
              }
            >
              <Text
                className={
                  selected
                    ? 'text-primary-foreground text-sm font-medium capitalize'
                    : 'text-foreground text-sm capitalize'
                }
              >
                {option}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Textarea
        value={draft}
        onChangeText={setDraft}
        className={mode === 'full' ? 'min-h-48 font-mono text-sm' : 'min-h-24'}
        multiline
      />

      {error ? (
        <Text selectable className="text-destructive pt-2 text-sm">
          {error}
        </Text>
      ) : null}

      <DialogFooter className="pt-4">
        <Button variant="outline" onPress={() => onOpenChange(false)}>
          <Text>Cancel</Text>
        </Button>
        <Button disabled={saving} onPress={() => void onSave()}>
          <Text>{saving ? 'Saving…' : 'Save'}</Text>
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
