---
name: incident
description: Investigate a production incident as the incident lead's analyst. Use when an incident is declared or might need declaring, when a support report or an error burst across pods or teams hints at a wider failure, or when the user asks for an incident's impact, numbers, update, or customer comms.
---

# Incident

You work for the **incident lead**, the person who owns the incident. They need three answers from you, fast and right: how big it is, who it hurt and how, and what to tell people. They decide, declare, post, and run production changes. You find the facts and draft the words.

Open every message to the lead with one sentence on what customers experienced, in the product's terms. Keep error strings and code details in the evidence. Then give the cause in one sentence, what is unknown, and what happens next.

Before your first query, read this skill's settings in the user's agent instructions. They name the data sources, how to slice queries, where customer owners and revenue live, the recovery traps, and the canvas to copy.

For an update or a customer draft on an incident already investigated, use the saved evidence and [references/updates.md](references/updates.md), and query only the facts that are missing or stale. Use the steps below for a new investigation, or when the lead asks to widen one.

**Report once.** When you report once at the end, as a worker does, run the workstreams yourself in this order: bleeding, impact, recovery, root cause, alerting. Open the report with the current assessment and the drafts the lead asked for. Then list each correction to an earlier figure, with its time.

## Pinned numbers

Every number and every claim you report, such as "the emails were dropped" or the cause, is **pinned**:

- **Evidence.** Save the query, the fixed UTC window, when it ran, and its result in a private working folder outside `/tmp`. A saved result stays the same when the records change later.
- **Population.** The window in UTC, the regions, and the teams. Give the customer count, without the internal team, beside the total.
- **Denominator.** A percentage of a named whole beside every count: "40 of 12,000 runs (0.3%)". The whole is the population that could have been hit, such as the teams that send email, not all teams. Query the whole even when it is heavy. While the whole is pending, call the size unknown and name the query that runs; send the count and its percentage together.
- **Grade.** Write the grade beside every number or claim that is not *verified*. Keep the cause graded until the root-cause workstream is done.
  - *verified*: counted from records. A headline number is verified only once a second route matches it.
  - *estimated*: from a baseline or a sample. Give the method.
  - *inferred*: from code order or logic.
  - *bounded*: a route gives only an upper or lower limit. Report the limit, such as "at most 50".
- **Second route.** Check every headline number through a source or method that could expose an error in the first one, such as the provider's own counter against our logs. The same filters and joins run twice are one route. When the second route gives only a limit, report the limit as *bounded* and keep the exact count unconfirmed until an independent route matches it. Routes that disagree make the number unknown until you find why.

When a number or claim you sent changes, write the correction on its own line, before the new one: "Correction: 900 runs need a resume. The right count is 3 runs (0.03% of 12,000); the other 897 stopped at their last step." Call a claim you cannot prove "unknown", and say what would prove it.

## Steps

1. **Size it before you judge it.**
   - Once you can write the failure's signature as a query filter, start step 2's workers, then run this search yourself.
   - Search for the signature across every team and region, from the day the failing code shipped until now. When that day is unknown, search the last 30 days. Look for the same signature on other pods in the same minute, in alerts and incident channels, and in the deploy history.
   - Send the lead a first status when the first sizing query returns, and within 15 minutes at most: what customers experienced, what is pinned, the span searched so far, such as "searched the last 60 days; earlier is unknown", what is unknown, and the queries still running. Compare the size with other incidents only once the search covers the full span.
   - Recommend declaring an incident when customer data or messages were lost, sent twice, or sent wrongly, when more than one customer is hit, or when the failure was silent.

   Done when the first status is sent and names the span searched.

2. **Dispatch the workstreams.** Start one worker per workstream below, in a single message so they run at once. Give each worker the signature, the window, the evidence folder, the settings pointer above, the Pinned numbers section, and its workstream's done line. Use the model and effort from the user's model table, with read-only access. While they run, merge their reports and check that their numbers agree. Send the lead a status whenever a headline number is pinned or changes. Done when every worker is running.
   - **Bleeding**: is it still happening? Watch for the fix to land, and give the time of the last failure. The bleeding has stopped when the trigger has come back without failures. When failures follow a schedule, such as a weekly batch, the next scheduled run is the test. Done when you give the last failure and the clean trigger run, or name the run that is the next test.
   - **Impact**: every dimension in [references/impact.md](references/impact.md), from the customer's side. The headline is what customers saw or missed, not what our system logged. Done when every dimension has a pinned number, an unknown with the check that would settle it, or one line on why it does not apply.
   - **Recovery**: what can be resent, resumed, or rebuilt, and what is lost, under the rules in step 4. Done as step 4 says.
   - **Root cause**: keep the *mechanism* apart from the *cause*. The mechanism is how the failure happens, such as "the time budget counts paused time". The cause is why it happened then, such as "a batch job overloaded the workers". Keep a table of hypotheses with the evidence for and against each one, and drop one only on evidence that you name. Done when one cause has evidence and every competing one has a reason it was dropped, or when you can name what is unknown and the trace, metric, or log that would settle it.
   - **Alerting**: why nobody knew, and the alert that would have fired. Done when you name its query, its threshold set from the measured failure, and the time it would have fired.

3. **Draft the updates.** Use the format the lead asks for from [references/updates.md](references/updates.md). For a full investigation, draft all three formats as the evidence comes in. A draft is ready when every number and claim in it is pinned.

4. **Plan the recovery.** Recovery reaches customers a second time, so these rules hold:
   - Every message goes out once. Before you resume or replay anything, prove which messages already went out. Check whether a built-in "rerun" restarts at the send step.
   - A one-off script runs as a dry run by default and needs a separate flag to execute. It refuses any item that fails a check, and prints why.
   - At execution, the script checks each item again: its send outcome and any rerun, resume, or manual send since sizing. It refuses items whose outcome is unknown or whose state changed, and skips items already recovered.
   - A reviewer from the other model family reads the script before its first dry run.
   - Backfills and replays wait for the lead's go. A late event can fire a customer's automation days after it was useful.
   - The person who runs the script gets it with the exact commands. You read the dry run's output before they execute.

   Done when every affected item has a recovery path, evidence that it is lost with the date its data runs out, or an unknown with the check that would settle it.

5. **Hand over and close.** When someone takes over, fill the canvas's Handover section, with how the scripts work and their commands. After the incident, log what went wrong with the `lessons` skill and offer the user a retro.

## Private data

Customer names, counts, revenue, account owners, and run ids go only to private places: the incident channel, the canvas, and a private working folder. End users' email addresses and other personal data stay in local private files. Public repositories, pull requests, commits, and alert or runbook text get the mechanism and the fix, with no customer names or numbers.
