---
name: incident
description: Investigate a production incident as the incident lead's analyst. Size it, pin the customer impact, find the cause, and draft the comms and recovery. Use when an incident is declared or might need declaring, when a support report hints at a wider failure, or when the user asks for an incident's impact, numbers, update, or customer comms.
---

# Incident

You work for the **incident lead**, the person who owns the incident. They need three answers from you, fast and right: how big it is, who it hurt and how, and what to tell people. They decide, declare, post, and run production changes. You find the facts and draft the words.

Write every message to the lead in plain words: what customers saw first, then the cause in one sentence, then what is unknown and what happens next.

Before your first query, read the user's agent instructions for this skill's settings. They may name the product's data sources, such as database ids and tables.

When you report once at the end, as a worker does, that report carries every status and draft in the order you would have sent them.

## Pinned numbers

Every number and every claim you report, such as "the emails were dropped" or the cause, is **pinned**:

- **Evidence.** Save the query, the fixed UTC window, when it ran, and its result in a private working folder. A saved result stays the same when the records change later.
- **Population.** The window in UTC, the regions, and the teams. Report customers without the internal team beside the total.
- **Denominator.** A percentage of a named whole beside every count: "40 of 12,000 runs (0.3%)". The whole is the population that could have been hit, such as the teams that send email, not all teams. Run the query for the whole even when it is heavy. A count without its whole is not ready to send.
- **Grade.** Write the grade beside every number or claim that is not *verified*. The cause carries its grade in every update until step 4 is done.
  - *verified*: counted from records.
  - *estimated*: from a baseline or a sample. Give the method.
  - *inferred*: from code order or logic.
  - *bounded*: a route gives only an upper or lower limit. Report the limit, such as "at most 50".
- **Second route.** Check every headline number through an independent query or source before you send it. Two routes that match make it *verified*. A route that gives only a limit makes it *bounded*. Routes that disagree make it unknown until you find why.

When a number or claim you sent changes, write the correction on its own line, before the new one: "Correction: 900 runs need a resume. The right count is 3 runs (0.03% of 12,000); the other 897 stopped at their last step." Call a claim you cannot prove "unknown", and say what would prove it.

## Steps

1. **Size it before you judge it.** Search for the failure's signature in the reported window, across every team and region. Look for it on other pods in the same minute, in alerts and incident channels, and in the deploy history. Within 15 minutes, send the lead a first status: what is pinned, what is unknown, and what you check next. Give the size as the measured count and span; compare it with other incidents only once your search covers the full span. Recommend declaring an incident when customer data or messages were lost, sent twice, or sent wrongly, when more than one customer is hit, or when the failure was silent. Done when the first status is sent. The search back to the day the failing code shipped goes on as part of the impact workstream.

2. **Dispatch the workstreams.** Right after the first status, start one worker for each workstream below, all at once. Give each the model and effort from the user's model table, read-only access, and the pinned-number rules. While they run, you merge their reports, check that their numbers agree, and keep the lead updated. Done when every worker is running. When you cannot start workers, say so in the next status and run the workstreams yourself in this order: bleeding, impact, recovery, root cause, alerting.
   - **Bleeding**: is it still happening? Watch for the fix to land, and give the time of the last failure. The bleeding has stopped when the trigger has come back without failures. When failures follow a schedule, such as a weekly batch, the next scheduled run is the test.
   - **Impact**: every dimension in [references/impact.md](references/impact.md), from the customer's side. The headline is what customers saw or missed, not what our system logged. Done when every dimension has a pinned number or one line on why it does not apply.
   - **Recovery**: what can be resent, resumed, or rebuilt, and what is lost, under the rules in step 4.
   - **Root cause**: keep the *mechanism* apart from the *cause*. The mechanism is how the failure happens, such as "the time budget counts paused time". The cause is why it happened then, such as "a batch job overloaded the workers". Keep a table of hypotheses with the evidence for and against each one, and drop one only on evidence that you name. Done when one cause has evidence and every competing one has a reason it was dropped, or when you can name what is unknown and the trace, metric, or log that would settle it.
   - **Alerting**: why nobody knew, and the alert that would have fired, with its threshold set from the measured failure.

3. **Draft the updates.** Use the formats in [references/updates.md](references/updates.md): the one-line update, the detailed update, and the impact canvas. Every update is a draft for the lead to post. Done when all three drafts exist and every number and claim in them is pinned.

4. **Plan the recovery.** Recovery reaches customers a second time, so these rules hold:
   - Every message goes out once. Before you resume or replay anything, prove which messages already went out. Check whether a built-in "rerun" restarts at the send step.
   - A one-off script runs as a dry run by default and needs a separate flag to execute. It refuses any item that fails a check, and prints why.
   - A reviewer from the other model family reads the script before its first dry run.
   - Backfills and replays wait for the lead's go. A late event can fire a customer's automation days after it was useful.
   - The person who runs the script gets it with the exact commands. You read the dry run's output before they execute.

   Done when every affected item has a recovery path, or is marked lost with the date its data runs out.

5. **Hand over and close.** When someone takes over, fill the canvas's Handover section, with how the scripts work and their commands. After the incident, log what went wrong with the `lessons` skill and offer the user a retro.

## Private data

Customer names, counts, revenue, account owners, and run ids go only to private places: the incident channel, the canvas, and a private working folder. End users' email addresses and other personal data stay in local private files. Public repositories, pull requests, commits, and alert or runbook text get the mechanism and the fix, with no customer names or numbers.
