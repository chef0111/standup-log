# StandupLog PRD

## 1. Overview

### Product Name

StandupLog

### One-Liner

StandupLog is a mobile app that turns a developer's GitHub activity and manual notes into an editable, ready-to-share standup update in one tap.

### Product Thesis

Developers do not need another project management tool. They need a low-friction memory aid that reconstructs yesterday's work from activity signals, lets them add missing context, and helps them share a clear standup update without mental archaeology.

### MVP North Star

Help an individual developer connect GitHub, select repositories, generate a useful draft, edit it, and copy a standup update in under 5 minutes.

## 2. Problem

Developers often lose 5-15 minutes each morning reconstructing what they did the previous workday. Commit messages are terse, shell history lacks intent, and project tools often capture planned work rather than actual progress. The result is under-reporting, low-quality standups, and avoidable cognitive load before the workday starts.

Current alternatives are weak:

- Memory-only standups are incomplete and biased toward recent work.
- Git history is accurate but noisy, technical, and often hard to translate into team-facing language.
- Jira, Linear, or Notion capture planned work but not always actual daily progress.
- Time trackers create too much friction and imply surveillance.

## 3. Target Users

### Primary User: Individual Developer

Software developers working in teams with recurring standups, usually using GitHub and communicating through Slack, Jira, Notion, or similar tools.

Needs:

- Quickly remember what happened yesterday.
- Convert technical activity into team-readable status.
- Add context that commits do not show.
- Avoid exposing unnecessary private code or sensitive details.
- Keep ownership over final wording.

### Secondary User: Team Lead

Engineering leads who want a lightweight view of team activity without forcing developers into a heavy process.

MVP status: secondary persona is out of MVP scope except as future-facing context.

## 4. Goals

- Reduce time-to-first-copied-standup to less than 5 minutes from install.
- Generate a useful first draft from selected GitHub repositories and manual notes.
- Keep the developer in control of final output.
- Make daily use lightweight through reminders, streaks, and quick note capture.
- Establish privacy trust by storing metadata, not code diffs.

## 5. Non-Goals

StandupLog is not:

- A project management tool.
- A task creation or sprint planning system.
- A time tracker.
- A code review tool.
- A replacement for Jira, Linear, Notion, or Slack.
- A manager surveillance or productivity-scoring product.
- A direct Slack/Jira/Notion posting integration in MVP.

## 6. Product Principles

- Developer owns final truth: GitHub commits and notes are source material, not authoritative proof of work.
- Draft before automation: StandupLog suggests, the developer reviews, edits, and copies.
- Minimal friction: default path must work without configuring workflows, teams, boards, or calendars.
- Privacy by default: store activity metadata and standups, not source code diffs.
- Utility before team features: solo developer value must be proven before shared feeds or team lead views.
- Draft-first editing: the developer can write and save a **Standup Update** manually before or without running **Generate**.

## 7. Information Architecture and UI (as implemented)

### Navigation

Four primary tabs via a floating dark pill tab bar:

| Tab          | Purpose                                                                                                        |
| ------------ | -------------------------------------------------------------------------------------------------------------- |
| **Home**     | Greeting, **Daily Streak**, standup widget for the default **Workday**, recent activity preview, week snapshot |
| **Standup**  | **Generate standup** (default route) and **Read view** (stack screen)                                          |
| **Weekly**   | **Weekly Summary** for the current calendar week                                                               |
| **Settings** | Repositories, copy format, reminder, account actions, privacy                                                  |

Unauthenticated flow: sign-in (hero landing) → onboarding repository picker → app tabs.

### Visual design (Travel Canvas)

- Light canvas background with elevated white cards and soft shadows (dark mode supported).
- Sentence-case screen headers (eyebrow + title + subtitle); profile avatar in header trailing on main tabs.
- Primary actions use charcoal pill buttons; secondary actions use outline pills.
- Activity log and draft markdown editor use an always-dark terminal surface regardless of app theme.
- Sign-in retains a full-bleed hero image; authenticated screens use the light canvas.

### Standup screens

**Generate standup** (`/standup`):

- **Workday** date chip in header; defaults to previous local day on mount.
- Terminal-styled markdown editor with explicit **Save**.
- Collapsible **Sources** panel: activity terminal + manual notes.
- Sticky footer: **Copy summary**, **Generate** / **Regenerate**, session copy-format picker.
- Empty **Workday** guided flow when no activity and no notes.

