import { Card } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { useTabBarScrollPadding } from '@/features/shell/hooks/use-tab-bar-scroll-padding';
import { Stack } from 'expo-router';
import * as React from 'react';
import { ScrollView } from 'react-native';

function PrivacyBlock({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card variant="elevated" className="gap-2 p-5">
      <Text className="text-foreground text-base font-semibold">{title}</Text>
      {children}
    </Card>
  );
}

export default function PrivacyScreen() {
  const tabBarPadding = useTabBarScrollPadding();

  return (
    <>
      <Stack.Screen options={{ title: 'Privacy' }} />
      <ScrollView
        className="bg-background flex-1 will-change-auto"
        contentContainerClassName="mx-auto w-full max-w-lg gap-5 px-5 pt-2"
        contentContainerStyle={{ paddingBottom: tabBarPadding }}
      >
        <PrivacyBlock title="What we store">
          <Text
            selectable
            className="text-muted-foreground text-sm leading-relaxed"
          >
            GitHub activity metadata (commit messages, timestamps, PR titles),
            your standup drafts, manual notes, and settings such as selected
            repositories and reminder time. We do not store source code or
            diffs.
          </Text>
        </PrivacyBlock>
        <PrivacyBlock title="Voice notes">
          <Text
            selectable
            className="text-muted-foreground text-sm leading-relaxed"
          >
            Voice capture uses on-device speech recognition. Audio is not
            uploaded for transcription.
          </Text>
        </PrivacyBlock>
        <PrivacyBlock title="Analytics">
          <Text
            selectable
            className="text-muted-foreground text-sm leading-relaxed"
          >
            Optional product analytics (PostHog) may record funnel events when
            configured. We never send commit bodies or standup text in analytics
            payloads. See docs/analytics-privacy.md in the repo.
          </Text>
        </PrivacyBlock>
        <PrivacyBlock title="Full policy">
          <Text
            selectable
            className="text-muted-foreground text-sm leading-relaxed"
          >
            Host a public privacy policy URL and link it here before store
            submission.
          </Text>
        </PrivacyBlock>
      </ScrollView>
    </>
  );
}
