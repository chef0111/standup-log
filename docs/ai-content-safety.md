# AI content safety (MVP)

## Principles

- **User edit always wins** — AI output is a draft; the developer copies only after review.
- **No code retention** — prompts include commit messages and note text only, never diffs.
- **No surveillance tone** — system prompt forbids productivity-scoring or monitoring language.
- **No invented facts** — blockers and plans must come from notes; carry-forward only when flagged.

## Operator controls

- Prompt constraints live in `supabase/functions/generate-standup-draft/index.ts`.
- `work_type` values are validated server-side against an allowlist.
- Free tier rate limit on generations (`ai_generation_events`).

## Not in MVP

- Automated moderation API on model output.
- Client-side sanitization beyond normal text editing.

## Review checklist before beta

- [ ] Generate drafts for repos with sensitive names — confirm neutral wording.
- [ ] Confirm AI failure falls back to manual compose without blocking copy.
- [ ] Confirm no API keys in the mobile bundle.
