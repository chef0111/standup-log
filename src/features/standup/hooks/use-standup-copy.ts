import { useAuth } from '@/features/auth';
import { fetchUserProfile } from '@/features/profile';
import { isStandupMarkdownEmpty } from '@/features/standup/lib/compose-standup-markdown';
import {
  formatStandupForCopy,
  formatStandupSummaryForCopy,
  normalizeCopyFormat,
  type CopyFormat,
} from '@/features/standup/lib/format-standup';
import { recordStandupCopy } from '@/features/standup/lib/record-standup-copy';
import type { Workday } from '@/features/workday/types/workday';
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
      await Clipboard.setStringAsync(
        formatStandupSummaryForCopy(markdown, copyFormat)
      );
      await recordCopy('Summary copied');
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
      await Clipboard.setStringAsync(
        formatStandupForCopy(markdown, copyFormat)
      );
      await recordCopy('Full standup copied');
    } catch {
      setToastMessage('Could not copy. Try again.');
    } finally {
      setCopying(false);
    }
  }, [copyFormat, markdown, recordCopy, session, supabase]);

  const copyFullWithConfirm = React.useCallback(() => {
    if (isStandupMarkdownEmpty(markdown)) {
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
