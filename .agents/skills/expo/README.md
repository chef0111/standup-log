# Expo agent skills (project bundle)

Agent entrypoint: **[`SKILL.md`](./SKILL.md)** (symptom → leaf skill routing).

Official [Expo skills](https://docs.expo.dev/skills/) for this repo, grouped under **`.agents/skills/expo/`** (sibling folders + [`SKILL.md`](./SKILL.md) router for agents).

## Installed skills (11)

| Folder | Use when |
|--------|----------|
| [`building-native-ui`](./building-native-ui/SKILL.md) | Expo Router, styling, components, navigation, animations |
| [`expo-api-routes`](./expo-api-routes/SKILL.md) | API routes in Expo Router + EAS Hosting |
| [`expo-cicd-workflows`](./expo-cicd-workflows/SKILL.md) | `.eas/workflows/` CI/CD YAML |
| [`expo-deployment`](./expo-deployment/SKILL.md) | Store deploy, web hosting, production |
| [`expo-dev-client`](./expo-dev-client/SKILL.md) | Dev clients, local/TestFlight distribution |
| [`expo-tailwind-setup`](./expo-tailwind-setup/SKILL.md) | Tailwind v4 + NativeWind v5 + react-native-css |
| [`expo-ui-jetpack-compose`](./expo-ui-jetpack-compose/SKILL.md) | `@expo/ui/jetpack-compose` |
| [`expo-ui-swift-ui`](./expo-ui-swift-ui/SKILL.md) | `@expo/ui/swift-ui` |
| [`native-data-fetching`](./native-data-fetching/SKILL.md) | fetch, caching, offline, Expo Router loaders |
| [`upgrading-expo`](./upgrading-expo/SKILL.md) | SDK upgrades, dependency fixes |
| [`use-dom`](./use-dom/SKILL.md) | DOM components / web-in-webview on native |

## Not bundled here

The `npx skills add expo/skills` default install also includes **eas-update-insights** and **expo-module**. This repo only keeps the 11 skills listed above; add them back with a selective copy from [github.com/expo/skills](https://github.com/expo/skills) if needed.

## Refresh from upstream

```bash
npx skills add expo/skills
```

That copies into **`.agents/skills/`** at the repo root. Move or merge only the `expo/*` skill folders you want into **`.agents/skills/expo/`**, leaving unrelated skills (e.g. `vercel-*`) at `.agents/skills/` root.

## Source

- [Expo docs: Skills](https://docs.expo.dev/skills/)
- [expo/skills on GitHub](https://github.com/expo/skills)
