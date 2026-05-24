import { Card } from '@/components/ui/card';
import {
  SettingsRow,
  SettingsRowDivider,
} from '@/features/settings/components/settings-row';
import { useRouter } from 'expo-router';

type SettingsLinksSectionProps = {
  onUpgradePress: () => void;
};

export function SettingsLinksSection({
  onUpgradePress,
}: SettingsLinksSectionProps) {
  const router = useRouter();

  return (
    <Card variant="elevated" className="gap-0 p-2">
      <SettingsRow
        label="Manage repositories"
        onPress={() => router.push('/settings/repositories')}
      />
      <SettingsRowDivider />
      <SettingsRow
        label="Privacy"
        onPress={() => router.push('/settings/privacy')}
      />
      <SettingsRowDivider />
      <SettingsRow label="Upgrade to Pro" onPress={onUpgradePress} />
    </Card>
  );
}
