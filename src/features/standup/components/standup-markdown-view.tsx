import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import {
  isStandupSummaryReady,
  STANDUP_SUMMARY_PLACEHOLDER,
} from '@/features/standup/lib/compose-standup-markdown';
import { parseStandupMarkdown } from '@/features/standup/lib/parse-standup-markdown';
import { useRemarkTheme } from '@/features/standup/lib/remark-theme';
import * as React from 'react';
import { View } from 'react-native';
import { Markdown } from 'react-native-remark';

type SectionCardProps = {
  title: string;
  body: string;
  theme: ReturnType<typeof useRemarkTheme>;
};

const SectionCard = React.memo(function SectionCard({
  title,
  body,
  theme,
}: SectionCardProps) {
  if (!body.trim() || body.trim() === '-') {
    return null;
  }

  const sectionMarkdown = `## ${title}\n\n${body}`;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Markdown markdown={sectionMarkdown} theme={theme} />
      </CardContent>
    </Card>
  );
});

const SECTIONS: {
  key: keyof ReturnType<typeof parseStandupMarkdown>;
  title: string;
}[] = [
  { key: 'whatIDid', title: 'What I did' },
  { key: 'focusingOn', title: 'Focusing on' },
  { key: 'blockers', title: 'Blockers' },
  { key: 'metrics', title: 'Metrics / Notes' },
];

type StandupMarkdownViewProps = {
  markdown: string;
};

export function StandupMarkdownView({ markdown }: StandupMarkdownViewProps) {
  const theme = useRemarkTheme();
  const parsed = React.useMemo(
    () => parseStandupMarkdown(markdown),
    [markdown]
  );

  const summaryReady = isStandupSummaryReady(markdown);
  const summaryText = parsed.summary.trim();

  return (
    <View className="flex flex-col gap-4">
      <Card className="border-primary/20 bg-card">
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent>
          {summaryReady ? (
            <Text selectable className="text-lg leading-relaxed">
              {summaryText}
            </Text>
          ) : (
            <Text selectable className="text-muted-foreground text-sm italic">
              {STANDUP_SUMMARY_PLACEHOLDER}
            </Text>
          )}
        </CardContent>
      </Card>

      {SECTIONS.map(({ key, title }) => (
        <SectionCard
          key={key}
          title={title}
          body={parsed[key]}
          theme={theme}
        />
      ))}
    </View>
  );
}
