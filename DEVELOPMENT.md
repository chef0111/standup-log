# Development setup

## Prerequisites

- [Bun](https://bun.sh/)
- iOS Simulator, Android emulator, or a physical device
- A Supabase project with GitHub Auth configured

## Environment

Create **`.env.local`** in the project root (never commit secrets):

| Variable                   | Required | Description                                       |
| -------------------------- | -------- | ------------------------------------------------- |
| `EXPO_PUBLIC_SUPABASE_URL` | Yes      | Supabase project URL                              |
| `EXPO_PUBLIC_SUPABASE_KEY` | Yes      | Supabase project key                              |
| `EXPO_PUBLIC_POSTHOG_KEY`  | No       | PostHog project key                               |
| `EXPO_PUBLIC_POSTHOG_HOST` | No       | PostHog host (default `https://us.i.posthog.com`) |

Use the **supabase** key from Supabase Dashboard → Settings → API. Never put `service_role` in `EXPO_PUBLIC_*`.

If variables are missing, the app shows a setup screen instead of crashing.

## GitHub sign-in

1. Enable the **GitHub** provider under Authentication → Providers.
2. Create a GitHub OAuth App with Supabase's callback URL.
3. Add this app's OAuth redirect to **Redirect URLs** (e.g. `standuplog://auth/callback` — copy from the sign-in screen in dev).
4. Apply migrations from `supabase/migrations/` in timestamp order (`supabase db push` or your pipeline).

## Edge Functions

Deploy after migrations:

```bash
bunx supabase@latest functions deploy delete-account
bunx supabase@latest functions deploy generate-standup-draft
```

Set the Anthropic key for AI drafts (server-only, never in the app):

```bash
bunx supabase@latest secrets set ANTHROPIC_API_KEY=sk-ant-...
```

`delete-account` uses hosted Supabase env for `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` automatically.

## Scripts

```bash
bun install
bun run start          # expo start
bun run start:clean    # expo start -c
bun run ios
bun run android
bun run web
bun run lint
bun run test
```

## Project layout

- `src/app/` — Expo Router routes (`(public)` pre-auth, `(app)` authenticated)
- `src/features/` — Domain modules (standup, activity, repositories, profile, …)
- `src/components/ui/` — Shared UI primitives
- `supabase/functions/` — Edge Functions
- `supabase/migrations/` — Postgres schema

## Native builds (EAS)

Voice notes and speech recognition require a development build, not Expo Go:

```bash
bunx eas-cli build --profile development --platform ios
bunx eas-cli build --profile development --platform android
```

Rebuild after adding native modules (`expo-speech-recognition`, `expo-notifications`, etc.).

## Troubleshooting (NativeWind / Android)

If Metro fails with `failed to deserialize; expected an object-like struct named Specifier`:

1. Run `bun install` (postinstall pins `lightningcss` to 1.30.1).
2. `bun run start:clean`, then reopen Android.

Smoke-test CSS: `node scripts/verify-css-compile.js`.

## Delete account

The `delete-account` function removes the auth user. `activity_commits`, `manual_notes`, `standup_updates`, and `ai_generation_events` cascade from `profiles` — no orphaned rows after a successful delete.
