---
name: impact
description: Check whether work moves the needle on a team goal, and push back when it does not. Use when charting a map, writing a PR's Impact section, or when the user asks what a piece of work is worth.
---

# Impact

Every token spent on work that does not move the needle is wasted. This check is the brake: before the work grows, name the goal it pays into, the metric that shows it moving, and how we measure that metric.

## Find the goals

Read the goals sources that the user's agent instructions name: usually a public team goals page, plus a private goals file with the targets and leading metrics. The objective the user owns comes first. The team's other objectives count too. When no goals source is named, ask the user for the goal once.

Targets and revenue or usage numbers from a private source stay out of public repositories. Name the metric, never its value.

## Run the check

Answer each question from the goals, the work, and the code:

1. **Goal**: which objective does the work pay into?
2. **Metric**: which metric shows the needle moving? Prefer a leading metric from the goals file that rolls up to the target over the target itself.
3. **Size**: how far could the work move it, compared with other open work on the same objective?
4. **Measure**: where is the metric measured today? Link the insight, dashboard, or query.
5. **Gap**: when nothing measures it yet, what instrumentation would?

Put every question you cannot settle to the user in one short round with the `grilling` skill. When the answers raise new questions, keep grilling until they are settled.

Done when each question has an answer, or the user's explicit "unknown".

## Push back

When the work pays into no objective, or moves its metric less than other open work on the same objective, flag it and push back before you go on. Say what the work pays into, or that it pays into nothing, name the higher-impact work when you can see it, and offer three choices: carry on, reshape, or drop. The user decides. Record the choice as a decision line (see `pr-description`).

## Record

Write the result as an Impact section:

```markdown
## Impact

<objective> → <metric> ([measured here](<link>)): <expected direction and rough size>.
```

When nothing measures the metric yet, replace the link with `not measured yet: <the instrumentation it needs>`. A map keeps the section after its Destination, per `orchestration-wayfinder`. A PR keeps it after its Problem, per `pr-description`.