**Read view** (`/standup/read`):

- Read-only elevated cards: **Summary** plus section cards (**What I did**, **Focusing on**, **Blockers**, **Metrics / Notes**).
- Header **Edit** navigates to **Generate standup** for the same **Workday** (no quick-edit overlay).
- Sticky footer: **Copy summary**, **Copy full**, copy-format picker.

### Activity display

- Commits shown in a terminal-style log with timestamps, work-type badges, and PR lines.
- When **Sources** span more than one **Selected Repository**, commits are grouped under highlighted repository headings.

## 8. Key Decisions

### Product Scope

- MVP optimizes for solo developer speed-to-standup.
- Team workspace, team lead view, and Slack bot are post-MVP.
- Clipboard-based sharing is MVP; direct posting integrations are post-MVP.

### Workday Boundary

- A **Workday** is the user's local calendar day.
- When the user opens **Generate standup**, the default target is the **previous local calendar day** (yesterday), regardless of time of day.
- The user can override the target **Workday** with a **calendar date picker** (native platform control) before generating, reviewing, or copying a **Standup Update**.
- **Selectable range:** today and past calendar days only — not future dates.
- **Default on mount:** opening **Generate standup** without a workday parameter defaults to the previous local calendar day.
- **While mounted:** the chosen **Workday** persists while **Generate standup** remains mounted; deep links (Home, **Read view**) may set an explicit workday.
- **Tier history cap (free):** the calendar picker must not allow selecting a **Workday** older than the free-tier history window (30 days). Pro users may select any past day within stored history. Dates outside the entitlement show an upgrade path rather than a silent empty sync.
- Activity fetch, **Manual Notes**, and saved **Standup Updates** are all scoped to the selected **Workday**.

### GitHub Input

- User explicitly selects repositories during onboarding.
- Selected repositories can include public and private repositories.
- StandupLog requests read-only access appropriate for selected repositories.
- Commits and PR metadata are activity signals, not the final source of truth.
- Code diffs are not stored.

### AI Drafting

- AI generates an editable markdown draft with **Standup Summary**, **What I did**, **Focusing on**, **Blockers**, and optional **Metrics / Notes**.
- **What I did** is generated from activity metadata and manual notes for the selected **Workday**.
- **Focusing on** is not predicted from commits. It uses an editable placeholder and carry-forward notes.
- Blockers are not inferred from commits. They come from blocker-marked notes, or default to editable "No blockers."
- Draft generation uses **operator-hosted** inference (Anthropic Claude via a secured server proxy). Users do **not** sign into a separate AI vendor account as part of the product flow.
- If AI is unavailable, the app should offer a manual draft path rather than block copying.

### Notes

- Text notes are the primary manual input path.
- Voice notes are a should-have beta feature, not an MVP launch blocker.
- Manual notes support two toggles: Blocker and Carry forward.
- Voice notes are limited to 30 seconds.
- Transcription uses **on-device OS speech-to-text only** (no cloud speech API; aligns with zero STT budget).
- If recognition fails, app offers retry (same on-device path) or text note fallback.
- Any **optional** local audio buffer used for the capture UI is deleted after successful save or cancel; operator servers **never** receive voice audio for transcription.

### Engagement

- Daily Streak advances only when the user copies or shares a standup update for a Workday.
- Morning reminder is user-set, defaults to 9:00 AM local time, and fires only if the previous Workday has not been copied.
- Weekly Summary has limited preview in free tier and full version in Pro.

### Monetization

- Free tier includes 3 selected repositories, 30-day history, and all copy formats.
- Pro includes unlimited selected repositories, full history, and full Weekly Summary.
- Team tier is post-MVP and tied to team workspace, team lead view, and Slack bot.
- **Operator AI cost:** standup **draft** inference (Anthropic) is paid by the product operator (API keys server-side only). **Voice** uses device-local STT—no operator spend on transcription. Pricing tiers should cover expected **draft** model usage or enforce limits (see Open Questions).

## 9. MVP Scope

### Must Have

