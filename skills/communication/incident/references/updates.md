# Update formats

Write them with the user's writing voice skill when there is one.

## One-line update

For the incident channel, when the lead asks for a quick status. One paragraph, in this order:

1. What customers experienced, and whether it still happens or stopped at a time in UTC.
2. How many customers were hit, out of how many.
3. The affected count with its named whole and percentage. Add other counts only when they change the next action.
4. What we are doing about the affected ones.
5. What is lost for good.

> Workflow emails were marked failed though they went out, until 14:20 UTC; the 15:00 batch ran without failures. 40 of 2,400 customer teams that send email (1.7%) were hit: 12,000 of 90,000 runs in the window (13.3%) had their email step marked failed, and the provider's counter shows they all went out. Three of those runs (0.03%) missed later steps; we are resuming them without resending. Lost for good: about 5,000 of 61,000 email events from 13:50 to 14:20 (8%, estimated from the day before), and at most 30 of 1,900 automation runs (1.6%, bounded) that never started.

## Detailed update

Headed sections, each a few short lines:

- **What happened**: what customers saw, in plain words.
- **Impact**: the pinned numbers.
- **Cause**: the mechanism and the cause, one sentence each. Say what is still unknown.
- **What we are doing**: the fix, the alert, the recovery, each with its state.
- **Next update**: when, or on what event.

## Impact canvas

For customer comms. Copy the canvas the skill's settings name, or else an earlier incident canvas in the same workspace. Build it in this order, top to bottom:

1. **TL;DR**: three to five lines that a reader stops after.
2. **Handover**: keep it current from the first draft. What has run and what has not, and each open task with its owner and deadline, including when recoverable data expires.
3. **Summary**: the one-line update, and a timeline chart when the window has a shape worth seeing.
4. **Breakdown**: one table per dimension of the impact checklist. Attach a CSV when a table runs long.
5. **Customers**: one table per region. Columns: priority, customer, project, revenue, owner, items hit, items affected, wrong records, recoverable loss, permanent loss, what did not run on the customer's side, and who does what next.
6. **Recovery**: the runs or items to recover, the script, and the warnings, such as a rerun action that would resend.

Write the canvas in small edits and read it back after each one. A write that times out may still have applied, so read before you retry. Check code blocks after a write: a canvas can replace spaces with non-breaking spaces, which breaks a pasted shell command.
