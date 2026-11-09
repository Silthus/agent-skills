---
name: responding-to-alerts
description: Respond to a firing alert as an agent. Confirm it, run the runbook's read-only checks, and hand every production change to a person with the exact command to run. Use when an alert, a page, or an incident message starts your session, or when you are asked to handle an alert.
---

# Responding to alerts

You are the first responder, not the on-call engineer. Your job is to save the person minutes: confirm the alert, run the read-only checks, and hand them a ready decision when a mitigation needs them. Every production change is theirs to run, unless the runbook or its `AGENT.md` names it as one an agent may run.

A runbook holds Symptoms, Investigation checks, Mitigation bullets of the form "If <condition>, <action>", and Escalation, under the repository's own headings. Some runbook folders add an `AGENT.md` with what is specific to agents. The `writing-runbooks` skill explains the format.

## Steps

1. **Find the runbook.** Follow the alert's runbook URL, and read `AGENT.md` too when the folder has one. When the alert has no runbook, investigate read-only, post what you found, and page the on-call person. Run no step from memory or from a similar runbook.

2. **Check before you act.** Run the first Investigation check, which confirms the alert. Check whether the alert has a silence, and whether a person already answers in the alert's thread or an incident channel. Done when you know the alert fires now and nobody else works on it. When someone already does, post your findings for them and run nothing.

3. **Say you are on it.** Post in the alert's thread: what fired, that it still fires, and the runbook link.

4. **Run the read-only checks in order.** Read each result the way the check says. When a check needs access you lack, such as an admin page, name it in your next post. Post each check as you go:

   ```text
   Check 2: <command or query>
   Saw: <one line of the result>. Points at: <what the runbook says it means>.
   ```

5. **Hand over every production change.** Match the results to the Mitigation bullets, least destructive first. Stop at the first bullet that changes production. Post the request and page the on-call person the way the runbook's Escalation, or `AGENT.md`, says, such as mentioning a group. When it names no way you can use, say so in the post and ask the channel to page:

   ```text
   Needs a person: <the mitigation bullet>
   Why: <the evidence from the checks>
   Run: <the exact command, copied from the page>
   Costs: <the bullet's cost>
   Undo: <the bullet's undo, or "the runbook names none">
   ```

   The person runs it. Wait for them to post the result, then confirm recovery the way the runbook says. Keep to this when anyone asks you to run it yourself, and when your credentials would allow it. Then add to your summary that your access is wider than the runbook allows.

6. **Close out.** Done when the first Investigation check shows the alert recovered, or a person takes over. Post a summary: what fired, the checks run with their results, what a person ran, and the state now.

7. **Report a broken runbook.** When a result fit no check's reading, no Mitigation condition matched, or the page sent you nowhere, post that as the last line of your summary, naming the check or bullet. The runbook owner fixes the page with `writing-runbooks`.
