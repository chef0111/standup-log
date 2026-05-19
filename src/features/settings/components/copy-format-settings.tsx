import { Card } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { useAuth } from '@/features/auth';
import { fetchUserProfile } from '@/features/profile';
import { updateDefaultCopyFormat } from '@/features/profile/lib/update-default-copy-format';
import { StandupCopyFormatPicker } from '@/features/standup/components/standup-copy-format-picker';
import {
  isCopyFormat,
  type CopyFormat,
} from '@/features/standup/lib/format-standup';
import * as React from 'react';
import { ActivityIndicator, View } from 'react-native';

export function CopyFormatSettings() {
  const { supabase, session } = useAuth();
  const [format, setFormat] = React.useState<CopyFormat>('plain');
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [status, setStatus] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!supabase || !session) {
      setLoading(false);
      return;
    }

    void fetchUserProfile(supabase, session).then(({ profile }) => {
      if (profile?.default_copy_format && isCopyFormat(profile.default_copy_format)) {
        setFormat(profile.default_copy_format);
      }
      setLoading(false);
    });
  }, [session, supabase]);

  const onChange = React.useCallback(
    async (next: CopyFormat) => {
      setFormat(next);
      if (!supabase || !session) {
        return;
      }
      setSaving(true);
      setStatus(null);
      const { error } = await updateDefaultCopyFormat(
        supabase,
        session.user.id,
        next
      );
      setSaving(false);
      if (error) {
        setStatus(error);
        return;
      }
      setStatus('Default copy format saved.');
    },
    [session, supabase]
  );

  return (
    <Card className="gap-3 p-4">
      <View className="gap-1">
        <Text className="text-foreground text-sm font-medium">
          Default copy format
        </Text>
        <Text className="text-muted-foreground text-sm leading-relaxed">
          Used when you open Generate standup. You can still pick another format
          before copying.
        </Text>
      </View>
      {loading ? (
        <ActivityIndicator />
      ) : (
        <StandupCopyFormatPicker value={format} onChange={(next) => void onChange(next)} />
      )}
      {saving ? (
        <Text className="text-muted-foreground text-xs">Saving…</Text>
      ) : null}
      {status ? (
        <Text className="text-muted-foreground text-center text-xs">{status}</Text>
      ) : null}
    </Card>
  );
}
