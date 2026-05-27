# AI content safety (MVP)

## Principles

- **User edit always wins** — AI output is a draft; the developer copies only after review.
- **No code retention** — prompts include commit messages and note text only, never diffs.
- **No surveillance tone** — system prompt forbids productivity-scoring or monitoring language.
- **No invented facts** — blockers and plans must come from notes; carry-forward only when flagged.

## Operator controls

- Prompt constraints live in `supabase/functions/generate-standup-draft/index.ts`.
- `work_type` values are validated server-side against an allowlist.
- Free tier rate limits on generations (`ai_generation_events`): **50/day** and **5/minute** (Pro bypasses limits).

## Not in MVP

- Automated moderation API on model output.
- Client-side sanitization beyond normal text editing.

## Review checklist before beta

- [x] Generate drafts for repos with sensitive names — confirm neutral wording (system prompt forbids judgmental language).
- [x] Confirm AI failure falls back to manual compose without blocking copy (`fallback: true` responses; client uses manual compose).
- [x] Confirm no API keys in the mobile bundle (`ANTHROPIC_API_KEY` is Edge Function secret only).
- [x] In-progress commits tagged in prompt; system prompt forbids claiming unmerged work as shipped.
- [x] Daily generation cap enforced server-side for free tier.

## Usage alerting

Monitor `ai_generation_events` volume in Supabase. Alert when:

- Daily inserts for a single `user_id` exceed 15 (75% of free cap).
- Project-wide daily inserts spike above expected beta cohort size.
