# StandupLog • ![License](https://img.shields.io/badge/License-MIT-blue)

**Turn GitHub activity and your notes into a standup update you actually want to paste.**

StandupLog is a mobile app for developers who do daily standups. It pulls commit and pull-request metadata from the repositories you choose, lets you add context Git can't see, drafts a structured update with AI, and puts you one copy away from Slack or Teams—without surveillance, without another project-management tool.

---

## The problem

Most developers lose ten minutes every morning reconstructing yesterday. Git history is accurate but unreadable for humans. Jira captures intent, not what actually shipped. Memory is biased toward whatever happened last.

StandupLog is a **memory aid**, not a tracker. You stay in control of the final message.

---

## Features

### Activity from GitHub

Connect GitHub and pick up to three repositories on the free tier (unlimited on Pro). StandupLog syncs **Activity Signals**—commit messages, timestamps, and PR metadata—for each **Workday**. No code diffs are stored or sent to AI.

**Shipped** and **In progress** badges distinguish work on your default branch from feature-branch and open-PR work, so a standup can say what landed and what's still in flight.

### AI draft, human approval

Tap **Generate** to produce a markdown **Standup Update**: a paste-ready **Standup Summary** plus structured sections (what you did, focusing on, blockers, metrics). Review, edit, save, then **Copy summary** or **Copy full**. Nothing posts automatically.

### Notes when commits aren't enough

Add **Manual Notes** for context commits miss—pairing sessions, reviews, incidents, planning. **Voice Notes** transcribe on-device via OS speech recognition. Mark notes as blockers or carry-forward for the next day.

### Built for a daily habit

- **Morning Reminder** when yesterday's standup wasn't copied yet
- **Daily Streak** when you copy or share
- **Weekly Summary** grouped by **Work Type** (feature, bug, refactor, test, chore, style)
- **Read view** for a clean, read-only presentation before you share

### Privacy by design

Activity metadata only. No source code in the database. No productivity scoring. AI runs server-side; your edit is always the source of truth. See [AI content safety](docs/ai-content-safety.md) and [Analytics & privacy](docs/analytics-privacy.md).

---

## How it works

1. **Sign in** with GitHub and select repositories during onboarding.
2. **Open Generate standup** for a Workday (defaults to today; pick any allowed past day from the calendar).
3. **Review Sources**—synced commits and your notes—then generate or write manually.
4. **Copy** the summary or full update into your team's channel.

---

## Tech stack

| Layer        | Technology                                                                                                                                                                |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Frontend** | [Expo SDK 55](https://docs.expo.dev/versions/v55.0.0/) + React 19, [NativeWind](https://www.nativewind.dev/), [React Native Reusables](https://reactnativereusables.com/) |
| **Backend**  | [Supabase](https://supabase.com/) - Postgres, Edge Functions                                                                                                              |
| **Auth**     | [Supabase Auth](https://supabase.com/docs/guides/auth) - GitHub OAuth                                                                                                     |
| **AI**       | Anthropic Claude Haiku 4.5                                                                                                                                                |

Native modules include on-device speech recognition, local notifications, MMKV, FlashList, and Reanimated.

---

## Platforms

iOS and Android via [Expo development builds](https://docs.expo.dev/develop/development-builds/introduction/) (required for voice notes and notifications). Web support is available for development.

---

## Documentation

| Doc                                        | Purpose                                           |
| ------------------------------------------ | ------------------------------------------------- |
| [CONTEXT.md](CONTEXT.md)                   | Product glossary and domain language              |
| [PRD.md](PRD.md)                           | Product requirements and scope                    |
| [docs/development.md](docs/development.md) | Local setup, env vars, migrations, Edge Functions |
| [docs/adr/](docs/adr/)                     | Architecture decisions                            |

---

## License

Licensed under the [MIT license](./LICENSE).
