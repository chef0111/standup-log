import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { MarketingHeader } from '@/features/shell/components/marketing-header';
import { userFacingMessage } from '@/lib/errors';
import { Link } from 'expo-router';
import { ScrollView } from 'react-native';

export default function SetupScreen() {
  return (
    <ScrollView
      className="bg-background flex-1"
      contentContainerClassName="mx-auto w-full max-w-lg gap-6 p-6 pb-12"
      keyboardShouldPersistTaps="handled"
    >
      <MarketingHeader
        eyebrow="Setup"
        title="Configuration required"
        description={userFacingMessage('config')}
      />

      <Card className="gap-3 p-4">
        <Text className="text-foreground text-sm font-medium">
          Add to `.env.local`
        </Text>
        <Text variant="code" className="text-muted-foreground text-sm">
          EXPO_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
        </Text>
        <Text variant="code" className="text-muted-foreground text-sm">
          EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
        </Text>
        <Text className="text-muted-foreground text-sm leading-relaxed">
          The legacy variable `EXPO_PUBLIC_SUPABASE_KEY` is still accepted if
          `EXPO_PUBLIC_SUPABASE_ANON_KEY` is unset. Restart Expo after changing
          env files.
        </Text>
      </Card>

      <Card className="p-4">
        <Text className="text-muted-foreground text-sm leading-relaxed">
          Never put the service role key in `EXPO_PUBLIC_*` variables — only the
          anon (publishable) key belongs in the app.
        </Text>
      </Card>

      <Link
        href="https://supabase.com/dashboard/project/_/settings/api"
        asChild
      >
        <Button variant="outline">
          <Text>Open Supabase API settings</Text>
        </Button>
      </Link>
    </ScrollView>
  );
}
