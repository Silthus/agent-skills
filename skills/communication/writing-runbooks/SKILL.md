---
name: writing-runbooks
description: Write an alert runbook that a half-awake engineer paged at 3am can follow to stop the bleeding, with every step tested. Use when adding or changing an alert, when writing, fixing, re-testing, or reviewing a runbook, or when an alert has no runbook. Use it alongside a repository's own alert or runbook format or skill, such as `create-alert`: it writes to the shape of that repository's mature runbooks.
---

# Writing runbooks

The reader was asleep two minutes ago. They may be on a phone, tired, or not fully sober. They read one line, do one thing, and look for one result. Their only job is to stop the bleeding. Root cause waits until morning.

A warning that only posts to a channel has a different reader: someone who sees it hours later, at a desk. Write the same steps for them, and size every lookback in a query to the alert's age, not to the last few minutes.

Every line on the page serves that reader. Test status and drill results go in the PR description, never on the page.

**A repository with its own runbook format** wins. Write to the shape of its mature runbooks, as [HOST-FORMAT.md](HOST-FORMAT.md) describes. Most repositories that have alerts have one.

**With no format to follow**, a runbook is one folder per alert:

```
runbooks/<alert-name>/
  README.md     the page; the alert's runbook URL points here
  mitigate.sh   only when a fix is a sequence of commands
  AGENT.md      optional: only what an agent needs beyond the page
```

## Process

1. **Read the house shape.** When the repository has a runbook format, read its rules, its checker, and 2 or 3 of its most edited runbooks for critical alerts, as [HOST-FORMAT.md](HOST-FORMAT.md) describes. Done when you can state their typical length and how their Mitigation reads. With no format, use the folder above.

2. **Scope the alert.** Read the alert rule: its query, threshold, labels, tier, and where it notifies. Then read what the alert has meant before: past incidents, postmortems, alert threads, and the service's code and deploy config. Done when you can name what is broken for users, the one check that confirms it, at most three known mitigations, and the person or rotation to page when they fail. Another alert's runbook counts as a mitigation: "Follow `<runbook>` first." A mitigation that depends on unmerged or undeployed work is not live yet: write it, and list it as untested in the PR description. When no mitigation is known, stop and ask the user; as a subagent, stop and report it. A runbook with an invented fix is worse than none.

3. **Write the page** from the rules in [PAGE.md](PAGE.md): checks that say what to look for, then short conditional mitigations, least destructive first. In a host format, fit them under the host's headings, as [HOST-FORMAT.md](HOST-FORMAT.md) describes.

4. **Write `mitigate.sh`** from [template.sh](template.sh) only when a mitigation takes three or more commands, or a wait-and-check loop. Rules are in [SCRIPT.md](SCRIPT.md). The page then runs it with one line: `curl -fsSL <url> | bash`.

5. **Test every check and mitigation for real.** Keep a test log for the PR description: each step, where it ran, by whom, and what it printed, shortened.
   - Run every read-only check yourself, against the environment the page names. The result the page tells the reader to look for comes from that run.
   - Run every production change once on a dev or staging environment, or in a drill a person leads. Log what it printed and how long it took.
   - A step with no recorded run is untested. Its expected result comes from the code or the vendor's docs. List it in the log as untested, and tell the user.

6. **Write `AGENT.md`** from [AGENT-PAGE.md](AGENT-PAGE.md), in the folder layout only, and only when an agent needs something the page lacks. In a host format, add at most one line beside a check, as [HOST-FORMAT.md](HOST-FORMAT.md) describes.

7. **Run both drills** in [DRILLS.md](DRILLS.md). Fix the page at every point where a drill reader stalled, guessed, or went off the page, then run that drill again. Done when every drill passes on the final page, as [DRILLS.md](DRILLS.md) defines.

8. **Check the page:**

   ```sh
   bun <this skill>/scripts/check-runbook.ts runbooks/<alert-name>
   ```

   For a repository with its own format, pass the runbook file and the section that holds the fix instead. Done when it prints `ok`, and the host's own checker passes too. Then run the `unslop` skill over the page's prose. When it is not installed, read the page once more against the wording rules in [PAGE.md](PAGE.md) instead.

9. **Wire the alert.** Set the alert's runbook URL to the page. Write the alert's description as the fact, the value, and the user impact: "`{{ $value }}`% of checkout requests returned 5xx over 15m. Customers cannot pay." The runbook link carries the steps. Skip what the host already does, such as a generated runbook URL.

10. **Write the PR description.** Put the test log, the untested steps, and the drill results there, as [DRILLS.md](DRILLS.md) describes.

## Re-test

Re-test when a step fails during a real incident, when the service's deploy changes a command, or when the alert's query or threshold changes. Run steps 5, 7, and 8 again, and put the results in that PR. A failed step during an incident is the most urgent: fix the page the next morning, before the next page. Track re-tests outside the page, such as in an issue.
