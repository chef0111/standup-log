import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';

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
    <>
      <Button variant="outline" disabled={busy} onPress={onDisconnectGitHub}>
        <Text>Disconnect GitHub</Text>
      </Button>

      <Button variant="outline" disabled={busy} onPress={onSignOut}>
        <Text>Sign out</Text>
      </Button>

      <Button variant="outline" disabled={busy} onPress={onDeleteAccount}>
        <Text className="text-destructive">Delete account</Text>
      </Button>
    </>
  );
}
