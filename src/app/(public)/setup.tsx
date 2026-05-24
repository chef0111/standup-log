import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import {
  AppScreenShell,
  ScreenHeader,
} from '@/features/shell/components/app-screen-shell';
import { userFacingMessage } from '@/lib/errors';
import { Link } from 'expo-router';
import * as React from 'react';

export default function SetupScreen() {
  return (
    <AppScreenShell
      header={
        <ScreenHeader
          eyebrow="Setup"
          title="Configuration required"
          subtitle={userFacingMessage('config')}
        />
      }
      contentClassName="pb-12"
    >
      <Card variant="elevated" className="gap-3 p-5">
        <Text className="text-foreground text-base font-semibold">
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

      <Card variant="elevated" className="p-5">
        <Text className="text-muted-foreground text-sm leading-relaxed">
          Never put the service role key in `EXPO_PUBLIC_*` variables — only the
          anon (publishable) key belongs in the app.
        </Text>
      </Card>

      <Link
        href="https://supabase.com/dashboard/project/_/settings/api"
        asChild
      >
        <Button size="pill" variant="charcoal">
          <Text>Open Supabase API settings</Text>
        </Button>
      </Link>
    </AppScreenShell>
  );
}
