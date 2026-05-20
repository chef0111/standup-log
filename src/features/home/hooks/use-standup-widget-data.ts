import { useAuth } from '@/features/auth';
import { fetchUserProfile, type ProfileHomeRow } from '@/features/profile';
import { isStandupSummaryReady } from '@/features/standup/lib/compose-standup-markdown';
import { extractStandupSummary } from '@/features/standup/lib/parse-standup-markdown';
import { fetchStandupUpdate } from '@/features/standup/lib/standup-api';
import { defaultTargetWorkday } from '@/features/workday';
import type { Workday } from '@/features/workday/types/workday';
import { useFocusEffect } from '@react-navigation/native';
import * as React from 'react';

export type StandupWidgetData = {
  workday: Workday;
  profile: ProfileHomeRow | null;
  hasStandup: boolean;
  copied: boolean;
  summaryExcerpt: string | null;
  summaryReady: boolean;
  loading: boolean;
  error: string | null;
};

export function useStandupWidgetData(): StandupWidgetData {
  const { supabase, session } = useAuth();
  const workday = defaultTargetWorkday();
  const [profile, setProfile] = React.useState<ProfileHomeRow | null>(null);
  const [hasStandup, setHasStandup] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const [summaryExcerpt, setSummaryExcerpt] = React.useState<string | null>(
    null
  );
  const [summaryReady, setSummaryReady] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    if (!supabase || !session) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const [
      { profile: row, error: profileError },
      { standup, error: standupError },
    ] = await Promise.all([
      fetchUserProfile(supabase, session),
      fetchStandupUpdate(supabase, workday),
    ]);

    if (profileError) {
      setError(profileError);
      setProfile(null);
    } else {
      setProfile(row);
    }

    if (standupError) {
      setError((prev) => prev ?? standupError);
    }

    const markdown = standup?.draft_markdown ?? '';
    const ready = isStandupSummaryReady(markdown);
    const summary = extractStandupSummary(markdown).trim();

    setHasStandup(Boolean(markdown.trim()));
    setCopied(Boolean(standup?.copied_at));
    setSummaryReady(ready);
    setSummaryExcerpt(
      ready && summary.length > 0
        ? summary.length > 120
          ? `${summary.slice(0, 117)}…`
          : summary
        : null
    );
    setLoading(false);
  }, [session, supabase, workday]);

  useFocusEffect(
    React.useCallback(() => {
      void load();
    }, [load])
  );

  return {
    workday,
    profile,
    hasStandup,
    copied,
    summaryExcerpt,
    summaryReady,
    loading,
    error,
  };
}
