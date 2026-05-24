import { Card } from '@/components/ui/card';
import {
  SettingsRow,
  SettingsRowDivider,
} from '@/features/settings/components/settings-row';

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
    <Card variant="elevated" className="gap-0 p-2">
      <SettingsRow
        label="Disconnect GitHub"
        onPress={busy ? undefined : onDisconnectGitHub}
      />
      <SettingsRowDivider />
      <SettingsRow label="Sign out" onPress={busy ? undefined : onSignOut} />
      <SettingsRowDivider />
      <SettingsRow
        label="Delete account"
        destructive
        onPress={busy ? undefined : onDeleteAccount}
      />
    </Card>
  );
}
