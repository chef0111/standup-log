import { useAuth } from '@/context/auth';
import { isStandupCopyEmpty } from '@/features/standup/lib/build-no-update-standup';
import {
  formatStandupForCopy,
  formatStandupSummaryForCopy,
  normalizeCopyFormat,
  type CopyFormat,
} from '@/features/standup/lib/format-standup';
import type { Workday } from '@/features/standup/types/workday';
import { track } from '@/lib/analytics';
import { markFirstEvent } from '@/lib/analytics-flags';
import { useProfileQuery } from '@/queries/profile/use-profile-query';
import { useRecordCopyMutation } from '@/queries/standup/use-record-copy-mutation';
import * as Clipboard from 'expo-clipboard';
import * as React from 'react';
import { Alert } from 'react-native';

type UseStandupCopyOptions = {
  /** Overrides profile default for this screen session */
  formatOverride?: CopyFormat | null;
};

export function useStandupCopy(
  workday: Workday,
  markdown: string,
  options?: UseStandupCopyOptions
) {
  const { session } = useAuth();
  const profileQuery = useProfileQuery();
  const recordCopyMutation = useRecordCopyMutation();
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);

  const profileFormat = normalizeCopyFormat(
    profileQuery.data?.default_copy_format
  );
  const copyFormat = options?.formatOverride ?? profileFormat;

  const recordCopy = React.useCallback(
    async (toastLabel: string) => {
      if (!session) {
        return { error: 'Not signed in.' };
      }
      try {
        const { streakIncremented } = await recordCopyMutation.mutateAsync({
          workday,
          draftMarkdown: markdown,
          formatUsed: copyFormat,
        });
        const firstCopy = await markFirstEvent(
          session.user.id,
          'first_standup_copied'
        );
        track('standup_copied', {
          workday,
          format: copyFormat,
          first_copy: firstCopy,
        });
        track('copy_format_selected', { format: copyFormat });
        setToastMessage(
          streakIncremented ? `${toastLabel} · Streak +1` : toastLabel
        );
        return { error: null };
      } catch (error) {
        return {
          error: error instanceof Error ? error.message : 'Saved copy failed.',
        };
      }
    },
    [copyFormat, markdown, recordCopyMutation, session, workday]
  );

  const copying = recordCopyMutation.isPending;

  const copySummary = React.useCallback(async () => {
    if (!session) {
      return;
    }
    try {
      const formatted = formatStandupSummaryForCopy(markdown, copyFormat);
      const { error } = await recordCopy('Summary copied');
      if (error) {
        setToastMessage('Saved copy failed. Try again.');
        return;
      }
      await Clipboard.setStringAsync(formatted);
    } catch {
      setToastMessage('Could not copy. Try again.');
    }
  }, [copyFormat, markdown, recordCopy, session]);

  const copyFull = React.useCallback(async () => {
    if (!session) {
      return;
    }
    try {
      const formatted = formatStandupForCopy(markdown, copyFormat);
      const { error } = await recordCopy('Full standup copied');
      if (error) {
        setToastMessage('Saved copy failed. Try again.');
        return;
      }
      await Clipboard.setStringAsync(formatted);
    } catch {
      setToastMessage('Could not copy. Try again.');
    }
  }, [copyFormat, markdown, recordCopy, session]);

  const copyFullWithConfirm = React.useCallback(() => {
    if (isStandupCopyEmpty(markdown)) {
      Alert.alert(
        'Empty standup',
        'This standup has no activity or notes. Copy anyway?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Copy', onPress: () => void copyFull() },
        ]
      );
      return;
    }
    void copyFull();
  }, [copyFull, markdown]);

  return {
    copying,
    toastMessage,
    setToastMessage,
    copyFormat,
    profileFormat,
    copySummary,
    copyFull: copyFullWithConfirm,
  };
}
