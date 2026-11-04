---
name: signal-loop
description: Coordinate the signal loop, which turns production signals that nobody handles yet (errors, slow paths, session replay friction, papercuts) into small, proven fix PRs, one lane per fix. Use when a scheduled task starts a signal-loop run, when a signal-loop lane ends, or when the user asks what users hit that nobody is fixing.
---

# Signal loop

The signal loop finds what goes wrong for real users that nobody handles yet, and fixes the small, certain part of it. A scheduled task starts a **coordinator** run. The coordinator collects signals, drops the ones someone already covers, verifies and ranks the rest, keeps the items above a fixed bar, and starts one `fix` lane per kept signal.

This loop shares its ledger, its lane contract, and its weekly ritual with the `quality-loop` skill. Each loop has its own WIP limit.

## Settings

Read the `quality-loop` settings in the user's agent instructions. This loop uses the same scope, critical paths, ledger, and approval bot, and adds the **signal sources**. When they are missing, stop and ask the user once.

## Coordinator run

1. **Load.** Pull the ledger and read `limits.md`. When `Paused` is `yes`, record a `no-op` run and end. Settle the lanes that ended, as the **Settle** section of the `quality-loop` skill says.
2. **Collect.** Read every signal source for the window since the last run:
   - new and rising error tracking issues in the scope's code or pages;
   - slow or failing spans, endpoints, and consumers in APM, logs, and metrics, against the same window one week earlier;
   - the observations of the scope's session replay scanners;
   - the papercut and team channels, and the inbox reports of the scouts the settings name.

   Done when each source returned data, or its failure is written down with the tool and the error.
3. **Drop the covered ones.** A signal is covered when a person replied to it, an issue is assigned, a PR or ticket links it, another scout reported it, or `signals.md` already holds it. Record it as `covered by <who or link>`. The loop works only on the signals nobody handles.
4. **Verify.** Find the code area of each remaining signal, and decide whether it is real: seen more than once, or once with an error trace or a session that shows it. A signal you cannot tie to code and evidence becomes `rejected: <reason>`.
5. **Triage.** Score each real signal as reach × severity × confidence:
   - reach is the number of users or teams affected in the window;
   - severity is 3 for data loss, wrong or missing delivery, or a blocked task; 2 for a visible error with a workaround; 1 for a cosmetic problem;
   - confidence is 1 when one small `fix` PR can fix it and a test can show the fix, and 0 otherwise.

   A signal with confidence 0 becomes `needs decision`, with one line for the ritual report. Mark each signal `critical` or `normal` by the critical paths.
6. **Cut.** The free slots are this loop's WIP limit minus its running lanes. Keep signals in score order until the slots are full. At most one `critical` lane is open at a time. The rest stay `candidate` for the next run. Done when every collected signal has a status in `signals.md`, and `lanes.md` lists the kept ones as `planned`.
7. **Start lanes.** Start one lane per kept signal, as `quality-loop/references/lane.md` says, with PR type `fix` and the signal's evidence and metric in the brief. Record each lane in `lanes.md`, then end the turn. The end of a normal lane wakes this thread.

The run is done when every collected signal has a status and every kept signal has a lane.

## Learn

The `quality-loop` ritual covers this loop. It grades this loop's PRs, reads each fix's 14-day retro, and reports the `needs decision` signals to the user.