- GitHub OAuth login.
- Explicit selected repository onboarding.
- Fetch commits from selected repositories for chosen Workday.
- Fetch PR metadata where possible.
- Store commit metadata, PR metadata, notes, generated drafts, edited standups, copy/share status, and user settings.
- Generate AI draft in markdown format (**Standup Summary** + **What I did** / **Focusing on** / **Blockers** / **Metrics / Notes**).
- Let user review and edit draft in a markdown editor before saving or copying.
- Copy **Standup Summary** or full standup to clipboard (context-dependent screen).
- Support plain text, Slack Markdown, Jira format, and Notion-style Markdown.
- Manual text notes.
- Manual note toggles: Blocker and Carry forward.
- User-set morning reminder.
- **Workday calendar picker** on Generate standup (native date picker; default yesterday).
- Daily Streak based on copied/shared standups.
- Basic weekly summary preview.
- Delete-account / delete-data path.

### Should Have

- 30-second voice notes with **on-device OS** transcription.
- Retry path for failed **on-device** recognition (or text fallback).
- Editable commit work-type classification.
- Full Weekly Summary for Pro.
- Settings for default copy format.
- **Read view** for saved standups with section cards.
- Home standup widget with quick **Copy summary** and navigation to generate/read.
- Collapsible **Sources** panel on **Generate standup**.
- Activity terminal with multi-repository grouping.
- Empty **Workday** guided no-update flow.

### Could Have

- PR title/body enrichment in draft source material.
- Repository-specific default inclusion/exclusion settings.
- Smart suggestions for likely carry-forward notes.
- Native share sheet in addition to clipboard.
- Calendar-aware reminder suppression.

### Won't Have in MVP

- Team workspace.
- Shared team standup feed.
- Team lead dashboard.
- Automatic Slack bot posting.
- Jira/Notion write APIs.
- Time tracking.
- Task creation.
- Code diff analysis or code review summaries.

## 10. Core User Journey

### First Launch and Onboarding

1. User opens StandupLog.
2. User sees value proposition: "Turn yesterday's commits and notes into a standup update."
3. User connects GitHub via OAuth.
4. User grants read-only access for selected public/private repositories.
5. User chooses selected repositories.
6. User lands on first standup generation screen with default Workday selected.

Acceptance criteria:

- User can complete onboarding without selecting more repositories than allowed by their tier.
- User sees repository names before granting or confirming selection.
- User can edit selected repositories later in settings.
- If GitHub auth fails, user gets a recoverable error and can retry.
- If no repositories are available, user can still use manual notes and manual standup drafting.

### Generate Standup Update

1. User opens **Generate standup** (tab, Home widget, or **Edit** from **Read view**).
2. App defaults the **Workday** to the previous local calendar day unless a workday deep link is provided.
3. User may change the **Workday** via the calendar date picker (today or any allowed past day).
4. User edits markdown directly (draft-first) and may **Save** at any time.
5. User expands **Sources** to review activity terminal and manual notes; may add notes or edit work types.
6. App fetches activity metadata from selected repositories for the chosen **Workday** (background sync).
7. User taps **Generate** or **Regenerate** to produce an **AI Draft** from current **Sources**.
8. User reviews and edits the markdown, then **Copy summary** from the sticky footer (or opens **Read view** for **Copy full**).

Acceptance criteria:

- **Workday** control shows the selected date and opens a native calendar/date picker on tap.
- Default **Workday** on mount is yesterday unless a workday parameter is passed.
- Calendar does not offer future dates.
- Free tier: calendar minimum date is 30 days ago; attempting to select an older date is blocked with upgrade messaging.
- Draft uses **Standup Summary**, **What I did**, **Focusing on**, **Blockers**, and optional **Metrics / Notes**—wording is relative to the selected **Workday**, not clock-relative "yesterday/today."
- **What I did** includes a concise natural-language summary of actual activity.
- **Focusing on** uses editable placeholder text and carry-forward notes, not inferred plans.
- **Blockers** uses blocker-marked notes or editable "No blockers."
- User can regenerate draft.
- User can manually edit any section in the markdown editor.
- Draft generation failure does not prevent manual editing, saving, or copying summary.
- **Edit** from **Read view** opens **Generate standup** for the same **Workday**—no quick-edit sheet.

### Add Manual Note

1. User taps Add Note.
2. User enters text.
3. User optionally marks note as Blocker and/or Carry forward.
4. User saves note.
5. Note becomes available in current or future standup generation.

Acceptance criteria:

- Text note can be saved in under 10 seconds.
- Note can be edited or deleted.
- Blocker notes appear in Blockers section.
- Carry-forward notes appear as **Focusing on** candidates until cleared or used.
- Notes are tied to user-local Workday by default.

### Add Voice Note

