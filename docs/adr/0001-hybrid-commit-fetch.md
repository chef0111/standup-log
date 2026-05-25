# ADR 0001: Hybrid commit fetch (default branch + Search Commits)

## Status

Accepted — 2026-05-25

## Context

StandupLog scopes **Activity Signals** to a user-local **Workday**. Sync used `GET /repos/{owner}/{repo}/commits` without a branch ref, which returns **default branch only**. Developers who commit to feature branches with open PRs see no activity until merge — breaking the standup funnel for common team workflows.

Alternatives considered:

| Approach                                | Rejected because                                 |
| --------------------------------------- | ------------------------------------------------ |
| PR-centric fetch only                   | Misses branch work without an open PR            |
| Events API (PushEvents)                 | Noisy, harder Workday filtering, more pagination |
| Default branch only + manual notes only | Does not fix the core signal gap                 |

## Decision

Use a **hybrid fetch** per selected repository per Workday:

1. **Default-branch list** — existing `since`/`until` commit list (shipped work on main).
2. **Search Commits API** — `author:{login}+repo:{owner}/{repo}` across all refs (workday filtered client-side).
3. **Open PR head branches** — for each open PR authored by the user, list commits on `head.ref` within the workday (bypasses Search index lag for feature-branch-only work).

Merge by SHA, assign `signal_disposition`:

- `shipped` — on default branch fetch, or PR has `merged_at`
- `in_progress` — search-only, or linked PR is `open`

Replace `(user_id, workday)` rows on successful sync (delete stale SHAs; empty result clears the workday).

## Consequences

- **Positive:** Feature-branch work appears on the authoring Workday before merge.
- **Positive:** AI draft and UI can distinguish in-flight vs landed work.
- **Negative:** Search API rate limit (30 req/min authenticated) — mitigated by existing repo batch delay and tier repo caps.
- **Negative:** `committer-date` uses GitHub's date indexing; may differ slightly from local Workday bounds for edge timezone cases — acceptable vs missing data entirely.

## References

- [CONTEXT.md](../../CONTEXT.md) — Activity Signal, In progress signal, Shipped signal
- [docs/specs/2026-05-25-post-mvp-hardening-design.md](../specs/2026-05-25-post-mvp-hardening-design.md)
