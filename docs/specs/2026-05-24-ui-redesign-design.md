# StandupLog UI Redesign — Hero Continuity

**Status:** Approved for implementation  
**Source:** [UI redesign plan](https://github.com) + sign-in screen reference  
**Design system:** [`design-system/standuplog/MASTER.md`](../../design-system/standuplog/MASTER.md)

---

## Goal

Extend the sign-in screen's **dark editorial hero + continuous rounded sheet** pattern across all authenticated screens while improving Standup UX (draft-first, sticky actions, capped nested scrolls).

---

## Visual language

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| Hero bg | `#000000` | `#09090b` (zinc-950) | Top zone behind nav |
| Hero fg | `#FFFFFF` | `#FAFAFA` | Titles on hero |
| Sheet bg | `#FFFFFF` | `#18181b` (zinc-900) | Main scroll surface |
| Sheet radius | `40px` continuous | same | Overlaps hero (`-mt-5`) |
| Primary pill | `#18181b` on light sheet | `#FAFAFA` on dark sheet | h-14, rounded-full |
| Success accent | `#22C55E` | `#22C55E` | Streak, copy confirmation only |

**Typography:** Inter (400 body, 600–900 headings). Hero titles: uppercase, `font-black`, `tracking-wide`. Body: sentence case.

**Icons:** Lucide only. No emoji as icons.

---

## Layout primitives

### `AppScreenShell`

- Optional `ScreenHero` (compact, not full-bleed photo except sign-in)
- `SheetSurface` with `rounded-t-[40px]`, `borderCurve: 'continuous'`
- ScrollView with tab-bar padding
- Optional sticky `ScreenFooter` for primary CTAs

### `BrandLockup`

- "S" badge in circle + "StandupLog" wordmark (sign-in pattern)

### Button variants

- **Pill primary:** `rounded-full h-14` — main CTAs
- **Card variants:** `sheet` (flat on sheet), `inset` (nested stat tiles)

---

## Screen specs

### Home

- Hero: "Welcome back, {name}", streak pill, small avatar
- Sheet: standup widget (primary CTA), compact 2-col stats
- No full profile card; no redundant "StandupLog" h2

### Standup (generate)

- Hero: workday label + date chip + streak
- Sheet order: **Draft editor first** → collapsible **Sources** (activity + notes)
- Sticky footer: Generate/Regenerate + Copy summary
- Activity terminal + notes: max height ~256px, internal scroll

### Standup (read)

- Same hero + sheet; header: Summary, Copy, Edit

### Weekly

- Hero: week range title
- Sheet: work-type buckets; locked buckets at 60% opacity + upgrade

### Settings

- Hero: account name + avatar
- Sheet: grouped `SettingsSection` rows
- Reminder: hide DateTimePicker when toggle off

### Onboarding / Setup

- Hero continuity; repository picker on sheet with footer CTA

---

## Accessibility

- Hero text contrast ≥ 4.5:1
- Touch targets ≥ 44pt (pill buttons h-14 = 56px)
- `prefers-reduced-motion`: skip sheet entrance animation
- Focus visible on web

---

## Out of scope

- Backend, AI, copy logic changes
- New product features
- Weekly drill-down to commits (future)

---

## Spec self-review

- No TBD placeholders
- Aligns with PRD journeys and CONTEXT.md terminology
- Single implementation track across 6 commits
