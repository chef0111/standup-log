# StandupLog MVP — implementation phases (design spec)

**Status:** Draft for review  
**Scope:** MVP only (must-have + should-have from `PRD.md`; excludes team workspace / Slack bot / post-MVP)  
**Source of truth:** root `PRD.md` + `CONTEXT.md`

---

## How to use this doc

Each phase ends with a **Phase gate** checklist: observable outcomes that prove the phase is done before starting dependent work. Phases are ordered to minimize rework: establish identity and data contracts before GitHub volume, before AI cost, before engagement metrics.

Work items use `- [ ]` (unchecked). Mark `- [x]` when done.

---

## Rollup — all phases complete

Use this as a release-readiness index; gates should stay checked only after verification.

- **Phase 0** — Project spine & contracts (all gates) - [DONE]
- **Phase 1** — Identity, session, account lifecycle (all gates) - [DONE]
- **Phase 2** — GitHub access: repo discovery & explicit selection (all gates) - [DONE]
- **Phase 3** — Activity ingestion (commits + PR metadata) (all gates) - [DONE]
- **Phase 4** — Manual notes (text-first) (all gates) - [DONE]
- **Phase 5** — Standup record + draft editor, manual path (all gates) - [DONE]
- **Phase 6** — AI draft via Edge proxy (all gates) - [DONE]
- **Phase 7** — Copy formats, clipboard, streak on copy (all gates) - [DONE]
- **Phase 8** — Entitlements: free vs Pro (all gates)
- **Phase 9** — Engagement: weekly summary + reminders (all gates)
- **Phase 10** — Should-have sweep (all gates)
- **Phase 11** — Hardening, analytics, beta readiness (all gates)

---

## Structuring options (pick implicit default below)


| Approach                         | Idea                                                                                              | Upside                                                | Downside                                        |
| -------------------------------- | ------------------------------------------------------------------------------------------------- | ----------------------------------------------------- | ----------------------------------------------- |
| **A. Layer cake**                | Infra → DB → all APIs → all UI                                                                    | Clear ownership by layer                              | Long time before usable “generate standup” demo |
| **B. Pure vertical slices**      | Each slice is end-to-end feature                                                                  | Fast user-visible value                               | Repeated schema/API churn early                 |
| **C. Risk-first spine** (chosen) | Thin E2E path first (auth → repos → fake/static draft → copy), then real GitHub + AI + engagement | Validates hardest unknowns early; demo stays runnable | Requires discipline to avoid “throwaway” UI     |


**Chosen:** **C — risk-first spine**, with **B-style vertical completion** inside the core “generate → edit → copy” slice once schema stabilizes after Phase 4.

---

## Phase 0 — Project spine & contracts - [DONE]

**Outcome:** Repo runs on device/simulator with stable navigation split (pre-auth vs authed), env wiring, and documented env vars for Supabase + GitHub app settings.

### Checklist

- Confirm Expo SDK aligns with project rules (Expo v55 docs) for any native modules added later (notifications, clipboard, dev client if needed).
- Add baseline app structure: onboarding stack vs main app tabs (or equivalent) per PRD journeys.
- Supabase client bootstrap (anon key, URL) with safe failure UX when missing config.
- Define error taxonomy for user-facing strings (auth, GitHub, AI, network) — no code detail here, just product-level categories.

### Phase gate

- Cold start app in dev: navigates through shell screens without crash; config missing shows actionable setup message (dev-only acceptable if documented).

---

## Phase 1 — Identity, session, account lifecycle - [DONE]

**Outcome:** User can sign in with GitHub (per PRD), stay signed in across restarts, sign out, and delete account + associated stored data.

### Checklist

- GitHub OAuth sign-in flow (Supabase Auth provider or equivalent pattern consistent with PRD).
- Persist session; handle expired/revoked session with re-link path.
- Server-side user row (or profile) for settings storage contract.
- Account deletion: removes user-owned rows (notes, standups, activity metadata, settings) per PRD privacy section.
- Minimal profile UI (avatar/username) if PRD implies it for trust.

### Phase gate

- Fresh install → sign in → force-close → reopen → still authed.
- Delete account → subsequent sign-in behaves like new user (no old notes/standups visible).

---

## Phase 2 — GitHub access: repo discovery & explicit selection - [DONE]

**Outcome:** User sees available repos, selects up to **free tier limit (3)** with clear messaging, can change selection later, handles permission errors.

