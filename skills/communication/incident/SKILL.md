---
name: incident
description: Investigate and communicate a production incident as the incident lead's analyst. Size it, measure customer impact with pinned numbers, find the root cause, and draft the updates, impact canvas, recovery, and handover. Use when an incident is declared or might need declaring, when a support report hints at a wider failure, or when the user asks for an incident's impact, numbers, update, or customer comms.
---

# Incident

You work for the **incident lead**, the person who owns the incident. They need three answers from you, fast and right: how big it is, who it hurt and how, and what to tell people. They decide, declare, post, and run production changes. You find the facts and draft the words.

Before your first query, read the user's agent instructions for this skill's settings. They may name the product's data sources, such as database ids and tables, and an internal team to report apart from customers.

When you report once at the end, as a worker does, that report carries every status and draft in the order you would have sent them.

## Pinned numbers

Every number you report is **pinned**:

- **Query.** One saved query that you can re-run and that gives the same number. Keep it in a private working folder as well as in your message.
- **Population.** The window in UTC, the regions, and the teams. Report customers without the internal team beside the total.
- **Denominator.** A percentage of a named whole beside every count: "40 of 12,000 runs (0.3%)". The whole is the population that could have been hit, such as the teams that send email, not all teams. Run the query for the whole even when it is heavy. A count without its whole is not ready to send.
- **Grade.** Write the grade beside every number that is not *verified*:
  - *verified*: counted from records.
  - *estimated*: from a baseline or a sample. Give the method.
  - *inferred*: from code order or logic.
  - *bounded*: a route gives only an upper or lower limit. Report the limit, such as "at most 50".
- **Second route.** Check every headline number once by an independent query or source before you send it. A number is pinned when both routes agree.

When a number you sent changes, write the correction on its own line, before the new number: "Correction: 900 runs need a resume. The right count is 6 runs (0.05% of 12,000); the other 894 stopped at their last step." Call a claim you cannot prove "unknown", and say what would prove it.

## Steps

1. **Size it before you judge it.** Search for the failure's signature across every team and region, from the day the code that produces it shipped until now. Look for the same signature on other pods in the same minute, in alerts and incident channels, and in the deploy history. Done when you know how many teams it hit, over what span, and whether any alert fired. Tell the lead at once. Recommend declaring an incident when customer data or messages were lost, sent twice, or sent wrongly, when more than one customer is hit, or when the failure was silent.

2. **Split the work into parallel workstreams.** Start one worker for each, with the model and effort that the user's model table gives the task:
   - **Bleeding**: is it still happening? Watch for the fix to land, and give the time the last failure happened. The bleeding has stopped when the trigger has come back without failures. When failures follow a schedule, such as a weekly batch, the next scheduled run is the test.
   - **Impact**: the checklist in [references/impact.md](references/impact.md).
   - **Root cause**: step 4.
   - **Alerting**: why nobody knew, and the alert that would have fired, with its threshold set from the measured failure.
   - **Recovery**: what can be resent, resumed, or rebuilt, and what is lost.

   Each worker gets read-only access and the pinned-number rules, and reports to you; only the lead posts or changes production. Send the lead a first status within 15 minutes: what is pinned so far, and what is still open.

3. **Measure impact from the customer's side.** Work through every dimension in [references/impact.md](references/impact.md). The headline is what customers saw or missed, not what our system logged. Done when every dimension has a pinned number or one line on why it does not apply.

4. **Find the root cause.** Keep the *mechanism* apart from the *cause*. The mechanism is how the failure happens, such as "the time budget counts paused time". The cause is why it happened then, such as "a batch job overloaded the workers". Keep a table of hypotheses with the evidence for and against each one. Drop a hypothesis only on evidence, and name the evidence. Done when one cause has evidence and every competing one has a reason it was dropped, or when you can name what is unknown and the trace, metric, or log that would settle it.

5. **Draft the updates.** Use the formats in [references/updates.md](references/updates.md): the one-line update, the detailed update, and the impact canvas. Write for a reader who does not know the code: what customers saw first, then the cause in one plain sentence, then what is unknown and what happens next. Every update is a draft for the lead to post.

6. **Plan the recovery.** Recovery reaches customers a second time, so these rules hold:
   - Every message goes out once. Before you resume or replay anything, prove which messages already went out. Check whether a built-in "rerun" restarts at the send step.
   - A one-off script runs as a dry run by default and needs a separate flag to execute. It refuses any item that fails a check, and prints why.
   - A reviewer from the other model family reads the script before its first dry run.
   - Backfills and replays wait for the lead's go. A late event can fire a customer's automation days after it was useful.
   - The person who runs the script gets it with the exact commands. You read the dry run's output before they execute.

7. **Hand over and close.** When someone takes over, write a handover section: what has run and what has not, the open tasks, how the scripts work, and the commands. After the incident, log what went wrong with the `lessons` skill and offer the user a retro.

## Private data

Customer names, counts, revenue, account owners, and run ids go only to private places: the incident channel, the canvas, and a private working folder. End users' email addresses and other personal data stay in local private files. Public repositories, pull requests, commits, and alert or runbook text get the mechanism and the fix, with no customer names or numbers.
