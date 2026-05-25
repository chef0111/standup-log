import { useAuth } from '@/context/auth';
import { fetchUserProfile } from '@/features/profile/lib/profile';
import { isStandupCopyEmpty } from '@/features/standup/lib/build-no-update-standup';
import {
  formatStandupForCopy,
  formatStandupSummaryForCopy,
  normalizeCopyFormat,
  type CopyFormat,
} from '@/features/standup/lib/format-standup';
import { recordStandupCopy } from '@/features/standup/lib/record-standup-copy';
import type { Workday } from '@/features/standup/types/workday';
import { track } from '@/lib/analytics';
import { markFirstEvent } from '@/lib/analytics-flags';
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
  const { supabase, session } = useAuth();
  const [copying, setCopying] = React.useState(false);
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);
  const [profileFormat, setProfileFormat] = React.useState<CopyFormat>('plain');

  React.useEffect(() => {
    if (!supabase || !session) {
      return;
    }
    void fetchUserProfile(supabase, session).then(({ profile }) => {
      if (profile) {
        setProfileFormat(normalizeCopyFormat(profile.default_copy_format));
      }
    });
  }, [session, supabase]);

  const copyFormat = options?.formatOverride ?? profileFormat;

  const recordCopy = React.useCallback(
    async (toastLabel: string) => {
      if (!supabase || !session) {
        return { error: 'Not signed in.' };
      }
      const { streakIncremented, error } = await recordStandupCopy(
        supabase,
        session.user.id,
        workday,
        markdown,
        copyFormat
      );
      if (error) {
        return { error };
      }
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
    },
    [copyFormat, markdown, session, supabase, workday]
  );

  const copySummary = React.useCallback(async () => {
    if (!supabase || !session) {
      return;
    }
    setCopying(true);
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
    } finally {
      setCopying(false);
    }
  }, [copyFormat, markdown, recordCopy, session, supabase]);

  const copyFull = React.useCallback(async () => {
    if (!supabase || !session) {
      return;
    }
    setCopying(true);
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
    } finally {
      setCopying(false);
    }
  }, [copyFormat, markdown, recordCopy, session, supabase]);

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
