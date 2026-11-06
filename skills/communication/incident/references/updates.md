# Update formats

All three are drafts. The incident lead posts them. Write them with the user's writing voice skill when there is one. Use pinned numbers only, each with its percentage.

## One-line update

For the incident channel, when the lead asks for a quick status. One paragraph, in this order:

1. The state: still happening, or stopped at a time in UTC.
2. How many customers were hit, out of how many.
3. What customers lost, as hit, then affected, with percentages.
4. What we are doing about the affected ones.
5. What is lost for good.

> Bleeding stopped at 14:20 UTC. 40 of 2,400 sending teams (1.7%) were hit: 12,000 runs had their email step marked failed after the email was sent. 11,960 (99.7%) went on normally. 6 runs in 4 teams (0.05%) missed later steps, and we are resuming them without resending. About 5,000 email events from 13:50 to 14:20 are lost, and about 30 automations in 5 teams never fired.

Leave out the internal team when the update is about customers, or give it as its own clause.

## Detailed update

Headed sections, each a few short lines:

- **What happened**: what customers saw, in plain words.
- **Impact**: the pinned numbers, with the internal team apart.
- **Cause**: the mechanism and the cause, one sentence each. Say what is still unknown.
- **What we are doing**: the fix, the alert, the recovery, each with its state.
- **Next update**: when, or on what event.

## Impact canvas

For customer comms. Copy the structure of earlier incident canvases in the same workspace when they exist. Build it in this order, top to bottom:

1. **TL;DR**: three to five lines that a reader stops after.
2. **Handover**: when someone takes over. What has run and what has not, the open tasks, and who owns each.
3. **Summary**: the one-line update, and a timeline chart when the window has a shape worth seeing.
4. **Breakdown**: one table per dimension of the impact checklist. Attach a CSV when a table runs long.
5. **Customers**: one table per region. Columns: priority, customer, project, revenue, owner, items hit, items affected, lost items (recoverable and not), downstream effect.
6. **What did not run on the customer's side**: per customer, in plain words.
7. **Who to contact and what to do**: per customer, what they need to do, or what we will do for them.
8. **Recovery**: the runs or items to recover, the script, and the warnings, such as a rerun action that would resend.

Write the canvas in small edits and read it back after each one. A write that times out may still have applied, so read before you retry. Check code blocks after a write: a canvas can replace spaces with non-breaking spaces, which breaks a pasted shell command.
