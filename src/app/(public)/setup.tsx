import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { userFacingMessage } from '@/lib/errors';
import { Link } from 'expo-router';
import { ScrollView, View } from 'react-native';

export default function SetupScreen() {
  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="gap-4 p-6 pb-12"
      keyboardShouldPersistTaps="handled">
      <Text variant="h2" className="text-foreground">
        Configuration required
      </Text>
      <Text className="text-muted-foreground">{userFacingMessage('config')}</Text>
      <View className="gap-2 rounded-lg border border-border bg-muted/30 p-4">
        <Text className="font-medium text-foreground">Add to `.env.local`</Text>
        <Text variant="code" className="text-sm text-muted-foreground">
          EXPO_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
        </Text>
        <Text variant="code" className="text-sm text-muted-foreground">
          EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
        </Text>
        <Text className="text-sm text-muted-foreground">
          The legacy variable `EXPO_PUBLIC_SUPABASE_KEY` is still accepted if `EXPO_PUBLIC_SUPABASE_ANON_KEY` is unset.
          Restart Expo after changing env files.
        </Text>
      </View>
      <Text className="text-sm text-muted-foreground">
        Never put the service role key in `EXPO_PUBLIC_*` variables — only the anon (publishable) key belongs in the
        app.
      </Text>
      <Link href="https://supabase.com/dashboard/project/_/settings/api" asChild>
        <Button variant="outline">
          <Text>Open Supabase API settings</Text>
        </Button>
      </Link>
    </ScrollView>
  );
}
