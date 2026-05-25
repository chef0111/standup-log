# Standup History — design spec

**Date:** 2026-05-25

## Summary

Replace the Weekly tab with **Standup history**: a list of saved **Standup Updates** sorted by **Workday** (newest first). Row tap opens the existing **Read view** (`/standup/read?workday=`). **Weekly Summary** remains available from Home's "This week" card at `/history/summary`.

## Manual QA checklist

- [ ] History tab shows saved standups, newest Workday first
- [ ] Tapping a row opens Read view with copy actions and markdown content
- [ ] Empty state shows when no standups saved; "Generate standup" navigates to Standup tab
- [ ] Free tier: standups older than 30 days do not appear
- [ ] Home "View all standups" opens History tab
- [ ] Home "This week" card opens Weekly Summary at `/history/summary`
- [ ] After copying or editing a standup, returning to History refreshes the list
- [ ] Copied badge appears on rows where `copied_at` is set

## Filter QA (2026-05-25)

- [ ] Preset **7 days** / **30 days** / **All** updates list correctly
- [ ] From/To pickers narrow list; inverted range auto-clamps
- [ ] Text search filters by summary text and Workday label
- [ ] Clear filters resets to All + empty query
- [ ] Filtered empty state shows when items exist but none match
