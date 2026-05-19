import { Text } from '@/components/ui/text';
import { getOAuthRedirectUri } from '@/features/auth/lib/oauth';
import { View } from 'react-native';

/** Developer-only Supabase redirect URL reminder (hidden in production builds). */
export function OAuthDevHint() {
  if (!__DEV__) {
    return null;
  }

  return (
    <View className="border-border gap-2 rounded-md border border-dashed p-3">
      <Text className="text-muted-foreground text-[11px] font-medium uppercase tracking-wider">
        Dev — Supabase redirect URL
      </Text>
      <Text variant="code" className="text-muted-foreground text-[11px]">
        {getOAuthRedirectUri()}
      </Text>
    </View>
  );
}
