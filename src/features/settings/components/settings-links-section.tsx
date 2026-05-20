import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useRouter } from 'expo-router';

type SettingsLinksSectionProps = {
  onUpgradePress: () => void;
};

export function SettingsLinksSection({
  onUpgradePress,
}: SettingsLinksSectionProps) {
  const router = useRouter();

  return (
    <>
      <Button onPress={() => router.push('/settings/repositories')}>
        <Text>Manage repositories</Text>
      </Button>

      <Button
        variant="outline"
        onPress={() => router.push('/settings/privacy')}
      >
        <Text>Privacy</Text>
      </Button>

      <Button variant="outline" onPress={onUpgradePress}>
        <Text>Upgrade to Pro</Text>
      </Button>
    </>
  );
}
