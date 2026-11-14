---
name: impact
description: Decide whether new work starts now or parks, decide whether a fix is worth its code, push back on work that pays into no goal, and link work to the metric that shows, after deploy, whether it worked. Use before you start a map, feature, prototype, research toward code, fix, or side fix, when the user voices an idea mid-task, when you open a PR, or when the user asks what a piece of work is worth.
---

# Impact

Every PR that can move a number links the insight that will show it. Fourteen days after deploy, the **retro** reads that insight, compares the 14 days after deploy with the 14 days before, and sees what actually changed. Pick the metric for that read. A metric picked to justify the work fails the retro.

## Find the goals

Read the goals sources and exemptions that the user's agent instructions name. Usually that is a public team goals page and a private goals file with the targets, the leading metrics, and the insights that measure them. When the instructions name no goals source, ask the user for the goal once. The instructions may also name a **focus list**, the few items that count until a date, an **ideas list** for parked work, and where the **pressure** numbers come from.

- **Exempt** work skips the goal check and gets no Impact section.
- **Pushback-exempt** work skips **Push back** and asks nothing.

Targets and revenue or usage numbers from a private source stay in that source. The linked insight carries the numbers, so the Impact section never quotes them.

## Start

Before new work begins, decide **start now** or **park**. New work is a map, a feature, a prototype, research that will lead to code, a fix or side fix, or an idea the user voices mid-task; a ticket of a map that already started is not. Take three readings, each from a source you can name. A reading without a source is `unknown`, and `unknown` never counts toward a start.