### Checklist

- Fetch repo list for authenticated GitHub user (public + private as permitted).
- Onboarding UI: explicit multi-select with search/filter if list is large.
- Persist `selected_repos` in user settings; enforce tier cap (3 on free).
- Settings screen to add/remove repos within cap.
- Empty states: zero repos, revoked access, token invalid.

### Phase gate

- User completes onboarding with 1–3 repos; restart device; selection persists.
- Attempting 4th repo on free tier is blocked with explanation + upgrade placeholder (billing may be stubbed until Phase 8).

---

## Phase 3 — Activity ingestion (commits + PR metadata) - [DONE]

**Outcome:** For a chosen **Workday** (user-local calendar day), app pulls **Activity Metadata** into storage: commits authored by user in selected repos + PR metadata where possible; **no diffs**.

### Checklist

- GitHub REST integration for commits scoped to selected repos + date window.
- **Workday selection:** native calendar/date picker on Generate screen; default previous local day on each open; today + past only; free-tier minimum date enforced in picker (30 days).
- Author matching strategy (GitHub user id vs email edge cases) documented in implementation plan, not here — product requirement: “my commits” only.
- PR metadata enrichment where feasible (title, number, url, state; merge info if available).
- Dedup commits across refs where possible.
- Sync triggers: manual refresh minimum; optional background constraints evaluated against battery/rate limits.
- Store rows for audit/regenerate; respect retention windows once Phase 8 exists (30-day free vs full Pro).

### Phase gate

- Pick a known day with commits: UI shows commit list (or debug screen) matching GitHub for that Workday across selected repos.

---

## Phase 4 — Manual notes (text-first) - [DONE]

**Outcome:** User can CRUD text notes per Workday with **Blocker** and **Carry forward** toggles; notes feed standup composition rules.

### Checklist

- Create/edit/delete note quickly (<10s path per PRD).
- Toggles: Blocker, Carry forward (both allowed together per PRD edge case).
- Default note association: current Workday; allow viewing past days if product requires it (match PRD “notes tied to Workday”).
- Carry-forward surfacing rules for Today section (placeholder + carried notes, not AI-inferred plans).

### Phase gate

- Notes appear in standup composition UI even with **zero commits** for that Workday (supports PRD manual path).

---

## Phase 5 — Standup record + draft editor (manual path first) - [DONE]

**Outcome:** User can produce a **Standup Update** for a Workday with Yesterday / Today / Blockers sections **without AI** (template + inserted notes + optional commit bullets), edit in sheet/dialog, save `edited_draft`.

### Checklist

- Data model for standup per user per Workday (draft vs final semantics per PRD: AI draft vs edited).
- **Workday picker** on Generate screen (native date picker; defaults to yesterday each open).
- Today: editable placeholder + carry-forward notes assembled deterministically.
- Blockers: blocker notes OR editable “No blockers” default — never inferred from commits.
- Yesterday: deterministic summary from stored Activity Metadata (can be simple bullet aggregation initially).
- Regenerate action stubbed or noop until Phase 6 — UX slot exists.

### Phase gate

- Airplane mode: user can still compose/edit/copy a standup from notes + offline-visible commits metadata (if cached) OR notes-only path.

---

## Phase 6 — AI draft via Edge proxy (Anthropic / operator key)

**Outcome:** AI generates improved Yesterday wording + work-type classification; still respects **no hallucinated Today plans** and **no inferred blockers**.

### Checklist

- Supabase Edge Function HTTP contract: input bundle (activity metadata + notes + user instructions), output structured sections + classifications.
- Call **Anthropic Claude** from Edge Function using **operator** API key (secret); app sends user JWT/session only—**never** ship provider keys to the client. No per-user AI vendor login in the product flow.
- Failure modes: timeout, 5xx, malformed output → fall back to Phase 5 manual path, never block copy.
- Regenerate: re-call AI with same or edited inputs.
- Prompt constraints as PRD policies (tone, no surveillance language, no diff content).

### Phase gate

- With network: AI draft populates Yesterday; Today/Blockers still follow PRD rules after AI.
- With AI disabled/broken: user still reaches copy with manual path.

---

## Phase 7 — Copy formats, clipboard, streak on copy

**Outcome:** One-tap copy supports **plain**, **Slack**, **Jira**, **Notion-style** markdown; default format in settings; toast confirmation; **Daily Streak** increments **once per Workday** when copy happens (and only if not already counted).

