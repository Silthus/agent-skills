---
name: signal-loop
description: Coordinate the signal loop, which turns production signals that nobody handles yet (errors, slow paths, session replay friction, papercuts) into small, proven fix PRs, one lane per fix. Use when a scheduled task starts a signal-loop run, when a signal-loop lane ends, or when the user asks what users hit that nobody is fixing.
---

# Signal loop

The signal loop finds what goes wrong for real users that nobody handles yet, and fixes the small, certain part of it. It is also the **one door** for fixes that agents find in its scope: a side fix, a review Follow-up, or a bug a lane's test found arrives as a `candidate` row, never as its own thread, unless the user asks for that fix by name. A scheduled task starts a **coordinator** run. The coordinator collects signals, drops the ones someone already covers, verifies and ranks the rest, keeps the items above a fixed bar, and starts one `fix` lane per kept signal.

The **Inbox** of the settings' analytics product is the shared work queue. Teammates and their agents pick work from it too, so the loop takes its intake from the Inbox and writes its claims, PRs, and work log back to it. The loop's own collectors run beside the Inbox until it finds what they find. A **miss** is a real signal that a collector found and no Inbox report holds. The misses are the feedback that improves the Inbox, and their share is the measure of when a collector can stop.

This loop shares its ledger, its lane contract, and its weekly ritual with the `quality-loop` skill. Each loop has its own WIP limit.

## Settings

Read the `quality-loop` settings in the user's agent instructions. This loop uses the same scope, critical paths, ledger, and approval bot, and adds the **signal sources**, the Inbox filters, whether the Inbox accepts filed reports, and the switch-over bar. When they are missing, stop and ask the user once.

## Coordinator run

1. **Load.** Pull the ledger and read `limits.md`. When `Paused` is `yes`, record a `no-op` run and end. Settle the lanes that ended, as the **Settle** section of the `quality-loop` skill says. As in that skill, `Paused: no` is the loop's start, so its lanes skip **Start** in `impact`.
2. **Intake.** Read the Inbox first:
   - `inbox-reports-list` with the scouts and source products the settings name, `created_after` set to the window start, and `unclaimed=true`;
   - `inbox-reports-list` with `assignee=mine`, for the reports this user's agents still hold.

   Read each report's work log with `inbox-report-artefacts-list` before you act on it. Each report becomes a signal row keyed by its report id.
3. **Collect.** Read every collector source for the window since the last run:
   - new and rising error tracking issues in the scope's code or pages;
   - slow or failing spans, endpoints, and consumers in APM, logs, and metrics, against the same window one week earlier;
   - the observations of the scope's session replay scanners;
   - the papercut and team channels;
   - the `candidate` rows that agents filed through the one door since the last run.

   For each finding, search the Inbox with `inbox-reports-search` on its error text or problem. A matching report keys the row. A finding with no matching report is a candidate **miss**. Done when each source returned data, or its failure is written down with the tool and the error.
4. **Drop the covered ones.** A signal is covered when someone **owns** it:
   - a person said they are on it;
   - an issue is assigned;
   - a PR or ticket links it;
   - its Inbox report has an assignee, a linked PR, or `already_addressed: true`;
   - `signals.md` already holds it with a status other than `candidate` or `reopened`.

   An unclaimed Inbox report is evidence, not an owner. Record each covered signal as `covered by <who or link>`. The loop works only on the signals nobody owns, plus the `reopened` rows, which go through Verify and Triage again.
5. **Verify.** Find the code area of each remaining signal, and decide whether it is real: seen more than once, or once with an error trace or a session that shows it. A one-door candidate is real when a real input can take its code path. A signal you cannot tie to code and evidence becomes `rejected: <reason>`. A real signal with no Inbox report is a miss: write `miss` in its `Report` column.
6. **File the misses.** When the settings say the Inbox accepts filed reports, file each real miss with `inbox-reports-create`: the problem, the evidence links, the code area, and the repository. Search first, and file only when `inbox-reports-search` still finds no report. Write `filed <report id>` in the row's `Report` column. When filing is off or refused, the row keeps `miss` and the lane runs from the ledger row.
7. **Triage.** Run **Worth** from the `impact` skill on each real signal; its worth line is the row. A park verdict sets the status to `parked: <tripwire>`, and the row waits for its tripwire. Score each signal with a build verdict as reach × severity × confidence:
   - reach is the number of users or teams affected in the window;
   - severity is 3 for data loss, wrong or missing delivery, or a blocked task; 2 for a visible error with a workaround; 1 for a cosmetic problem;
   - confidence is 1 when one small `fix` PR can fix it and a test can show the fix, and 0 otherwise.

   A signal with confidence 0 becomes `needs decision`, with one line for the ritual report. Mark each signal `critical` or `normal` by the critical paths.
8. **Cut.** The free slots are this loop's WIP limit minus its running lanes. Keep signals with a build verdict in score order until the slots are full. Slots may stay empty: a run that starts no lane because nothing earned one is a good run. At most one `critical` lane is open at a time. The rest stay `candidate` for the next run. Done when every collected signal has a status and a `Report` value in `signals.md`, and `lanes.md` lists the kept ones as `planned`.
9. **Claim and start lanes.** For each kept signal with a report, claim the report with `inbox-reports-claim` before its lane starts. When another person holds the claim, the signal is covered by them: never pass `takeover`. Start one lane per kept signal, as `quality-loop/references/lane.md` says, with PR type `fix`, the signal's evidence and metric, and the report id and `claim_id` in the brief. Record each lane, its report id, and its `claim_id` in `lanes.md`, then end the turn. The end of a normal lane wakes this thread.

The run is done when every collected signal has a status, every kept signal has a lane, and every kept signal with a report has a claim.

## Learn

The `quality-loop` ritual covers this loop. It grades this loop's PRs, reads each fix's 14-day retro, reports the `needs decision` signals to the user, and sends the week's misses to the Inbox's makers, as `quality-loop/references/learn.md` says.