1. User taps Voice Note.
2. App requests microphone permission if needed.
3. User speaks for up to 30 seconds (capture stops at limit).
4. App transcribes using **on-device OS speech-to-text** (no cloud STT; no audio upload for transcription).
5. User reviews transcript and saves as Manual Note.

Acceptance criteria:

- Capture stops automatically at 30 seconds.
- User can cancel before saving.
- User can edit transcript before saving.
- If permission is denied, app explains how to enable microphone access and offers text note fallback.
- If on-device recognition fails or is unavailable, app offers retry or text entry.
- No voice audio is sent to operator backends for transcription; only confirmed **Manual Note** text is stored like other notes.

### Review and Copy

1. User reviews generated or manually written markdown on **Generate standup** or **Read view**.
2. User edits text and classifications on **Generate standup** if needed.
3. User chooses output format (session override or settings default).
4. On **Generate standup**, user taps **Copy summary** (when summary is ready).
5. On **Read view** (or Home widget), user may **Copy summary** or **Copy full**.
6. App copies formatted output to clipboard and shows confirmation toast.
7. **Daily Streak** updates if this **Workday** was not already counted.

Acceptance criteria:

- Copy action works for all MVP formats.
- **Copy summary** copies only the **Standup Summary** section; **Copy full** copies the entire markdown document.
- **Copy summary** on **Generate standup** is disabled until summary contains real prose.
- User can change default copy format in settings; session picker overrides on standup screens.
- **Daily Streak** increments only once per **Workday**.
- Copy confirmation is visible but non-blocking.

### Weekly Summary

1. User opens **Weekly** tab.
2. App summarizes **Activity Signals** and copied **Standup Updates** for the **current calendar week**, grouped by **Work Type**.
3. Free users see the top two work-type buckets; additional buckets are locked with upgrade prompt.
4. Pro users see all buckets.

Acceptance criteria:

- Summary is based on standups and classified activity metadata for the current week, not tracked time.
- **Work Type** categories include feature, bug fix, refactor, test, chore, and style.
- User can edit work type classifications on **Generate standup** that affect future summary accuracy.
- Free preview communicates Pro value without blocking core standup generation.

## 11. Functional Requirements

### Authentication

- Support GitHub OAuth.
- Persist authenticated session securely.
- Allow logout.
- Allow account deletion/data deletion.
- Handle expired or revoked GitHub tokens.

### Repository Selection

- Show repositories available to the authenticated GitHub user.
- Allow selecting up to tier limit.
- Support public and private repositories based on granted permissions.
- Let user modify selected repositories later.
- Clearly indicate tier limit and upgrade path.

### Workday Selection

- Show the active **Workday** on the Generate screen.
- Open a native platform calendar/date picker when the user changes the **Workday**.
- Default to the previous local calendar day on mount of **Generate standup** (unless a workday deep link is provided).
- Persist the selected **Workday** while **Generate standup** remains mounted.
- Allow today and past dates only.
- Enforce free-tier minimum selectable date (30-day history window) in the picker; Pro has no artificial minimum beyond stored data.
- Changing **Workday** reloads activity, notes, and any saved standup draft for that day.

### GitHub Activity Fetching

- Fetch commits authored by the authenticated GitHub identity for selected repositories.
- Fetch commit sha, message, repository name, author, timestamp, and URL.
- Fetch associated PR metadata where available, such as PR title, number, URL, status, and merge timestamp.
- Respect user-local Workday filter.
- Deduplicate commits across branches or PR references where possible.
- Store only activity metadata, not diffs.

### AI Generation

- Send only needed activity metadata and note content to AI proxy.
- Generate concise, non-boastful team-facing language.
- Classify activity by work type.
- Produce **Standup Summary**, **What I did**, **Focusing on**, **Blockers**, and optional **Metrics / Notes** sections.
- Avoid hallucinated future plans and blockers.
- Let user regenerate or edit.

### Manual Notes

- Create, edit, delete text notes.
- Mark note as Blocker.
- Mark note as Carry forward.
- Associate notes with Workday.
- Include notes in AI context.

### Voice Notes

- Record up to 30 seconds.
- Transcribe with **on-device OS speech-to-text** only (iOS / Android system recognizer or equivalent Expo-supported path). **No** cloud speech API and **no** Supabase Edge path for audio or transcription.
- Allow transcript review and edit before save.
- Delete any optional local capture buffer after save or cancel; do not retain raw audio server-side for MVP voice flow.
- Provide retry and text fallback on failure.

