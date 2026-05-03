# StandupLog

StandupLog helps developers turn their work activity and notes into a ready-to-share daily standup update.

## Language

**Standup Update**:
A concise daily status message organized around what was done, what comes next, and blockers.
_Avoid_: Report, timesheet, task log

**Workday**:
A user-local calendar day used as the default boundary for collecting activity into a **Standup Update**.
_Avoid_: Shift, rolling window, repo day

**Manual Note**:
A developer-authored note that adds work context not obvious from commits.
_Avoid_: Time entry, task, journal entry

**Voice Note**:
A spoken **Manual Note** that becomes useful to StandupLog after transcription.
_Avoid_: Recording, audio log, meeting note

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
A suggested **Standup Update** generated from **Activity Signals** and **Manual Notes** before developer approval.
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
- The Today section of a **Standup Update** may include **Unfinished Notes** carried forward by the developer.
- The Blockers section of a **Standup Update** includes **Blocker Notes** or an editable "No blockers" default.
- A **Weekly Summary** summarizes generated **Standup Updates**, not raw work time.
- A **Weekly Summary** groups **Activity Signals** by **Work Type**.
- A **Daily Streak** advances only when the developer copies or shares a **Standup Update**.
- An **AI Draft** becomes a **Standup Update** only after developer review.
- A **Standup Update** is generated from one or more **Activity Signals** and approved by the developer.
- **Activity Metadata** may be retained to regenerate and audit **AI Drafts**, but code diffs are not retained.
- A developer may choose one or more **Selected Repositories** as sources of **Activity Signals**.

## Example dialogue

> **Dev:** "If I open StandupLog in the morning, which commits become yesterday's update?"
> **Domain expert:** "Use the developer's local **Workday** as the boundary, then let them change the date manually."

## Flagged ambiguities

- "day" was used ambiguously between calendar day, rolling standup window, and repo timezone; resolved: **Workday** means user-local calendar day.
- "commits" could imply authoritative proof of work; resolved: commits are **Activity Signals**, and the developer owns the final **Standup Update**.
- "connected repo" could imply every accessible GitHub repository; resolved: **Selected Repository** means explicit developer selection with read-only access.
- "Today" could imply predicted future work; resolved: Today is based on editable placeholder text and developer-owned **Unfinished Notes**, not AI prediction from commits.
- "blocker" could be guessed from negative commit wording; resolved: blockers come only from developer-owned **Blocker Notes** or the editable default.
- "voice note" could imply durable audio storage; resolved: **Voice Note** is an optional capture path whose transcript becomes the **Manual Note**.
- "weekly summary" could imply time tracking or performance measurement; resolved: **Weekly Summary** groups generated **Standup Updates** by work type.
- "streak" could mean app usage or draft generation; resolved: **Daily Streak** advances only when a **Standup Update** is copied or shared.
- "GitHub data" could imply source code retention; resolved: StandupLog stores **Activity Metadata** and standups, not code diffs.
