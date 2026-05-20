import { Text } from '@/components/ui/text';
import { useTabBarScrollPadding } from '@/features/shell';
import { Stack } from 'expo-router';
import * as React from 'react';
import { ScrollView, View } from 'react-native';

export default function PrivacyScreen() {
  const tabBarPadding = useTabBarScrollPadding();

  return (
    <>
      <Stack.Screen options={{ title: 'Privacy' }} />
      <ScrollView
        className="bg-background flex-1"
        contentContainerClassName="mx-auto w-full max-w-lg gap-4 px-5 pt-2"
        contentContainerStyle={{ paddingBottom: tabBarPadding }}
      >
        <View className="gap-3">
          <Text className="text-foreground text-sm font-medium">
            What we store
          </Text>
          <Text selectable className="text-muted-foreground text-sm leading-relaxed">
            GitHub activity metadata (commit messages, timestamps, PR titles),
            your standup drafts, manual notes, and settings such as selected
            repositories and reminder time. We do not store source code or
            diffs.
          </Text>
        </View>
        <View className="gap-3">
          <Text className="text-foreground text-sm font-medium">
            Voice notes
          </Text>
          <Text selectable className="text-muted-foreground text-sm leading-relaxed">
            Voice capture uses on-device speech recognition. Audio is not
            uploaded for transcription.
          </Text>
        </View>
        <View className="gap-3">
          <Text className="text-foreground text-sm font-medium">
            Analytics
          </Text>
          <Text selectable className="text-muted-foreground text-sm leading-relaxed">
            Optional product analytics (PostHog) may record funnel events when
            configured. We never send commit bodies or standup text in
            analytics payloads. See docs/analytics-privacy.md in the repo.
          </Text>
        </View>
        <View className="gap-3">
          <Text className="text-foreground text-sm font-medium">
            Full policy
          </Text>
          <Text selectable className="text-muted-foreground text-sm leading-relaxed">
            Host a public privacy policy URL and link it here before store
            submission.
          </Text>
        </View>
      </ScrollView>
    </>
  );
}
