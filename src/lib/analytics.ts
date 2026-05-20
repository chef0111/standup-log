import PostHog from 'posthog-react-native';

export type AnalyticsEvent =
  | 'onboarding_started'
  | 'onboarding_completed'
  | 'github_oauth_success'
  | 'github_oauth_failure'
  | 'repository_selection_completed'
  | 'draft_generated'
  | 'draft_generation_failed'
  | 'draft_edited'
  | 'standup_copied'
  | 'copy_format_selected'
  | 'manual_note_created'
  | 'voice_note_recorded'
  | 'voice_note_transcribed'
  | 'voice_note_saved'
  | 'reminder_permission_accepted'
  | 'reminder_permission_denied'
  | 'weekly_summary_viewed'
  | 'upgrade_prompt_viewed';

export type AnalyticsProperties = Record<
  string,
  string | number | boolean | undefined
>;

const apiKey = process.env.EXPO_PUBLIC_POSTHOG_KEY;
const host =
  process.env.EXPO_PUBLIC_POSTHOG_HOST ?? 'https://us.i.posthog.com';

const client = apiKey
  ? new PostHog(apiKey, {
      host,
    })
  : null;

export function isAnalyticsEnabled(): boolean {
  return client != null;
}

export function identifyUser(userId: string): void {
  client?.identify(userId);
}

export function resetAnalyticsUser(): void {
  client?.reset();
}

export function track(
  event: AnalyticsEvent,
  properties?: AnalyticsProperties
): void {
  if (!client) {
    return;
  }
  const payload = Object.fromEntries(
    Object.entries(properties ?? {}).filter(
      ([, value]) => value !== undefined
    )
  ) as Record<string, string | number | boolean>;
  client.capture(event, payload);
}
