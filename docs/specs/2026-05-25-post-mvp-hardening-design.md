# Post-MVP Hardening Design

**Date:** 2026-05-25  
**Status:** Approved for implementation

## Goal

Harden the solo-developer standup funnel before team features. Priority: **Activity Signal correctness** for feature-branch workflows, then reliability, onboarding, reminders, CI, and AI safety.

## Phase 1 — Activity Signals

- Hybrid GitHub fetch (default branch + Search Commits)
- `signal_disposition`: `shipped` | `in_progress`
- `pr_merged_at` on activity rows
- Workday-scoped sync replace (no stale rows)
- Terminal badges + AI prompt tuning

See [ADR 0001](../adr/0001-hybrid-commit-fetch.md).

## Phase 2 — Manual Note UX

- Empty Sources copy for feature-branch / refresh hint
- Quick-add note templates
- Refresh affordance in Sources header

## Phase 3 — Reliability

- Copy/streak only after DB persist succeeds
- Sync error surfacing in `useActivitySync`
- Consistent `userFacingMessage` for Supabase errors
- OAuth and sign-out error feedback

## Phase 4 — Onboarding & ops

- Base `profiles` migration + `on_auth_user_created` trigger
- Onboarding guard at `(app)` layout level
- Delete-account cascade documented in README

## Phase 5 — Reminders

- Daily recurring notification trigger (not one-shot DATE)
- Reschedule on settings / permission changes

## Phase 6 — Testing & CI

- GitHub Actions: `bun run test`, `bun run lint`
- Integration tests for sync, disposition, copy
- Behavioral policy tests (replace source-string tests)

## Phase 7 — AI safety

- Daily generation cap (reuse `ai_generation_events`)
- Complete `docs/ai-content-safety.md` checklist
- Prompt fixtures for in-progress vs shipped language

## Deferred

Team workspace, Slack bot, Jira/Linear read/write, Pro billing (Stripe/IAP).

## Success criteria

- Open PR commits visible on authoring Workday
- Shipped / In progress badges in Sources
- Streak advances only when copy persist succeeds
- Fresh clone + migrations → profile row without client race
- CI runs tests on every PR
- Zero-commit resync clears stale activity
