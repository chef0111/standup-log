import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { StandupActivitySection } from '@/features/standup/components/standup-activity-section';
import { StandupNotesSection } from '@/features/standup/components/standup-notes-section';
import { isStandupMarkdownEmpty } from '@/features/standup/lib/compose-standup-markdown';
import { ChevronDown } from 'lucide-react-native';
import * as React from 'react';
import { Pressable, View } from 'react-native';
import { useStandup } from '../context/standup';

export function StandupSourcesSection() {
  const { workday, commits, notes, draftMarkdown, savedMarkdown, loading } =
    useStandup();

  const baseline = draftMarkdown ?? savedMarkdown ?? '';
  const emptyDraft = isStandupMarkdownEmpty(baseline);
  const [open, setOpen] = React.useState(emptyDraft);

  React.useEffect(() => {
    setOpen(emptyDraft);
  }, [workday, emptyDraft]);

  const sourceCount = commits.length + notes.length;

  return (
    <Card variant="elevated" className="gap-3 p-5">
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        onPress={() => setOpen((value) => !value)}
        className="min-h-11 flex-row items-center justify-between gap-2"
      >
        <View className="gap-0.5">
          <Text className="text-foreground text-base font-semibold">
            Sources
          </Text>
          <Text className="text-muted-foreground text-xs">
            Activity and notes for this Workday
            {sourceCount > 0 ? ` · ${sourceCount}` : ''}
          </Text>
        </View>
        <View style={{ transform: [{ rotate: open ? '180deg' : '0deg' }] }}>
          <Icon as={ChevronDown} size={18} className="text-muted-foreground" />
        </View>
      </Pressable>

      {open ? (
        <View className="gap-4">
          <StandupActivitySection />
          <StandupNotesSection embedded />
        </View>
      ) : null}

      {loading && !open ? (
        <Text className="text-muted-foreground text-xs">Loading sources…</Text>
      ) : null}
    </Card>
  );
}
