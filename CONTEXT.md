# StandupLog

StandupLog helps developers turn their work activity and notes into a ready-to-share daily standup update.

## Language

**Standup Update**:
A concise daily status message for one **Workday**, stored as a single markdown document (what was done, what you are focusing on, blockers, and optional metrics). The developer edits and copies it when ready to share.
_Avoid_: Report, timesheet, task log

**Workday**:
A user-local calendar day used as the boundary for collecting activity into a **Standup Update**. On **Generate standup**, the default target is the previous local calendar day; the developer may choose another allowed day (today or a past day) from a calendar date picker.
_Avoid_: Shift, rolling window, repo day

**Manual Note**:
A developer-authored note that adds work context not obvious from commits.
_Avoid_: Time entry, task, journal entry

**Voice Note**:
A spoken **Manual Note** transcribed on the **device** using OS speech recognition before save; not sent to operator servers for transcription in the MVP path.
_Avoid_: Recording, audio log, meeting note, cloud transcription

**Unfinished Note**:
A **Manual Note** marked or inferred by the developer as relevant to future work.
_Avoid_: Task, todo, planned ticket

**Blocker Note**:
A **Manual Note** the developer marks as preventing or slowing progress.
_Avoid_: Risk, issue, bug

**Weekly Summary**:
A week-level view of a developer's generated **Standup Updates** grouped by work type.
_Avoid_: Timesheet, productivity report, performance review

**Work Type**:
A developer-editable category applied to an **Activity Signal** to explain the kind of work represented.
_Avoid_: Label, tag, productivity bucket

**Daily Streak**:
A count of consecutive **Workdays** where the developer copied or shared a **Standup Update**.
_Avoid_: Login streak, note streak, generation streak

**AI Draft**:
A suggested markdown **Standup Update** for a chosen **Workday**, generated from that day's **Activity Signals** and **Manual Notes** when the developer taps Generate. It does not run automatically on open.
_Avoid_: Final update, automated standup, posted status

**Activity Signal**:
Evidence of work that can inform a **Standup Update** but does not define final truth.
_Avoid_: Proof, audit log, timesheet source

**Activity Metadata**:
Stored non-code details from GitHub activity, such as commit messages, timestamps, repository names, and PR metadata.
_Avoid_: Code snapshot, diff, source archive

**Selected Repository**:
A GitHub repository the developer has explicitly chosen as an input for **Activity Signals**.
_Avoid_: Connected repo, tracked repo, watched repo

## Relationships

- A **Workday** produces zero or one **Standup Updates** per developer.
- A **Standup Update** may include zero or more **Manual Notes**.
- A **Voice Note** is a capture method for a **Manual Note**, not a separate status artifact.
- A **Standup Update** for a **Workday** describes work on that calendar day—not "yesterday" relative to when the developer opens the app later.
- The focusing-on portion of a **Standup Update** may include **Unfinished Notes** carried forward by the developer.
- The blockers portion includes **Blocker Notes** from that **Workday** or an editable empty default.
- A **Weekly Summary** summarizes generated **Standup Updates**, not raw work time.
- A **Weekly Summary** groups **Activity Signals** by **Work Type**.
- A **Daily Streak** advances only when the developer copies or shares a **Standup Update**.
- An **AI Draft** becomes a **Standup Update** only after developer review.
- A **Standup Update** is generated from one or more **Activity Signals** and approved by the developer.
- **Activity Metadata** may be retained to regenerate and audit **AI Drafts**, but code diffs are not retained.
- A developer may choose one or more **Selected Repositories** as sources of **Activity Signals**.
- Opening **Generate standup** defaults to the previous local **Workday**; the developer may pick another allowed day via the calendar and that selection persists while they stay on the screen.

## Example dialogue

> **Dev:** "If I pick May 19 on the calendar, whose commits go into that standup?"
> **Domain expert:** "Only activity and notes for **Workday** May 19. The standup you see is *for* that day. The app defaults to the previous local **Workday** when you first open Generate standup; change the picker to browse another day."

## Flagged ambiguities

- "day" was used ambiguously between calendar day, rolling standup window, and repo timezone; resolved: **Workday** means user-local calendar day.
- "commits" could imply authoritative proof of work; resolved: commits are **Activity Signals**, and the developer owns the final **Standup Update**.
- "connected repo" could imply every accessible GitHub repository; resolved: **Selected Repository** means explicit developer selection with read-only access.
- "Yesterday / Today / Blockers" as UI labels on a past **Workday** was confusing; resolved: one markdown **Standup Update** per **Workday** with template sections (what I did, focusing on, blockers).
- "blocker" could be guessed from negative commit wording; resolved: blockers come only from developer-owned **Blocker Notes** on that **Workday** or the editable default.
- "voice note" could imply durable audio storage; resolved: **Voice Note** is an optional capture path whose transcript becomes the **Manual Note**.
- "voice note" could imply cloud transcription cost; resolved: MVP **Voice Note** uses **device-local** speech-to-text only—no cloud STT API in the core flow.
- "weekly summary" could imply time tracking or performance measurement; resolved: **Weekly Summary** groups generated **Standup Updates** by work type.
- "streak" could mean app usage or draft generation; resolved: **Daily Streak** advances only when a **Standup Update** is copied or shared.
- "GitHub data" could imply source code retention; resolved: StandupLog stores **Activity Metadata** and standups, not code diffs.
- "Bring your own AI account" or per-user AI vendor login could add onboarding friction; resolved: users authenticate only to StandupLog; **AI Draft** assistance is operator-controlled inference—no separate end-user AI account step in the core flow.
- "workday default" could mean time-of-day rules or remembering last pick; resolved: default to previous local calendar day on first open; picker selection is kept while the Generate screen stays in focus.
- "calendar" could imply future planning or custom month UI; resolved: native date picker only; selectable days are today and past; free tier caps how far back the calendar goes.
