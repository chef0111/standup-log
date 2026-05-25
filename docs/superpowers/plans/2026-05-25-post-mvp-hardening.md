# Post-MVP Hardening Implementation Plan

> **For agentic workers:** Use subagent-driven-development per phase. **One git commit per phase** (see commit table below).

**Goal:** Harden solo standup funnel — feature-branch Activity Signals, reliability, onboarding, reminders, CI, AI caps.

**Architecture:** Hybrid GitHub fetch + disposition field; phase-level commits on `feat/post-mvp-hardening`.

**Tech Stack:** Expo SDK 55, Supabase, Vitest, GitHub Actions, Bun

---

## Commit strategy

| Phase | Message |
| ----- | ------- |
| Docs | `docs: post-MVP hardening spec, ADR-0001, and CONTEXT glossary` |
| 1 | `feat(activity): hybrid commit fetch with shipped/in-progress signals` |
| 2 | `feat(notes): manual note UX for empty and in-progress workdays` |
| 3 | `fix(reliability): surface copy, sync, and auth errors correctly` |
| 4 | `fix(onboarding): profiles bootstrap migration and layout guard` |
| 5 | `fix(reminders): daily recurring standup reminder schedule` |
| 6 | `ci: add GitHub Actions and hardening integration tests` |
| 7 | `fix(ai): edge proxy rate limits and prompt safety fixtures` |

---

## Phase 1 tasks

- [ ] Migration: `signal_disposition`, `pr_merged_at`
- [ ] Types + `assignSignalDisposition` + search fetch + hybrid merge
- [ ] Sync replace logic
- [ ] Activity terminal badges
- [ ] AI prompt + request builder
- [ ] Unit tests
- [ ] Gate: `bun run test` && `bun run lint` → commit

## Phase 2–7

See [design spec](../../specs/2026-05-25-post-mvp-hardening-design.md) for scope. Each phase ends with test/lint gate and single commit.