### Checklist

- Formatter module per preset; snapshot tests in implementation plan.
- `expo-clipboard` integration + failure messaging.
- Persist `format_used` / `shared_at` (or equivalent) per PRD analytics needs.
- Streak logic: current + longest; define “copy” vs “share” if share sheet added later (MVP: clipboard counts if PRD equates under “copied/shared”).

### Phase gate

- Copy → paste into Slack/Jira/Notion manual test: structure preserved.
- Copy twice same Workday: streak does not double-increment.

---

## Phase 8 — Entitlements: free vs Pro (MVP economics)

**Outcome:** Free = **3 repos, 30-day history, all formats, weekly preview**; Pro = **unlimited repos, full history, full Weekly Summary**. Upgrade prompts at limit surfaces.

### Checklist

- Entitlement source of truth (Stripe subscription vs manual Pro flag for beta) — **open implementation choice**; product behavior is fixed above.
- Enforce repo count + history window in sync queries.
- Upgrade surfaces: repo cap, history cap, weekly summary locked sections.

### Phase gate

- Free user cannot exceed 3 selected repos or 30-day fetch window; Pro user can (test with flagged account).

---

## Phase 9 — Engagement: weekly summary + reminders

**Outcome:** Weekly summary view: aggregates by **Work Type**; free **limited preview**; Pro **full**. Push notification at user-set time, default 09:00 local, **only if prior Workday not copied** (per PRD).

### Checklist

- Weekly aggregation queries from stored standups/classifications.
- Preview gating UX (what exactly is blurred/limited — align with PRD open question on preview limits; pick a simple rule in implementation plan).
- Expo Notifications: permission UX, scheduling, re-schedule on settings change.
- “Copied yesterday?” signal feeding reminder eligibility.

### Phase gate

- Toggle system time / simulate: reminder fires per rules; does not fire when standup already copied for prior Workday.

---

## Phase 10 — Should-have sweep (still MVP scope)

**Outcome:** PRD should-haves shipped or consciously deferred with issue links.

### Checklist

- Voice note (≤30s): microphone permission → **on-device OS speech-to-text** → edit transcript → save as Manual Note; retry + text fallback per PRD; **no** Edge upload for audio/STT, **no** cloud STT API.
- Editable **Work Type** on commits/signals affecting weekly summary.
- Empty activity UX: no commits path + confirm copy for “no update” if product chooses that branch (PRD open question — pick in implementation plan).
- Settings: default copy format (if not already in Phase 7).

### Phase gate

- Voice happy path + deny-permission path + transcription-failure path all non-blocking for core standup flow.

---

## Phase 11 — Hardening, analytics, beta readiness

**Outcome:** Instrumentation for PRD funnel metrics; crash/ANR budget; privacy copy; store submission readiness checklist.

### Checklist

- Analytics events list from PRD §13 wired with privacy review (no commit bodies).
- Rate limit handling for GitHub + backoff UX.
- Content safety review for AI outputs (abuse, sensitive repo names) — product-level handling: user edit always wins.
- Beta / TestFlight / Play internal testing gates.

### Phase gate

- Core funnel measurable end-to-end: install → GitHub → select repos → generate → copy (time-to-first-copy experiment possible).

---

## Explicitly out of this document (post-MVP)

Not in MVP build scope (reference only):

- Team workspace
- Shared team standup feed
- Lead aggregation dashboard
- Slack bot auto-post
- Direct Jira/Notion write APIs

### Scope check (optional)

- Release candidate reviewed: no post-MVP items above shipped as MVP

---

## Spec self-review (brainstorming checklist)

- **Placeholders:** Entitlement billing mechanism left as implementation choice; weekly preview exact limit references PRD open question — resolve during implementation planning.
- **Consistency:** Aligns with PRD: clipboard-only sharing, no diff storage, Today/Blockers rules, streak on copy, reminder rule.
- **Scope:** Single MVP delivery track; should-have included as Phase 10 to avoid blocking core launch on voice.
- **Ambiguity:** “Share” beyond clipboard not required for MVP gate; if added later, redefine streak eligibility in ADR or PRD amendment.

---

## Next step after you approve this spec

Per brainstorming workflow: transition to **implementation plan** authoring (task breakdown per phase into tickets/PRs). No product code until plan exists.