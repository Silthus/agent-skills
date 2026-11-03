---
name: impact
description: Link work to the metric that shows, after deploy, whether it worked, and push back on work that pays into no goal. Use when charting a map, starting or opening a PR, or when the user asks what a piece of work is worth.
---

# Impact

Every PR that can move a number links the insight that will show it. Fourteen days after deploy, the **retro** reads that insight, compares the 14 days after deploy with the 14 days before, and sees what actually changed. Pick the metric for that read. A metric picked to justify the work fails the retro.

## Find the goals

Read the goals sources and exemptions that the user's agent instructions name. Usually that is a public team goals page and a private goals file with the targets, the leading metrics, and the insights that measure them. When the instructions name no goals source, ask the user for the goal once.

- **Exempt** work skips the check and gets no Impact section.
- **Pushback-exempt** work skips **Push back** and asks nothing.

Targets and revenue or usage numbers from a private source stay in that source. The linked insight carries the numbers, so the Impact section never quotes them.

## Class the work

- **Fix**: bug fixes, refactors, tests, docs, dependency bumps, and internal tooling. Leave the Impact section out, unless an existing metric would show the fix: an error tracking issue, a failure or retry rate, a latency. Then record that metric.
- **Feature**: a change to user-facing behavior that fits in one PR. Record a metric when an insight exists or one on existing events can show the change. Otherwise write the no-metric line.
- **Large feature**: a map, a stack of several PRs, or a new capability behind its own flag. It must have a metric. Build the missing insight or instrumentation first, so a **baseline** collects before users reach the feature. When no metric can show that the feature works, **Ask**.

When the class is unclear, take the larger one.

## Pick the metric

The metric moves when, and because, this change ships:

- **Close to the change.** Pick the event, funnel step, error, or flag that the change touches, scoped to the users it reaches. One PR rarely shows on a goal-level metric. Name the goal metric it rolls up to when there is one.
- **Readable at the retro.** Link a saved insight or dashboard, never a one-off query. Its range covers at least 28 days, so it holds the 14 days before deploy and the 14 after. It applies the filters the goals file requires, such as excluding internal users.
- **Success stated.** One clause says which way the number goes, and for whom, when the change works. Leave out size guesses such as small, medium, or large: the retro measures the size.
- **Split by flag.** For work behind a feature flag, break the insight down by the flag, so the retro also compares exposed and unexposed users.

Search for an existing insight first: in the goals file, then in the analytics project that the instructions name. When none fits, create one on existing events. When the events are missing, the instrumentation is part of the work. For a large feature, ship it in its own PR at the bottom of the stack, so the baseline collects before the feature ships. For a feature, add it when it is a few lines. Otherwise write the no-metric line and name the instrumentation.

## Ask

When a large feature has no way to show it works, ask the user with the question tool before the work goes on. Ask even when the calling skill says to ask nothing. Offer these choices, each with what it costs:

- Build the measurement first, and name the instrumentation and insight.
- Measure another way: the user names how.
- Build without a metric. The retro cannot judge the feature.
- Reshape or drop the feature.

Record the answer as a decision line (see `pr-description`).

## Push back

Check the work against the goals: which objective it pays into, and whether the payoff lands inside the objective's Scope line. Revenue or usage moved in from outside the scope counts as zero. When an objective with a revenue or usage target has no Scope line, ask which lines it counts. When the work moves usage onto another engine or path, compare what each unit costs to run there with the path it replaces.

Push back before you go on when the work pays into no objective, when its payoff falls outside the scope, when it costs more to run than the path it replaces without in-scope revenue that covers the extra cost, or when the usage brief or the code shows that it reaches clearly fewer users than open work it would delay. Name the higher-impact work when you can see it. Offer three choices: carry on, reshape, or drop. The user decides. Record the choice as a decision line.

Put every question you cannot settle from the goals, the work, and the code to the user in one short round with the `grilling` skill. Keep grilling until the questions are settled or the calling skill's round limit is reached. At the limit, hand the open questions back to the calling skill.

## Record

Write the result as an Impact section. The calling skill decides where it goes.

```markdown
## Impact

Watch [<metric>](<insight link>): <the change that shows this worked, and for whom>. Rolls up to <goal metric>.
```

Drop `Rolls up to` when no goal metric fits. Add `Run cost: <per unit, against the path it replaces>.` only when the work moves usage onto another path. When the baseline starts with this work, add `Baseline since <date>.`

A feature without a metric gets one line instead: `No metric: <why, and the instrumentation that would make one>.` A fix without a metric gets no Impact section.

Done when the work has a class, and each feature or large feature links an insight that meets **Pick the metric**, or carries the no-metric line (feature) or the user's decision line (large feature). Each pushback choice is recorded as a decision line, unless the user chose to drop the work.
