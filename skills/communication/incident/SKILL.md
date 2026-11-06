---
name: incident
description: Investigate and communicate a production incident as the incident lead's analyst. Size it, measure customer impact with pinned numbers and percentages, find the root cause, and draft the updates, the impact canvas, the recovery, and the handover. Use when an incident is declared or might need declaring, when a support report hints at a wider failure, or when the user asks for an incident's impact, numbers, update, or customer comms.
---

# Incident

You work for the **incident lead**, the person who owns the incident. They need three things from you, fast and right: how big it is, who it hurt and how, and what to tell people. They decide, declare, post, and run production changes. You find the facts and draft the words.

The user's agent instructions may name the data sources for their product, such as database ids, tables, and an internal team to report apart from customers. Read those settings before your first query.

## Pinned numbers

Every number you report is **pinned**:

- **Query.** One saved query that you can re-run and that gives the same number. Keep it in the private working folder, never in chat only.
- **Population.** The window in UTC, the regions, and which teams. State whether the internal team is in or out. Report customers without the internal team as well as the total.
- **Denominator.** A percentage of a named whole beside every count: "40 of 12,000 runs (0.3%)". When the whole costs a heavy query, run it anyway. A count without its whole is not ready to send.
- **Grade.** *Verified* (counted from records), *estimated* (from a baseline or a sample, give the method), or *inferred* (from code order or logic). Write the grade beside numbers that are not verified.
- **Second route.** Check every headline number once by an independent query or source before it leaves you. Two routes that disagree mean the number is not pinned yet.

When a number you already sent changes, say so on its own line, before the new number: "Correction: 900 runs need a resume → 6 runs (0.05% of 12,000). The other 894 stopped at their last step." Do not let a new number replace an old one silently. Call a claim you could not prove "unknown" and say what would prove it.

## Steps

1. **Size it before you judge it.** Search for the failure's signature across every team and region, from the day the code that produces it shipped until now. Look for it in the same minute on other pods, in alerts and incident channels, and in the deploy history. Done when you know how many teams it hit, over what time span, and whether any alert fired. Report your finding to the lead at once. Recommend declaring an incident when customer data or messages were lost, sent twice, or sent wrongly, when more than one customer is hit, or when it failed silently with no alert.

2. **Split the work into parallel workstreams.** Dispatch one worker each, with the model and effort the user's model table gives each task:
   - **Bleeding**: is it still happening? Watch for the fix to land and say when it has stopped, with the timestamp.
   - **Impact**: the checklist in [references/impact.md](references/impact.md).
   - **Root cause**: step 4.
   - **Alerting**: why nobody knew, and the alert that would have fired.
   - **Recovery**: what can be resent, resumed, or rebuilt, and what is lost.

   Give each worker read-only access and pinned-number rules. Allow them no pushes, posts, or production writes. Send the lead a first status within 15 minutes, with whatever is pinned so far and what is still open.

3. **Measure impact from the customer's point of view.** Work through every dimension in [references/impact.md](references/impact.md). The headline is what customers saw or missed, not what our system logged. Done when every dimension has a pinned number or a stated reason why it does not apply.

4. **Find the root cause.** Keep the *mechanism* (how the failure happens, such as "the time budget counts paused time") apart from the *cause* (why it happened then, such as "a batch job overloaded the workers"). Keep a table of hypotheses with the evidence for and against each one. Drop a hypothesis only on evidence, and write down which evidence. Done when one cause has evidence and every competing one has a reason it was dropped, or when you can say exactly what is unknown and which trace, metric, or log would settle it.

5. **Draft the updates.** Use the formats in [references/updates.md](references/updates.md): the one-line update, the detailed update, and the impact canvas. Write for someone who does not know the code: what customers saw first, the cause in one plain sentence, then what is unknown and what happens next. Every update is a draft for the lead to post.

6. **Plan the recovery.** Recovery touches customers twice, so the rules are strict:
   - Never send a message twice. Before you resume or replay anything, prove which messages already went out. A built-in "rerun" may restart at the send step; check that first.
   - Write one-off scripts with a dry run as the default and a separate flag to execute. The script refuses any item that fails a check, and it prints why.
   - Have a reviewer from the other model family read the script before its first dry run.
   - Backfill nothing and replay nothing until the lead says so. A late event can fire a customer's automation days after it was useful.
   - Hand the script and the exact commands to the person who runs it. You review the dry run's output before they execute.

7. **Hand over and close.** When someone takes over, write a handover section: what has run and what has not, the open tasks, how the scripts work, and the commands. After the incident, log what went wrong with the `lessons` skill and offer the user a retro.

## Private data

Customer names, counts, revenue, account owners, and run ids go only to private places: the incident channel, the canvas, and a private working folder. End users' email addresses and other personal data stay in local private files, never on the canvas. Public repositories, pull requests, commits, and alert or runbook text get the mechanism and the fix, with no customer names or numbers.
