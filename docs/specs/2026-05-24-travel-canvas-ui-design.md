# StandupLog UI Redesign — Travel Canvas

**Status:** Approved for implementation  
**Supersedes:** Hero Continuity visual rules in [`2026-05-24-ui-redesign-design.md`](2026-05-24-ui-redesign-design.md)  
**Design system:** [`design-system/standuplog/MASTER.md`](../../design-system/standuplog/MASTER.md)

---

## Goal

Pivot authenticated screens to a TripGlide-inspired **light canvas**: elevation-based cards, generous spacing, sentence-case greetings, and a floating dark tab bar. Preserve Standup UX behaviors (draft-first, sticky actions, capped nested scrolls).

---

## Visual language

| Token | Light | Dark |
|-------|-------|------|
| Canvas | `#F5F5F5` | `#1C1C1E` |
| Elevated | `#FFFFFF` | `#2C2C2E` |
| Text | `#0F172A` | `#FAFAFA` |
| Muted | `#64748B` | `#A1A1AA` |
| Primary pill | `#18181B` | `#FAFAFA` on dark elevated |
| Success | `#22C55E` | `#22C55E` |

**Typography:** Inter. Greeting pattern: "Hello, {name}" — no uppercase editorial titles on tabs.

**Elevation:** Cards use soft shadow, not borders. `borderCurve: 'continuous'`, radius 24px.

---

## Layout primitives

### `AppScreenShell`

- Single light `ScrollView` on `bg-background`
- Optional `ScreenHeader` (greeting row, not dark hero band)
- One padding layer: `px-5 gap-5`
- Optional sticky `ScreenFooter` with top shadow

### `FloatingTabBar`

- Dark charcoal pill, inset from screen edges, all platforms

### Components

- `Card variant="elevated"` — primary surface
- `SettingsRow` — list navigation inside elevated cards
- Primary CTA: charcoal pill `h-14`

---

## Screen specs

### Home

- Light header with greeting + avatar + streak chip
- Elevated standup widget card
- Two stat tiles in a row
- GitHub connection as subtle chip

### Standup (generate / read)

- Light header + date chip
- Draft first, collapsible sources
- Sticky footer with shadow
- Activity/notes max height ~256px internal scroll

### Weekly

- Week range in header
- Elevated bucket cards; locked at 60% opacity

### Settings

- Grouped elevated sections with SettingsRow
- Copy format pill chips
- Reminder: `gap-3` between toggle and time picker

### Onboarding / Setup

- Light canvas + elevated repo picker

### Sign-in

- Keep full-bleed hero image
- CTA uses charcoal pill

---

## Out of scope

- Backend, AI, copy logic
- New product features

---

## Spec self-review

- Aligns with CONTEXT.md terminology
- Preserves draft-first Standup UX from prior spec
- No TBD placeholders
