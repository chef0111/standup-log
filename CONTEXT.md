# StandupLog

StandupLog helps developers turn their work activity and notes into a ready-to-share daily standup update.

## Language

**Standup Update**:
A concise daily status message for one **Workday**, stored as a single markdown document with a **Standup Summary** and structured sections (what was done, what you are focusing on, blockers, and optional metrics). The developer edits and copies it when ready to share.
_Avoid_: Report, timesheet, task log

**Workday**:
A user-local calendar day used as the boundary for collecting activity into a **Standup Update**. On **Generate standup**, the default target is the current local calendar day; the developer may choose another allowed day (today or a past day) from a calendar date picker.
_Avoid_: Shift, rolling window, repo day

**Standup history**:
A chronological list of saved **Standup Updates** by **Workday**, within the user's allowed history window. Opening a row shows the **Read view** for that **Workday**. Deleting from **Standup history** removes the saved **Standup Update** for that **Workday** only—**Manual Notes** and **Activity Signals** for that day remain.
_Avoid_: Draft list, archive, log browser

**Generate standup**:
The primary workflow where a developer selects a **Workday**, edits the **Standup Update** markdown, reviews **Sources**, saves, and runs **Generate** or **Regenerate** for an **AI Draft**.
_Avoid_: Draft screen, editor tab, compose view

**Read view**:
A read-only presentation of a saved **Standup Update** for a **Workday**, with **Copy summary** and **Copy full**. Editing opens **Generate standup** for the same **Workday**—there is no separate quick-edit overlay.
_Avoid_: Preview modal, read sheet, quick edit

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
A week-level view of a developer's **Activity Signals** and copied **Standup Updates**, grouped by **Work Type** for the current calendar week. Opened from Home's week snapshot—not a primary tab.
On the free tier, the preview shows the top **two Work Types** by commit count; remaining types require Pro.
_Avoid_: Timesheet, productivity report, performance review

**Morning Reminder**:
A local push notification at the developer's chosen time (default 09:00 local) when the **previous Workday**'s **Standup Update** was not copied or shared.
_Avoid_: Daily spam, generation reminder, login nudge

**Work Type**:
A developer-editable category applied to an **Activity Signal** to explain the kind of work represented (feature, bug fix, refactor, test, chore, or style).
_Avoid_: Label, tag, productivity bucket

**Daily Streak**:
A count of consecutive **Workdays** where the developer copied or shared a **Standup Update** (via **Copy summary** or **Copy full**).
_Avoid_: Login streak, note streak, generation streak

**Standup Summary**:
The opening section of a **Standup Update**—one or two short paste-ready sentences for chat (roughly 40–60 words), stating the main theme or outcome for that **Workday** and blockers only when relevant. Detailed commit and note evidence lives in the sections below, not repeated line-for-line in the summary.
_Avoid_: Weekly roll-up, executive report, AI title only

**Copy summary**:
Copies only the **Standup Summary** portion of a **Standup Update** in the selected copy format. Available when the summary contains real prose (after **Generate** or manual edit).
_Avoid_: Copy standup, copy draft, share snippet

**Copy full**:
Copies the entire **Standup Update** markdown in the selected copy format.
_Avoid_: Export, download, copy all sections

**AI Draft**:
A suggested markdown **Standup Update** for a chosen **Workday**, generated from that day's **Activity Signals** and **Manual Notes** when the developer taps **Generate** or **Regenerate**. It does not run automatically on open. Includes a **Standup Summary** plus the structured sections.
_Avoid_: Final update, automated standup, posted status

**Activity Signal**:
Evidence of work that can inform a **Standup Update** but does not define final truth.
_Avoid_: Proof, audit log, timesheet source

**In progress signal**:
An **Activity Signal** disposition for work not yet on the repository default branch—including feature-branch commits, open pull requests, and work merged to a non-default branch (e.g. staging) before it lands on default (e.g. main). Shown with an in-progress badge in **Sources**; the **AI Draft** describes it as work done with PR still open or not yet on default, not as merged or shipped to production.
_Avoid_: Planned task, Jira ticket, todo

**Shipped signal**:
An **Activity Signal** disposition for work present on the repository default branch (e.g. main). Shown with a shipped badge in **Sources**. Merging to a non-default branch alone does not make an **Activity Signal** shipped.
_Avoid_: Deployed, released, closed ticket

**Activity Metadata**:
Stored non-code details from GitHub activity, such as commit messages, timestamps, repository names, and PR metadata.
_Avoid_: Code snapshot, diff, source archive

**Selected Repository**:
A GitHub repository the developer has explicitly chosen as an input for **Activity Signals**.
_Avoid_: Connected repo, tracked repo, watched repo

**Sources**:
The **Activity Signals** and **Manual Notes** tied to the active **Workday** on **Generate standup**. Shown in a collapsible panel below the draft editor.
_Avoid_: Inputs panel, evidence drawer, sync log

## Relationships