1. **Fit and evidence.** Fit: on the focus list, paying into a goal (by **Push back**'s scope test), or neither. Evidence: what shows users need it: an incident, a user report, a count, or only code reading or a chat. A fix's evidence is its **Worth** line: a park verdict parks it, and a build verdict brings its evidence class.
2. **Pressure.** What already waits on people: threads waiting on the user, the user's ready PRs waiting on a teammate's review, and focus-list work still open. It is **high** above 5 waiting threads or 10 waiting PRs, unless the instructions set other limits.
3. **Attention cost.** The user's attention until the work is done, not agent run time, in counts: decisions and questions it brings back, PRs a person must review, days it stays open, whether it touches a hot path or an area where the user's lead asked for care, and whether it can be proven and merged without a person.

**Verdict.** Take the first rule that holds:

1. An **always-build** class (see **Worth**) with a path a real input can take: start now.
2. On the focus list, with evidence beyond code reading or a chat: start now. The focus item's own finish line counts as evidence.
3. No focus list exists, the work pays into a goal with an incident, a report, or a count, and pressure is not high: start now.
4. Everything else parks.

A start that needs more than 2 reviews by people or more than 3 decisions starts as its thinnest slice within those counts, and the rest parks with the tripwire "slice merged". Exempt work skips all of this and starts; its verdict line still states the attention cost.

Tell the user the verdict in one line with its readings, such as `Park: off the focus list, code reading only · 12 threads, 20 PRs waiting (high) · 2 reviews, 3 decisions, about 4 days open.` A park off the focus list that has an incident, a report, or a count goes to the user as a question, park recommended, when pressure is not high and their instructions do not let you decide it; every other park asks nothing, and the user's daily digest lists it. The verdict never blocks: the user overrules it in one word, either way. Record their word and the date on the park line, or as a decision line on the work (see `pr-description`), so a later retro can grade it.

A park writes one line, a fix's to the worth log and all other work's to the ideas list: what the work is, the reason with the three readings, and the **tripwire**, the observable event that reopens it: a date, a count crossing a number, a user report, or the focus item finishing. A parked item gets no branch, no thread, and no PR. When its tripwire fires, decide again.

Done when every piece of new work has a verdict line with three sourced readings, each start rests on a rule, an exemption, or the user's word, and each park has its line and tripwire.

## Class the work

- **Fix**: bug fixes, refactors, tests, docs, dependency bumps, and internal tooling. Leave the Impact section out, unless an existing metric would show the fix: an error tracking issue, a failure or retry rate, a latency. Then record that metric. A bug fix also runs **Worth** before its first commit.
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

## Worth

A bug fix earns its code only when it changes what users meet. Before the first commit of any fix, including a side fix, a review follow-up, a bug a test found, and the user's own request, write its **worth line**. An exempt area still runs Worth.

1. **Reach.** Read the evidence that already exists first: the signal, the error tracking issue, the logs, the PR's own prod-shape read. Count in this order and stop at the first that answers:
   - **failures**: how often the exact failure happened, and to how many users or teams, over a window that says so (up to 90 days; count an outage as one incident);
   - **exposure**: how many stored rows, senders, or teams are in the state the fix handles today;
   - **no trace**: neither can be read. Name the query that could not see it.

   A zero on a path opened in the last 30 days is not evidence yet. Widen the search only when the verdict turns on it.
2. **Harm.** 3 for data loss, wrong or missing delivery, or a blocked task; 2 for a visible error with a workaround; 1 for a cosmetic or internal-only problem.
3. **Cost.** The production lines you expect, the new concepts (a column, state, queue, counter, retry, flag, env var, or config key), and whether it runs on a hot path.
4. **Verdict.** **Build** when one of these holds, else **park**:
   - failures were observed;
   - exposure is above zero and harm is 3, or the fix adds no new concept;
   - it is an **always-build** class: an auth or access bypass, a send to a suppressed or opted-out recipient, a duplicate or wrong-recipient send, a billing or quota leak, or data loss. It still needs a path a real input can take, and the smallest fix.

   A regression the current PR introduces is no new fix: fix it in that PR.

Write the worth line to the **worth log** that the user's agent instructions name: the failure, the reach with its source and window, the harm, the cost, the verdict, and the evidence class (an incident, a user report, measured numbers, or code reading alone). Then run **Start**, which parks the fix or starts it. The PR gets one line without numbers: `Worth: <log id>`, and a launched side fix's handoff carries the log id. Over 150 authored lines, a side-fix PR needs measured numbers, or it goes to the user as a decision.

Done when every fix has a worth line with its evidence class, and its **Start** verdict.

## Ask

When a large feature has no way to show it works, ask the user with the question tool before the work goes on. Ask even when the calling skill says to ask nothing. Offer these choices, each with what it costs:

- Build the measurement first, and name the instrumentation and insight.
- Measure another way: the user names how.
- Build without a metric. The retro cannot judge the feature.
- Reshape or drop the feature.

Record the answer as a decision line (see `pr-description`).

## Push back

Check the work against the goals: which objective it pays into, and whether the payoff lands inside the objective's Scope line. Revenue or usage moved in from outside the scope counts as zero. When an objective with a revenue or usage target has no Scope line, ask which lines it counts. When the work moves usage onto another engine or path, compare what each unit costs to run there with the path it replaces.

Push back before you go on when its payoff falls outside the scope, when it costs more to run than the path it replaces without in-scope revenue that covers the extra cost, or when the usage brief or the code shows that it reaches clearly fewer users than open work it would delay. Name the higher-impact work when you can see it. Offer three choices: carry on, reshape, or drop. The user decides. Record the choice as a decision line.

Put every question you cannot settle from the goals, the work, and the code to the user in one short round with the `grilling` skill. Keep grilling until the questions are settled or the calling skill's round limit is reached. At the limit, hand the open questions back to the calling skill.

## Record

Write the result as an Impact section. The calling skill decides where it goes.

```markdown
## Impact

Watch [<metric>](<insight link>): <the change that shows this worked, and for whom>. Rolls up to <goal metric>.
```

Drop `Rolls up to` when no goal metric fits. Add `Run cost: <per unit, against the path it replaces>.` only when the work moves usage onto another path. When the baseline starts with this work, add `Baseline since <date>.`

The `rollout` skill marks the deploy on each linked insight, and the retro reads the metric 14 days later from the PR's Impact section, so keep its format.

A feature without a metric gets one line instead: `No metric: <why, and the instrumentation that would make one>.` A fix without a metric gets no Impact section.

Done when the work has a class, and each feature or large feature links an insight that meets **Pick the metric**, or carries the no-metric line (feature) or the user's decision line (large feature). Each pushback choice is recorded as a decision line, unless the user chose to drop the work.
