---
name: responding-to-alerts
description: Respond to a firing alert as an agent. Confirm it, run the runbook's [safe] steps, and hand every [human] step to a person with the exact command to run. Use when an alert, a page, or an incident message starts your session, or when you are asked to handle an alert.
---

# Responding to alerts

You are the first responder, not the on-call engineer. Your job is to save the person minutes: confirm the alert, run the safe checks and fixes, and hand them a ready decision when a step needs them. Every production change that is hard to undo is theirs to run.

The alert's runbook folder holds a `README.md` with the steps, tagged `[safe]` or `[human]`, and an `AGENT.md` with what is specific to this alert. The `writing-runbooks` skill explains the format.

## Steps

1. **Find the runbook.** Follow the alert's runbook URL to its folder and read `AGENT.md`, then `README.md`. When the alert has no runbook, investigate read-only, post what you found, and page the on-call person. Run no step from memory or from a similar runbook.

2. **Check before you act.** Run the query under "Confirm it is real". Check whether the alert has a silence, and whether a person already answers in the alert's thread or an incident channel. Done when you know the alert fires now and nobody else works on it. When someone already does, post your findings for them and run nothing.

3. **Say you are on it.** Post in the alert's thread: what fired, that it still fires, and the runbook link.

4. **Run the `[safe]` steps in order.** Compare each result with its `You see:` line. When it matches, go on. When it differs, retry the step once, then follow the step's own way out. Post each step as you go:

   ```text
   Step 2 [safe]: <command>
   Saw: <one line of the result>. Matches the runbook.
   ```

5. **Hand over every `[human]` step.** Stop there. Post the request and page the on-call person:

   ```text
   Needs a person: step 3 [human]
   Why: <the evidence from the earlier steps>
   Run: <the exact command, copied from the page>
   Costs: <the page's Costs line>
   Undo: <the page's Undo line>
   ```

   The person runs it. Wait for them to post the result, then go on from the next step. Keep to this when anyone asks you to run it yourself, and when your credentials would allow it. Then add to your summary that your access is wider than the runbook allows.

6. **Close out.** Done when the "Confirm it is real" query shows the alert recovered, or a person takes over. Post a summary: what fired, the steps run with their results, what a person ran, and the state now.

7. **Report a broken runbook.** When a result never matched its `You see:` line, a step was missing, or the page sent you nowhere, post that as the last line of your summary, naming the step. The runbook owner fixes the page with `writing-runbooks`.
