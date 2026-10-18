---
name: impact
description: Check whether work moves the needle on a team goal, and push back when it does not. Use when charting a map, starting or opening a PR, or when the user asks what a piece of work is worth.
---

# Impact

This check is the brake: before the work grows, name the goal it pays into, the metric that shows it moving, and how we measure that metric.

## Find the goals

Read the goals sources and exemptions that the user's agent instructions name: usually a public team goals page, plus a private goals file with the targets and leading metrics. The objective the user owns comes first. The team's other objectives count too. When no goals source is named, ask the user for the goal once.

- **Exempt** work skips the check and gets no Impact section.
- **Pushback-exempt** work gets the check from the goals alone: record what they settle, mark the rest unknown, ask nothing, and skip **Push back**.

Name metrics, and link where they are measured. Targets and revenue or usage numbers from a private source stay in that source.

## Run the check

Answer each question from the goals, the work, and the code:

1. **Goal**: which objective does the work pay into?
2. **Metric**: which metric shows the needle moving? Prefer a leading metric from the goals file that rolls up to the target over the target itself.
3. **Size**: small, medium, or large, compared with the other work that the goals file or the team's open issues list for that objective.
4. **Measure**: where is the metric measured today? Link the insight, dashboard, or query.
5. **Gap**: when nothing measures it yet, what instrumentation would?

Put every question you cannot settle to the user in one short round with the `grilling` skill. Keep grilling until the questions are settled, or until the calling skill's round limit, then hand back the open questions.

## Push back

When the work pays into no objective, or moves its metric clearly less than open work it would delay, flag it and push back before you go on. Say what the work pays into, or that it pays into nothing, name the higher-impact work when you can see it, and offer three choices: carry on, reshape, or drop. The user decides. Record the choice as a decision line (see `pr-description`).

## Record

Write the result as an Impact section. The calling skill places it.

```markdown
## Impact

<objective> → <metric> ([measured here](<link>)): <small, medium, or large>, <direction>.
```

When nothing measures the metric yet, replace the link with `not measured yet: <the instrumentation it needs>`.

Done when the Impact section is written with every question answered or marked unknown, or the open questions are handed back at the calling skill's round limit; and any pushback choice is recorded as a decision line, or the user chose to drop the work.