- A **Workday** produces zero or one **Standup Updates** per developer.
- A **Standup Update** may include zero or more **Manual Notes** via **Sources**.
- A **Voice Note** is a capture method for a **Manual Note**, not a separate status artifact.
- A **Standup Update** for a **Workday** describes work on that calendar day—not "yesterday" relative to when the developer opens the app later.
- The focusing-on portion of a **Standup Update** (**Focusing on** section) may include **Unfinished Notes** carried forward by the developer.
- The blockers portion includes **Blocker Notes** from that **Workday** or an editable empty default.
- A **Weekly Summary** summarizes **Activity Signals** and copied **Standup Updates** for the current calendar week, not raw work time. It is reached from Home, not the tab bar.
- **Standup history** lists saved **Standup Updates** by **Workday** within the entitlement history window; each row opens **Read view** for that **Workday**.
- A **Weekly Summary** groups **Activity Signals** by **Work Type**; free tier shows the top two Work Types by commit count.
- A **Morning Reminder** fires only when the prior **Workday**'s **Standup Update** has no copy timestamp.
- A **Daily Streak** advances only when the developer copies or shares a **Standup Update**.
- A **Standup Update** begins with a **Standup Summary**, then structured sections: what I did, focusing on, blockers, and optional metrics.
- **Standup Summary** prose is produced by **AI Draft** on Generate; without Generate it shows instructional placeholder copy the developer replaces by hand.
- **Copy summary** is available only when **Standup Summary** contains real prose; **Copy full** copies the entire document.
- **Regenerate** replaces the whole **Standup Update**, including **Standup Summary**, from that **Workday**'s current **Sources**.
- An **AI Draft** becomes a **Standup Update** only after developer review and save.
- A **Standup Update** is composed from one or more **Activity Signals** and **Manual Notes**, then approved by the developer.
- **Activity Metadata** may be retained to regenerate and audit **AI Drafts**, but code diffs are not retained.
- Each **Activity Signal** has a disposition: **Shipped signal** or **In progress signal**, derived from branch/PR state at sync time. In promotion workflows (e.g. feature → staging → main), work stays **In progress signal** until it reaches the default branch.
- A developer may choose one or more **Selected Repositories** as sources of **Activity Signals**.
- Opening **Generate standup** defaults to the current local **Workday**; the developer may pick another allowed day via the calendar. The chosen **Workday** persists while **Generate standup** remains mounted and can be opened via deep link (e.g. from **Read view** or Home).
- When a **Workday** has no **Activity Signals** and no **Manual Notes**, a guided flow can produce an explicit no-update **Standup Update** the developer edits before copying.
- **Read view** is read-only; changing a **Standup Update** always happens on **Generate standup** for the same **Workday**.
- When **Sources** span more than one **Selected Repository**, **Activity Signals** are grouped by repository in the activity display.

## Example dialogue

> **Dev:** "If I pick May 19 on the calendar, whose commits go into that standup?"
> **Domain expert:** "Only activity and notes for **Workday** May 19. The standup you see is _for_ that day. The app defaults to the previous local **Workday** when you first open **Generate standup**; change the picker to browse another day."

> **Dev:** "I tapped Edit on **Read view**—where do I land?"
> **Domain expert:** "**Generate standup** for the same **Workday**, with the full markdown editor and **Sources**—not a quick-edit sheet."

## Flagged ambiguities

- "day" was used ambiguously between calendar day, rolling standup window, and repo timezone; resolved: **Workday** means user-local calendar day.
- "commits" could imply authoritative proof of work; resolved: commits are **Activity Signals**, and the developer owns the final **Standup Update**.
- "connected repo" could imply every accessible GitHub repository; resolved: **Selected Repository** means explicit developer selection with read-only access.
- "Yesterday / Today / Blockers" as section labels on a past **Workday** was confusing; resolved: template sections are **What I did**, **Focusing on**, **Blockers**, plus optional **Metrics / Notes**—wording is relative to the selected **Workday**, not the clock day the app is opened.
- "blocker" could be guessed from negative commit wording; resolved: blockers come only from developer-owned **Blocker Notes** on that **Workday** or the editable default.
- "voice note" could imply durable audio storage; resolved: **Voice Note** is an optional capture path whose transcript becomes the **Manual Note**.
- "voice note" could imply cloud transcription cost; resolved: MVP **Voice Note** uses **device-local** speech-to-text only—no cloud STT API in the core flow.
- "weekly summary" could imply time tracking or performance measurement; resolved: **Weekly Summary** groups **Activity Signals** and copied standups by **Work Type** for the current week.
- "streak" could mean app usage or draft generation; resolved: **Daily Streak** advances only when a **Standup Update** is copied or shared.
- "GitHub data" could imply source code retention; resolved: StandupLog stores **Activity Metadata** and standups, not code diffs.
- "Bring your own AI account" or per-user AI vendor login could add onboarding friction; resolved: users authenticate only to StandupLog; **AI Draft** assistance is operator-controlled inference—no separate end-user AI account step in the core flow.
- "workday default" could mean time-of-day rules or remembering last pick; resolved: default to previous local calendar day on first mount of **Generate standup**; picker selection persists while that screen stays mounted; deep links may set the **Workday** explicitly.
- "calendar" could imply future planning or custom month UI; resolved: native date picker only; selectable days are today and past; free tier caps how far back the calendar goes.
- "quick edit" or read-only overlay could imply a separate edit surface; resolved: **Read view** is read-only; edit always routes to **Generate standup**.
- "copy standup" could mean summary-only or full document; resolved: **Copy summary** and **Copy full** are distinct actions with different availability by screen.
