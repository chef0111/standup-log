# StandupLog

Expo (SDK 55) + Expo Router + Supabase. See [CONTEXT.md](CONTEXT.md) and [PRD.md](PRD.md) for product language and scope.

## Prerequisites

- [Node.js](https://nodejs.org/) and [pnpm](https://pnpm.io/)
- iOS Simulator / Android emulator / device for native runs

## Environment variables

Create **`.env.local`** in the project root (never commit secrets). The app reads these at build time via Expo `EXPO_PUBLIC_*` variables.

| Variable                        | Required | Description                                          |
| ------------------------------- | -------- | ---------------------------------------------------- |
| `EXPO_PUBLIC_SUPABASE_URL`      | Yes      | Supabase project URL (`https://xxx.supabase.co`)     |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Yes\*    | Supabase anon (publishable) key                      |
| `EXPO_PUBLIC_SUPABASE_KEY`      | Legacy   | Accepted if `EXPO_PUBLIC_SUPABASE_ANON_KEY` is unset |
| `EXPO_PUBLIC_POSTHOG_KEY`       | No       | PostHog project key for product analytics (optional) |
| `EXPO_PUBLIC_POSTHOG_HOST`      | No       | PostHog host (default `https://us.i.posthog.com`)    |

\*Use the **anon** key from [Supabase Dashboard → Settings → API](https://supabase.com/dashboard/project/_/settings/api). Do **not** put the **service_role** key in any `EXPO_PUBLIC_*` variable.

If variables are missing, the app opens a **setup** screen with instructions instead of crashing.

### GitHub sign-in (Phase 1+)

1. Enable the **GitHub** provider under Authentication → Providers in the Supabase dashboard.
2. Create a GitHub OAuth App; set the callback URL Supabase shows for your project.
3. Under **Authentication → URL configuration**, add this app’s OAuth redirect to **Redirect URLs** (Expo `makeRedirectUri` — copy the exact string from the **Sign in** screen in dev, typically `standuplog://auth/callback` on device/simulator, or an Expo Go variant).
4. Apply database migrations to your Supabase project in timestamp order under `supabase/migrations/` (SQL editor, `supabase db push`, or your normal pipeline). The Phase 2 migration adds `selected_repositories`, `is_pro`, and a check constraint enforcing **three repositories max** on the free tier.
5. Deploy Edge Functions (required for **Delete account** and **AI standup draft**):

   ```bash
   bunx supabase@latest functions deploy delete-account
   bunx supabase@latest functions deploy generate-standup-draft
   ```

   - `delete-account` uses `SUPABASE_SERVICE_ROLE_KEY` and `SUPABASE_URL` automatically in hosted Supabase.
   - `generate-standup-draft` requires the operator Anthropic key (never in the mobile app):

     ```bash
     bunx supabase@latest secrets set ANTHROPIC_API_KEY=sk-ant-...
     ```

   Restart the dev server after changing `.env.local`.

## Scripts

```bash
pnpm install
pnpm start          # expo start
pnpm android        # expo start --android
pnpm ios            # expo start --ios
pnpm web            # expo start --web
pnpm lint           # expo lint
```

## Project layout

- `src/app/` — Expo Router routes (`(public)` pre-auth, `(app)` authed shell)
- `src/components/ui/` — [React Native Reusables](https://reactnativereusables.com/) primitives
- `src/utils/supabase.ts` — Supabase client factory (`getSupabase()` returns `null` when env is incomplete)

## Troubleshooting (NativeWind / Android)

If Metro fails with `failed to deserialize; expected an object-like struct named Specifier` while bundling CSS:

1. `bun install` — runs `postinstall` to remove a nested `lightningcss` copy under `@expo/metro-config` (must stay on **1.30.1**).
2. Restart with a clean cache: `bun run start -- -c`, then open Android again.

Smoke-test the CSS pipeline: `node scripts/verify-css-compile.js`.

## Beta builds (EAS)

Voice notes and native speech recognition require a **development build** (not Expo Go).

```bash
bun install
bunx eas-cli build --profile development --platform ios
bunx eas-cli build --profile development --platform android
```

After adding `expo-speech-recognition` or `expo-notifications`, rebuild the native client. See [docs/analytics-privacy.md](docs/analytics-privacy.md) and [docs/ai-content-safety.md](docs/ai-content-safety.md).

## Learn more

- [Expo Router](https://docs.expo.dev/router/introduction/)
- [Expo SDK 55 docs](https://docs.expo.dev/versions/v55.0.0/)
