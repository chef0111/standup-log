import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { SettingsSection } from '@/features/settings/components/settings-section';
import { View } from 'react-native';

type AccountActionsSectionProps = {
  busy: boolean;
  onDisconnectGitHub: () => void;
  onSignOut: () => void;
  onDeleteAccount: () => void;
};

export function AccountActionsSection({
  busy,
  onDisconnectGitHub,
  onSignOut,
  onDeleteAccount,
}: AccountActionsSectionProps) {
  return (
    <SettingsSection title="Account">
      <View className="gap-2">
        <Button variant="outline" disabled={busy} onPress={onDisconnectGitHub}>
          <Text>Disconnect GitHub</Text>
        </Button>

        <Button variant="outline" disabled={busy} onPress={onSignOut}>
          <Text>Sign out</Text>
        </Button>

        <Button variant="outline" disabled={busy} onPress={onDeleteAccount}>
          <Text className="text-destructive">Delete account</Text>
        </Button>
      </View>
    </SettingsSection>
  );
}
