---
name: expo
description: Use when the request involves this Expo React Native codebase and touches Expo Router or navigation, screens or layouts, tabs or modals, forms, styling, animation, images, or platform UI; EAS Build, Submit, Hosting, or store release; eas.json or .eas/workflows CI YAML; expo-dev-client, development builds, or TestFlight-style distribution; Tailwind CSS v4, NativeWind v5, or react-native-css setup; Expo Router API routes or server handlers on EAS Hosting; @expo/ui SwiftUI or Jetpack Compose; fetch, caching, offline sync, React Query, SWR, or Expo Router loaders; bumping Expo SDK or fixing upgrade dependency skew; or Expo DOM components and web-in-native embedding.
---

# Expo skills

## Overview

Bundled official Expo agent skills live **next to this file**—one folder per topic. **Open the matching leaf `SKILL.md` below** before implementing; this file only routes.

## Routing (symptom → leaf skill)

Read **one primary** leaf first; open a second only if the task clearly spans topics.


| User intent / keywords                                                                                                                                                                      | Leaf skill (path from repo root)                       |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| Expo Router file layout, stacks, tabs, drawers, modals, headers, forms, sheets, search, lists, gestures, Reanimated, styling primitives, SF Symbols, safe area, images, gradients, controls | `.agents/skills/expo/building-native-ui/SKILL.md`      |
| `+api` routes, Route handlers, EAS Hosting for server/API                                                                                                                                   | `.agents/skills/expo/expo-api-routes/SKILL.md`         |
| `.eas/workflows`, EAS workflow YAML, CI for PRs, automation                                                                                                                                 | `.agents/skills/expo/expo-cicd-workflows/SKILL.md`     |
| Production deploy, iOS App Store, Play Store, web hosting, metadata, EAS Submit                                                                                                             | `.agents/skills/expo/expo-deployment/SKILL.md`         |
| `expo-dev-client`, custom dev client, local install, TestFlight internal                                                                                                                    | `.agents/skills/expo/expo-dev-client/SKILL.md`         |
| Tailwind v4, NativeWind v5, `react-native-css`, universal styling setup                                                                                                                     | `.agents/skills/expo/expo-tailwind-setup/SKILL.md`     |
| `@expo/ui/jetpack-compose`, Compose in RN                                                                                                                                                   | `.agents/skills/expo/expo-ui-jetpack-compose/SKILL.md` |
| `@expo/ui/swift-ui`, SwiftUI in RN                                                                                                                                                          | `.agents/skills/expo/expo-ui-swift-ui/SKILL.md`        |
| `fetch`, errors, retries, caching, offline, React Query, SWR, `useLoaderData`, loaders                                                                                                      | `.agents/skills/expo/native-data-fetching/SKILL.md`    |
| Expo SDK upgrade, `expo install`, dependency conflicts, New Architecture, RN 19, native-tabs migration                                                                                      | `.agents/skills/expo/upgrading-expo/SKILL.md`          |
| `expo/dom`, DOM components, webview web UI on native                                                                                                                                        | `.agents/skills/expo/use-dom/SKILL.md`                 |


## Tie-breakers

- **“Upgrade Expo” or SDK mismatch errors** → `upgrading-expo` before changing unrelated UI patterns.
- **“Add screen / tab / modal”** without deploy context → `building-native-ui`.
- **“API on server” in Expo Router** → `expo-api-routes`, not generic web Next.js docs.
- **Styling system setup** (Tailwind / NativeWind) → `expo-tailwind-setup`, not only `building-native-ui`.

## When not to use this index

- Work is **only** backend (e.g. Supabase SQL, Edge auth) with **no** Expo surface change—use domain or Supabase skills instead.
- Questions are **pure** Git or product copy with no Expo/EAS/RN execution.

## Common mistakes

- **Stopping at this file**—always read the **leaf** `SKILL.md` for procedures and constraints.
- **Mixing web Next.js patterns** with Expo Router without checking `building-native-ui` / `expo-api-routes`.
- **Guessing NativeWind / Tailwind versions**—`expo-tailwind-setup` is version-specific (v4 / v5).

## Quick reference

- Human-readable bundle list: `.agents/skills/expo/README.md`
- Upstream catalog: [Expo docs — Skills](https://docs.expo.dev/skills/), [expo/skills repo](https://github.com/expo/skills)

