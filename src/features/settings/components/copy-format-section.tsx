import { CopyFormatPicker } from '@/features/standup/components/copy-format-picker';
import { SettingsSection } from '@/features/settings/components/settings-section';
import type { CopyFormat } from '@/features/standup/lib/format-standup';

type CopyFormatSectionProps = {
  value: CopyFormat;
  onChange: (format: CopyFormat) => void;
};

export function CopyFormatSection({ value, onChange }: CopyFormatSectionProps) {
  return (
    <SettingsSection
      title="Default copy format"
      description="Used when you copy a standup unless you pick another format on the Generate or Read screen."
    >
      <CopyFormatPicker value={value} onChange={onChange} />
    </SettingsSection>
  );
}
