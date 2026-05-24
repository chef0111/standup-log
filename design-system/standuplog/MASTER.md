# Design System Master File

> **LOGIC:** When building a specific page, first check `design-system/pages/[page-name].md`.
> If that file exists, its rules **override** this Master file.
> If not, strictly follow the rules below.

---

**Project:** StandupLog  
**Visual direction:** Travel Canvas (TripGlide-inspired premium mobile)

---

## Travel Canvas (authoritative overrides)

These rules **override** generic ui-ux-pro-max suggestions below.

| Element          | Light                         | Dark                   | Usage                          |
| ---------------- | ----------------------------- | ---------------------- | ------------------------------ |
| Canvas           | `#F5F5F5`                     | `#1C1C1E`              | Screen background              |
| Elevated surface | `#FFFFFF`                     | `#2C2C2E`              | Cards, sheets                  |
| Text primary     | `#0F172A`                     | `#FAFAFA`              | Headings, body                 |
| Text muted       | `#64748B`                     | `#A1A1AA`              | Subtitles, labels              |
| Primary CTA      | `#18181B` pill                | `#FAFAFA` pill on dark | h-14, rounded-full             |
| Success accent   | `#22C55E`                     | `#22C55E`              | Streak, copy confirmation only |
| Card radius      | `24px` continuous             | same                   | `borderCurve: 'continuous'`    |
| Shadow elevated  | `0 4px 24px rgba(0,0,0,0.08)` | softer                 | Cards                          |
| Shadow floating  | `0 8px 32px rgba(0,0,0,0.12)` | softer                 | Tab bar, footers               |
| Tab bar          | `#18181B` floating pill       | `#FAFAFA` icons active | Inset from edges               |

**Typography:** Inter. Greeting: small muted label + bold name (sentence case). Section titles: `text-base font-semibold`. No uppercase editorial hero titles on tab screens.

**Spacing rhythm:**

| Token       | Value          | Usage                |
| ----------- | -------------- | -------------------- |
| screen-x    | 20px (`px-5`)  | Horizontal inset     |
| section-gap | 20px (`gap-5`) | Between blocks       |
| card-pad    | 20px (`p-5`)   | Inside cards         |
| card-gap    | 12px (`gap-3`) | Inside card sections |
| row-gap     | 8px (`gap-2`)  | List rows only       |

**Anti-patterns:** thin borders on every card, emoji icons, neon gradients, uppercase hero titles on tabs, docked full-width tab bar, unbounded Standup scroll.

**Sign-in exception:** Full-bleed hero image on sign-in only; authenticated app uses light canvas.

---

## Global Rules

### Color Palette

| Role        | Hex       | CSS Variable         |
| ----------- | --------- | -------------------- |
| Canvas      | `#F5F5F5` | `--background`       |
| Elevated    | `#FFFFFF` | `--card`, `--sheet`  |
| Primary CTA | `#18181B` | `--primary`          |
| Text        | `#0F172A` | `--foreground`       |
| Muted       | `#64748B` | `--muted-foreground` |
| Success     | `#22C55E` | `--success`          |

### Shadow Depths

| Token               | Value                         | Usage                  |
| ------------------- | ----------------------------- | ---------------------- |
| `--shadow-elevated` | `0 4px 24px rgba(0,0,0,0.08)` | Cards                  |
| `--shadow-floating` | `0 8px 32px rgba(0,0,0,0.12)` | Tab bar, sticky footer |
| `--radius-card`     | `1.5rem`                      | Card corners           |

---

## Component Specs

### Buttons

- **Primary:** `h-14 rounded-full bg-zinc-900 text-white` (light) / inverted in dark
- **Secondary:** muted fill, no heavy border
- **Settings rows:** pressable list row with chevron, not stacked outline buttons

### Cards

- **Elevated:** white bg, `rounded-3xl`, `boxShadow: var(--shadow-elevated)`, no border
- **Inset:** `bg-muted/40`, no visible border

### Navigation

- Floating dark pill tab bar on all platforms
- Scroll content clears tab inset via `useTabBarScrollPadding`

---

## Pre-Delivery Checklist

- [ ] No emojis as icons (Lucide only)
- [ ] Touch targets ≥ 44pt
- [ ] Light mode text contrast ≥ 4.5:1
- [ ] `prefers-reduced-motion` respected
- [ ] No Tailwind `rotate-*` on Lucide `Icon` (wrap in `View`)
- [ ] Single padding layer in shell (no double `pt-6`)