### Clipboard and Formats

- Copy **Standup Summary** or full **Standup Update** to clipboard.
- **Generate standup** and Home widget expose **Copy summary**; **Read view** exposes **Copy summary** and **Copy full**.
- Support all MVP formats for free users:
  - Plain text.
  - Slack Markdown.
  - Jira format.
  - Notion-style Markdown.
- Persist default copy format.
- Show copy success or failure.

### Notifications

- Let user set reminder time.
- Default reminder time is 9:00 AM local.
- Notify only when previous Workday has no copied/shared standup update.
- Respect OS permission state.
- Provide settings path if notifications are denied.

### Streaks

- Track current streak and longest streak.
- Count only copied/shared standup updates.
- Count one update per Workday.
- Do not count draft generation, app open, or note creation.

### Weekly Summary

- Group activity by work type.
- Show limited free preview.
- Unlock full weekly summary for Pro.
- Avoid representing summary as precise time tracking.

## 12. Edge Cases and Error States

### GitHub

- GitHub OAuth fails or is cancelled.
- GitHub token expires or is revoked.
- User has no repositories.
- Selected repository is deleted, archived, renamed, transferred, or permission-revoked.
- GitHub API rate limit is hit.
- Commit author email does not match authenticated user.
- Same commit appears in multiple branches.
- User works across midnight.
- User has commits in different time zones.
- User selects a **Workday** outside free-tier history.

Expected behavior:

- Show actionable, non-technical error messages.
- Preserve manual drafting path.
- Let user reconnect GitHub or update selected repositories.
- Use user-local **Workday** boundary; user overrides via calendar picker.
- Block out-of-entitlement dates in the picker (free tier) with upgrade copy rather than failing mid-sync.

### AI

- Upstream model provider is unavailable or returns an error.
- AI proxy fails.
- AI output is empty, malformed, too long, or missing sections.
- AI classifies work incorrectly.
- AI suggests sensitive language.

Expected behavior:

- Keep user in editor.
- Offer retry and manual fallback.
- Never auto-copy or auto-post AI output.
- Let user edit work type classifications and final draft.

### Notes

- User saves empty note.
- User deletes note used in previous standup.
- User marks note as both Blocker and Carry forward.
- User wants to clear carry-forward after using note.

Expected behavior:

- Prevent empty notes.
- Preserve historical standup text even if source note is later deleted.
- Allow both Blocker and Carry forward when a blocker remains relevant to today.
- Let user clear Carry forward.

### Voice

- Microphone permission denied.
- Capture interrupted by OS.
- On-device speech recognition fails or is unavailable (offline, unsupported locale, OS error).
- User speaks longer than 30 seconds.

Expected behavior:

- Offer text note fallback.
- Stop at 30 seconds.
- Retry on-device recognition when reasonable; never require cloud STT to unblock.
- Clear optional local capture buffer after save or cancel; no voice payload to operator servers for transcription.

### Clipboard

- Clipboard permission/API fails.
- User changes format after editing.
- Copied standup includes empty sections.

Expected behavior:

- Show copy failure with retry.
- Preserve edited content across format changes.
- Warn before copying a mostly empty update.

## 13. Data and Privacy Requirements

### Store

- User profile and GitHub identity metadata.
- User settings: reminder time, default format, selected repositories.
- Activity metadata: commit sha, message, repository name, timestamp, URL, and PR metadata where available.
- Manual note content and note flags.
- AI drafts and edited standup updates.
- Copy/share timestamps.
- Streak state.

### Do Not Store

- Source code diffs.
- Repository source snapshots.
- Long-lived raw voice audio on operator servers (MVP voice path does not upload audio for transcription).
- Manager-facing productivity scores.

### User Controls

- User can delete notes.
- User can delete standups.
- User can remove selected repositories.
- User can disconnect GitHub.
- User can delete account and associated retained data.

## 14. Analytics

Track product events without storing source code:

- Onboarding started/completed.
- GitHub OAuth success/failure.
- Repository selection completed.
- First draft generated.
- Draft generation failed.
- Draft edited.
- Standup copied.
- Copy format selected.
- Manual note created.
- Voice note recorded/transcribed/saved.
- Reminder permission accepted/denied.
- Reminder tapped.
- Weekly Summary viewed.
- Upgrade prompt viewed.
- Pro subscription started/cancelled.

