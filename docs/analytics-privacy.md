# Analytics privacy

StandupLog product analytics use PostHog when `EXPO_PUBLIC_POSTHOG_KEY` is set. Without a key, all `track()` calls are no-ops.

## Allowed properties

- Event names from PRD §13
- `format`, `workday` (ISO date string), `count`, `is_pro`, `error_code`, `provider`
- Milestone flags: `first_draft`, `first_copy`

## Never send

- Commit messages or SHAs
- Manual note or standup `draft_markdown` bodies
- Repository source code, diffs, or PR bodies
- GitHub tokens or user emails (use Supabase `user.id` only for `identify`)

## Operator setup

```env
EXPO_PUBLIC_POSTHOG_KEY=phc_...
EXPO_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```
