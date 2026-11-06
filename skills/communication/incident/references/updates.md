# Update formats

All three are drafts. The incident lead posts them. Write them with the user's writing voice skill when there is one. Use pinned numbers only, each with its percentage.

## One-line update

For the incident channel, when the lead asks for a quick status. One paragraph, in this order:

1. The state: still happening, or stopped at a time in UTC.
2. How many customers were hit, out of how many.
3. What customers lost or now see wrongly: hit, then affected, then wrong records, each with its percentage.
4. What we are doing about the affected ones.
5. What is lost for good.

> Bleeding stopped at 14:20 UTC, and the 15:00 batch ran without failures. 40 of 2,400 customer teams that send email (1.7%) were hit: 12,000 of 90,000 runs in the window (13.3%) had their email step marked failed, though the provider's counter shows the emails went out. Of those 12,000, 11,970 (99.75%) went on normally, 27 (0.2%) stopped at their last step, and 3 runs in 2 teams (0.03%) missed later steps; we are resuming those 3 without resending. Lost for good: about 5,000 email events from 13:50 to 14:20 (estimated from the day before), and at most 30 automation runs in 5 teams that never started (bounded).

Leave out the internal team when the update is about customers, or give it as its own clause.

## Detailed update

Headed sections, each a few short lines:

- **What happened**: what customers saw, in plain words.
- **Impact**: the pinned numbers.
- **Cause**: the mechanism and the cause, one sentence each. Say what is still unknown.
- **What we are doing**: the fix, the alert, the recovery, each with its state.
- **Next update**: when, or on what event.

## Impact canvas

For customer comms. Copy the structure of earlier incident canvases in the same workspace when they exist. Build it in this order, top to bottom:

1. **TL;DR**: three to five lines that a reader stops after.
2. **Handover**: when someone takes over. What has run and what has not, the open tasks, and who owns each.
3. **Summary**: the one-line update, and a timeline chart when the window has a shape worth seeing.
4. **Breakdown**: one table per dimension of the impact checklist. Attach a CSV when a table runs long.
5. **Customers**: one table per region. Columns: priority, customer, project, revenue, owner, items hit, items affected, wrong records, recoverable loss, permanent loss, what did not run on the customer's side, and who does what next.
6. **Recovery**: the runs or items to recover, the script, and the warnings, such as a rerun action that would resend.

Write the canvas in small edits and read it back after each one. A write that times out may still have applied, so read before you retry. Check code blocks after a write: a canvas can replace spaces with non-breaking spaces, which breaks a pasted shell command.