Primary funnel:

Install -> GitHub connect -> repository selection -> first draft generated -> first standup copied.

## 15. Success Metrics

### MVP Metrics

- Day 7 retention >= 40%.
- Average copied standups per active user per week >= 4.
- Time-to-first-copied-standup < 5 minutes.
- NPS among beta users >= 50.

### Supporting Metrics

- GitHub connect completion rate.
- Repository selection completion rate.
- Draft-to-copy conversion rate.
- Average edit distance between AI draft and copied standup.
- Manual note creation rate.
- Reminder opt-in rate.
- Weekly Summary view rate.
- Free-to-Pro conversion rate.

## 16. Release Plan

### Alpha

Audience: internal testers and trusted developers.

Goals:

- Validate GitHub fetch reliability.
- Validate draft quality.
- Validate onboarding time.
- Validate privacy messaging.

Exit criteria:

- 80% of testers generate first draft successfully.
- Median time-to-first-copied-standup under 5 minutes.
- No critical privacy or auth failures.

### Beta

Audience: individual developers in small teams.

Goals:

- Measure Day 7 retention.
- Test reminder and streak behavior.
- Test weekly summary preview.
- Test voice notes as should-have beta feature.

Exit criteria:

- Day 7 retention approaches 40%.
- Average copied standups per active user per week approaches 4.
- Voice notes do not block core text-note workflow.

### Public MVP

Audience: individual GitHub-using developers.

Goals:

- Launch solo workflow with clear free and Pro tiers.
- Keep team features explicitly post-MVP.

## 17. Open Questions

- GitHub permission model: should implementation use OAuth repo scopes, GitHub App installation, or a hybrid path to achieve selected-repository read-only access?
- Pro packaging: should voice notes remain free if they drive retention, or become Pro later?
- Abuse and cost caps: per-user or per-day generation limits, model choice, and alerting when Anthropic usage spikes?
- Data deletion SLA: how quickly must account deletion remove retained metadata and generated standups?
- PR metadata: which GitHub PR fields are safe and useful enough to include by default?

### Resolved since initial PRD

- **Empty Workday:** guided flow produces an explicit no-update **Standup Update** the developer edits before copying.
- **Weekly Summary preview (free):** top **two Work Types** by commit count; remaining buckets locked.
- **Section labels:** markdown template uses **What I did** / **Focusing on** / **Blockers** (not clock-relative Yesterday/Today).
- **Edit from Read view:** routes to **Generate standup** for the same **Workday**; no quick-edit sheet.

## 18. Post-MVP Direction

### Team Workspace

Squad members share standups into a shared feed after individual approval.

### Team Lead View

Aggregated activity across squad members, framed as visibility and coordination, not performance scoring.

### Slack Bot

Optional automatic posting after developer approval and configured schedule.

### Deeper Integrations

Jira, Linear, Notion, and Slack write integrations should only ship after clipboard workflow proves repeat usage.

## 19. Implementation Decisions

- Build mobile app with Expo SDK 55, Expo Router, and React Native.
- Use Supabase for backend, database, auth/session support, storage, and Edge Functions.
- Route **AI summarization (standup draft)** through **Supabase Edge Functions** as a **secured HTTP proxy**: the mobile app never holds Anthropic API keys.
- **Voice notes:** **on-device OS speech-to-text only**—no Edge Function for transcription, no cloud STT API, no voice audio sent to operator servers for STT.
- Use **Anthropic Claude** (operator API key in Edge Function secrets) for standup draft generation.
- Keep mobile client thin; **never** embed operator AI API keys in the app.
- Use GitHub REST API v3 for repository, commit, and PR metadata; persist GitHub provider token locally for repo list and sync.
- Use React context for standup session state; module-level cache for per-workday activity.
- Use Expo Notifications for local reminder behavior.
- Use expo-clipboard for MVP sharing.
- Use owned UI components with NativeWind v5 / Tailwind v4 styling (Travel Canvas design system).
- Store activity metadata and standup artifacts as markdown; do not store code diffs.
- Model work type as editable categories: feature, bug fix, refactor, test, chore, style.
- Model notes with explicit Blocker and Carry forward flags.
- Model streaks from copied/shared standup updates, not generated drafts.
- Activity terminal and draft editor use scoped dark terminal tokens regardless of app theme.
- Keep team workspace, team lead view, and Slack bot outside MVP.
