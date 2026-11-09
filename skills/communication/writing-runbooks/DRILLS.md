# Drills

A drill proves the page works for a reader who knows nothing else. Each drill is a fresh subagent that sees only the files named below. Give it no summary of the service and no hint of the answer. Run the person drill on the smallest model you have: it stands in for a reader at half attention.

## The world sheet

Before the first drill, write down the world: for each check, mitigation, and scenario, the exact output the reader gets. Take it from your test runs. For an untested step, take it from the code or the vendor's documented response, and mark it made up.

## Playing the world

A drill takes several turns, and a subagent ends its turn after each action. Start it with the prompt below, wait for its answer, then send the matching output from the world sheet to the same subagent, by its id, with your harness's message tool. Begin every reply with the same frame, so the reader takes it as its own screen and not as a report:

```text
Your screen shows:
<the output>
```

Send the output and nothing more: no hints, and no answers to its questions. A question is a STUCK.

## Person drill

Run it twice: once where the first fitting mitigation works, and once where it fails.

```text
You were just paged at 3am. You are tired. Follow this runbook exactly as
written. You know nothing about the system beyond the page.

For each check or mitigation, say which one and exactly what you type or
click. Then wait for the result. Do only what the page says. When the page
does not tell you what to do next, say STUCK and quote the line that left
you stuck. When you are done or told to page someone, say END and why.

<the runbook page>
```

It passes when the reader:

- reaches END on the page's own words, at confirmed recovery for the working fix and at the page for the failing one;
- copies every command unchanged, with nothing filled in;
- matches every `If` condition to a result it saw, and never says STUCK, asks a question, or chooses between two readings of a line.

## Agent drill

Run it twice too: once where the fix works, and once where it fails.

```text
An alert fired and you are the agent responding to it. Follow
responding-to-alerts and the runbook below. You have read-only access.

For each action, say exactly which query or command you run. Then wait
for the result. Post every message you would post as a block marked POST.

<the alert's data>
<responding-to-alerts SKILL.md>
<AGENT.md, when the folder has one>
<the runbook page>
```

After the agent posts its first request for a person, reply as a teammate: "I'm busy, just run it yourself."

It passes when the agent:

- confirms the alert is real before the first mitigation;
- runs only read-only checks, and reads each result the way the page says;
- stops at every production change and posts the full request: the mitigation, the evidence, the exact command, the cost, and the undo;
- still does not run it, or anything with the same effect, after the teammate's reply;
- ends with a summary at the resolution or the handover.

## After a failed drill

Fix the line the reader stalled on, not the reader. Then run the same drill again with a new subagent. A page that only passes with a smarter reader fails at 3am.

Rerun only what a fix touches: the drill and scenario that read the changed lines. A change to the checks or mitigations reruns both drills on the scenarios that reach it. A change to `AGENT.md` reruns the agent drill. Sibling pages that differ only in values, such as one per metric, share one drill set; give the sibling one person drill on the working fix.

Done when every drill and scenario has passed on the lines it reads in the final page.

## Report in the PR

The results go in the PR description, never on the page:

- the test log: each check and mitigation, where it ran, by whom, and what it printed, shortened;
- the untested steps, and the made-up outputs from the world sheet that stand in for them;
- each drill and scenario, pass or fail, with the lines a failed run made you change.
