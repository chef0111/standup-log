import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import {
  AppScreenShell,
  ScreenHero,
} from '@/features/shell/components/app-screen-shell';
import { BrandLockup } from '@/features/shell/components/brand-lockup';
import { userFacingMessage } from '@/lib/errors';
import { Link } from 'expo-router';
import * as React from 'react';
import { View } from 'react-native';

export default function SetupScreen() {
  return (
    <AppScreenShell
      scroll
      hero={
        <ScreenHero compact={false}>
          <View className="gap-6">
            <BrandLockup />
            <View className="gap-1">
              <Text className="text-xs font-medium uppercase tracking-widest text-white/70">
                Setup
              </Text>
              <Text className="font-black text-2xl uppercase leading-tight tracking-wide text-hero-foreground">
                Configuration required
              </Text>
              <Text className="text-sm leading-relaxed text-white/70">
                {userFacingMessage('config')}
              </Text>
            </View>
          </View>
        </ScreenHero>
      }
      contentClassName="pb-12"
    >
      <Card variant="inset" className="gap-3 p-4">
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

      <Card variant="inset" className="p-4">
        <Text className="text-muted-foreground text-sm leading-relaxed">
          Never put the service role key in `EXPO_PUBLIC_*` variables — only the
          anon (publishable) key belongs in the app.
        </Text>
      </Card>

      <Link
        href="https://supabase.com/dashboard/project/_/settings/api"
        asChild
      >
        <Button size="pill" variant="outline">
          <Text>Open Supabase API settings</Text>
        </Button>
      </Link>
    </AppScreenShell>
  );
}
