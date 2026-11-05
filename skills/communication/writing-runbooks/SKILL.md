---
name: writing-runbooks
description: Write an alert runbook that a half-awake engineer paged at 3am can follow to stop the bleeding, with every step tested, plus the instructions an agent follows for the same alert. Use when writing, fixing, re-testing, or reviewing a runbook, or when an alert has no runbook.
---

# Writing runbooks

The reader was asleep two minutes ago. They may be on a phone, tired, or not fully sober. They read one line, do one thing, and look for one result. Their only job is to stop the bleeding. Root cause waits until morning.

A runbook is one folder per alert:

```
runbooks/<alert-name>/
  README.md     the page for a person; the alert's runbook URL points here
  AGENT.md      what an agent does with this alert; README.md links to it
  mitigate.sh   only when a fix is a sequence of commands
```

The steps live once, in `README.md`. `AGENT.md` links to them and never copies them, so the person and the agent always follow the same steps and the same safety calls.

## Process

1. **Scope the alert.** Read the alert rule: its query, threshold, labels, and where it notifies. Then read what the alert has meant before: past incidents, postmortems, alert threads, and the service's code and deploy config. Done when you can name what is broken for users, the one check that confirms it, at most three known mitigations, and the person or rotation to page when they fail. When no mitigation is known, stop and ask the user. A runbook with an invented fix is worse than none.

2. **Write `README.md`** from the template and rules in [PAGE.md](PAGE.md). Tag every step `[safe]` or `[human]`.

3. **Write `mitigate.sh`** from [template.sh](template.sh) only when a mitigation takes three or more commands, or a wait-and-check loop. Rules are in [SCRIPT.md](SCRIPT.md). The page then runs it with one line: `curl -fsSL <url> | bash`.

4. **Test every step for real.**
   - Run every `[safe]` command yourself, against the environment the page names. Paste the real output, shortened, under its `You see:` line.
   - Run every `[human]` command once on a dev or staging environment, or in a drill a person leads. Write what it printed and how long it took.
   - When a `[human]` step cannot run anywhere before production, put `UNTESTED` on the line under the title and tell the user. The page is not finished until the banner is gone.
   - Set the stamp: `Tested <YYYY-MM-DD> on <environment> by <name>.` The stamp expires after 90 days.

5. **Write `AGENT.md`** from [AGENT-PAGE.md](AGENT-PAGE.md).

6. **Run both drills** in [DRILLS.md](DRILLS.md). Fix the page at every point where a drill reader stalled, guessed, or went off the page, then run that drill again. Done when both drills pass on an unchanged page.

7. **Check the folder:**

   ```sh
   bun <this skill>/scripts/check-runbook.ts runbooks/<alert-name>
   ```

   It checks the structure, the stamp, the `[human]` gates, the script link, and the wording. Done when it prints `ok`. Then run the `unslop` skill over the page's prose, if it is installed, and check again.

8. **Wire the alert.** Set the alert's runbook URL to the folder's `README.md`. Make the first line of the alert's description step 1 of the page, so the page notification already says what to do.

## Re-test

Re-test when the stamp is 90 days old, when a step fails during a real incident, or when the service's deploy changes a command. Run steps 4, 6, and 7 again. A failed step during an incident is the most urgent: fix the page the next morning, before the next page.
