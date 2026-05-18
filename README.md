# StandupLog

Expo (SDK 55) + Expo Router + Supabase. See [CONTEXT.md](CONTEXT.md) and [PRD.md](PRD.md) for product language and scope.

## Prerequisites

- [Node.js](https://nodejs.org/) and [pnpm](https://pnpm.io/)
- iOS Simulator / Android emulator / device for native runs

## Environment variables

Create **`.env.local`** in the project root (never commit secrets). The app reads these at build time via Expo `EXPO_PUBLIC_*` variables.

| Variable | Required | Description |
|----------|----------|-------------|
| `EXPO_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL (`https://xxx.supabase.co`) |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Yes* | Supabase anon (publishable) key |
| `EXPO_PUBLIC_SUPABASE_KEY` | Legacy | Accepted if `EXPO_PUBLIC_SUPABASE_ANON_KEY` is unset |

\*Use the **anon** key from [Supabase Dashboard → Settings → API](https://supabase.com/dashboard/project/_/settings/api). Do **not** put the **service_role** key in any `EXPO_PUBLIC_*` variable.

If variables are missing, the app opens a **setup** screen with instructions instead of crashing.

### GitHub sign-in (Phase 1+)

After Supabase is configured:

1. Enable the **GitHub** provider under Authentication → Providers in the Supabase dashboard.
2. Create a GitHub OAuth App; set the callback URL Supabase shows for your project.
3. For native builds, add the app scheme redirect (see `app.json` → `scheme`, e.g. `standuplog://`) to **Redirect URLs** in Supabase Auth settings as required by your Expo linking setup.

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

## Learn more

- [Expo Router](https://docs.expo.dev/router/introduction/)
- [Expo SDK 55 docs](https://docs.expo.dev/versions/v55.0.0/)
