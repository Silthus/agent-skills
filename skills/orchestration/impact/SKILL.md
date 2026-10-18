---
name: impact
description: Check whether work moves the needle on a team goal, and push back when it does not. Use when charting a map, starting or opening a PR, or when the user asks what a piece of work is worth.
---

# Impact

Run this check before the work grows. It names the goal the work pays into, the metric that shows the needle moving, and where the team measures that metric.

## Find the goals

Read the goals sources and exemptions that the user's agent instructions name. Usually that is a public team goals page and a private goals file with the targets and leading metrics. The objective the user owns comes first, and the team's other objectives count too. When the instructions name no goals source, ask the user for the goal once.

- **Exempt** work skips the check and gets no Impact section.
- **Pushback-exempt** work gets the check from the goals alone. Record what the goals settle, mark the rest unknown, ask nothing, and skip **Push back**.

Name metrics and link the insight or dashboard that measures them. Targets and revenue or usage numbers from a private source stay in that source.

## Run the check

Answer each question from the goals, the work, and the code:

1. **Goal.** Which objective does the work pay into?
2. **Metric.** Which metric shows the needle moving? Prefer a leading metric from the goals file that rolls up to the target over the target itself.
3. **Size.** Is the move small, medium, or large, compared with the other work that the goals file or the team's open issues list for that objective?
4. **Measure.** Which insight, dashboard, or query measures the metric today? Link it.
5. **Gap.** When nothing measures it yet, which instrumentation would?

Put every question you cannot settle to the user in one short round with the `grilling` skill. Keep grilling until the questions are settled or the calling skill's round limit is reached. At the limit, hand the open questions back to the calling skill.

## Push back

Push back before you go on when the work pays into no objective, or when it moves its metric clearly less than open work it would delay. Say which objective the work pays into, or that it pays into none. Name the higher-impact work when you can see it. Offer three choices: carry on, reshape, or drop. The user decides. Record the choice as a decision line (see `pr-description`).

## Record

Write the result as an Impact section. The calling skill decides where it goes.

```markdown
## Impact

Pays into <objective> through <metric> ([measured here](<link>)). Expected move: <small, medium, or large>, <up or down>.
```

When nothing measures the metric yet, replace the link with `not measured yet: <the instrumentation it needs>`.

Done when the Impact section is written, or the open questions are back with the calling skill at its round limit. Every question in the section has an answer or is marked unknown. Any pushback choice is recorded as a decision line, unless the user chose to drop the work.
