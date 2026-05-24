# Standup Page Overrides

> **PROJECT:** StandupLog
> **Generated:** 2026-05-24 19:43:39
> **Page Type:** Landing / Marketing

> ⚠️ **IMPORTANT:** Rules in this file **override** the Master file (`design-system/MASTER.md`).
> Only deviations from the Master are documented here. For all other rules, refer to the Master.

---

## Page-Specific Rules

### Layout Overrides

- **Max Width:** 1200px (standard)
- **Layout:** Full-width sections, centered content
- **Sections:** 1. Hero with headline/image, 2. Value prop, 3. Key features (3-5), 4. CTA section, 5. Footer

### Spacing Overrides

- No overrides — use Master spacing

### Typography Overrides

- No overrides — use Master typography

### Color Overrides

- **Strategy:** Hero: Brand primary or vibrant. Features: Card bg #FAFAFA. CTA: Contrasting accent color

### Component Overrides

- Avoid: Jump directly without transition
- Avoid: Let nav overlap first section content
- Avoid: No feedback after submit

---

## Page-Specific Components

- No unique components for this page

---

## Recommendations

- Effects: transform: translateY(scroll), position: fixed/sticky, perspective: 1px, scroll-triggered animations
- Navigation: Use scroll-behavior: smooth on html element
- Navigation: Add padding-top to body equal to nav height
- Forms: Show loading then success/error state
- CTA Placement: Hero (sticky) + Bottom
