import { Button } from '@/components/ui/button';
import { ButtonSpinner } from '@/components/ui/button-spinner';
import { Text } from '@/components/ui/text';
import { CopyFormatPicker } from '@/features/standup/components/copy-format-picker';
import { CopyToast } from '@/features/standup/components/copy-toast';
import { useStandupCopy } from '@/features/standup/hooks/use-standup-copy';
import { isStandupSummaryReady } from '@/features/standup/lib/compose-standup-markdown';
import type { CopyFormat } from '@/features/standup/lib/format-standup';
import { StarsIcon } from 'lucide-react-native';
import * as React from 'react';
import { View } from 'react-native';
import { useStandup } from '../context/standup';

export function StandupStickyActions() {
  const {
    workday,
    editorMarkdown,
    savedMarkdown,
    draftMarkdown,
    aiLoading,
    aiError,
    aiRateLimited,
    regenerateDraft,
  } = useStandup();

  const [sessionCopyFormat, setSessionCopyFormat] =
    React.useState<CopyFormat | null>(null);

  const { copying, toastMessage, copySummary, copyFormat } = useStandupCopy(
    workday,
    editorMarkdown,
    { formatOverride: sessionCopyFormat }
  );

  const summaryReady = React.useMemo(
    () => isStandupSummaryReady(editorMarkdown),
    [editorMarkdown]
  );

  const hasDraft = Boolean(draftMarkdown ?? savedMarkdown);

  return (
    <View className="gap-2">
      <View className="flex-row gap-2">
        <Button
          variant="outline"
          disabled={copying || !summaryReady}
          onPress={() => void copySummary()}
          className="min-h-12 flex-1"
        >
          <Text>Copy summary</Text>
        </Button>
        <Button
          size="pill"
          disabled={aiLoading || aiRateLimited}
          onPress={() => void regenerateDraft()}
          className="min-h-12 flex-1"
        >
          {aiLoading ? <ButtonSpinner /> : <StarsIcon />}
          <Text>{hasDraft ? 'Regenerate' : 'Generate'}</Text>
        </Button>
      </View>
      {aiError ? (
        <Text className="text-muted-foreground text-center text-xs">
          {aiError}
        </Text>
      ) : null}
      <View className="gap-1.5">
        <Text className="text-muted-foreground text-xs">Copy format</Text>
        <CopyFormatPicker
          value={copyFormat}
          onChange={setSessionCopyFormat}
          disabled={copying}
        />
      </View>
      <CopyToast message={toastMessage} />
    </View>
  );
}
