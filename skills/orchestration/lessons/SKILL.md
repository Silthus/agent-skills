---
name: lessons
description: Keep an incident-backed log of what did not work, and turn repeat lessons into rules that agents respect. Use when a map closes, when a rollout rolls back outside a map, before charting a map, or when the user asks to log a lesson or what went wrong before.
---

# Lessons

A **lesson** is something that did not work, with its evidence and its cause.
Decision lines record what a map chose. Lessons record what it tried and
dropped, so the next agent does not try it again. A log of decisions alone
repeats its mistakes.

`orchestration-wayfinder` runs this skill on its own: workers write ❌ lines
while they work, the conductor harvests them into the log when a map closes,
and the next charting reads the log first. `retro` stays a manual review of
one session that the user starts.

## The log

The **lessons log** is the file that the user's agent instructions name for
this skill. Without one, ask the user once where it lives. Pull before you
write, and commit and push after. Entries go newest first:

```md
## <YYYY-MM-DD> · <map or PR title> · <code repo>

Source: <map or PR link> · Outcome: <done, abandoned, or rolled back> · <stacks, PRs, review rounds, wall time, when known>

### What did not work

- **<what was tried>**: <what happened> → <why>. Evidence: <link>.

### Rules to respect

- <the rule, as an order to an agent>. Because: <evidence link>. Encoded: <the check, `REVIEW.md` line, or skill edit that enforces it, or `to-do: <parked to-do title>`, or `log only (route: <route>)`>.
```

Every lesson and every rule links its evidence: a comment, a run, a commit, a
thread, or a review round. A rule without its incident is a preference, and
the next agent cannot judge when it applies.

## ❌ lines

Write a lesson where it happens, as one line in the comment that reports the
work: a ticket's park, handback, or resolution comment, or a map comment.

```md
- ❌ **<what was tried>** <what happened, and why>
```

Name the attempt concretely. Say what you observed and its cause, or "cause
unknown". `fleet lessons` collects these lines, so keep the shape: a list
item, ❌, the attempt in bold, then the outcome on the same line.

Write a ❌ line for:

- an approach dropped after work went into it, and a prototype variant the
  human rejected, with the reason;
- a review loop past its second round, an arbiter escalation, and a finding
  that came back after its fix;
- a fix that did not fix, such as an exit 3 of `fleet pr blockers`;
- a revert, a rollback, or a rollout hold;
- a proof that could not be produced, and a gap the human accepted because of
  it;
- a lane that was orphaned, stalled, or re-dispatched, and a worker cast that
  died;
- a decision the human overturned;
- an estimate that was off by half or more, in wall time or in changed lines.

Skip what worked as designed: a finding fixed in its round, or an
infrastructure failure that passed on its one rerun. In a public repository,
a ❌ line names the fact without internal numbers, customer data, or private
links.

## Harvest

The conductor of a map runs the harvest before it declares the map done, and
when the map closes early, such as abandoned or replaced. It dispatches one
worker for it: a survey of the map's record that writes a summary, cast with
the model selection policy in the user's agent instructions. Outside a map,
run the harvest for a PR that a rollout rolled back or held twice, once the
rollout settles.

Pull the repositories of the lessons log and the rollout log before you
start, so you read what other machines wrote.

1. **Collect.** With the `fleet` CLI (on `PATH` or at `~/dev/fleet/fleet`),
   run `fleet lessons <map URL>`. It lists every ❌ line of the map and its
   tickets, and each stack PR's review rounds past two, arbiter escalations,
   reviewer misses, holds, and rollbacks. Without the CLI, read the map body,
   the comments of the map and each ticket, and the review ledgers and the
   rollout log of the stack PRs. For a single PR, read its review ledger, its
   rollout log lines, and its own review threads.
2. **Explain.** Read around each item until you know what happened and why:
   the comment, the stack thread, the review findings and responses. Merge
   items that share one cause. Drop an item that turns out to be noise, and
   say why in one line.
3. **Match.** Search the log for the same cause in earlier entries, for the
   same code repo and across repos. A cause the log already has is a
   **repeat**. Also search the parked to-dos for a rule on the same cause.
4. **Rule.** Turn each lesson that a future agent can avoid into a rule to
   respect. A repeat always becomes a rule. Route each rule to where it is
   enforced, strongest first:
   - a mechanical rule becomes a check, such as a lint rule, a type, a test,
     or a CI job, per `principle-encode-lessons-in-structure`;
   - a judgement call for reviewers becomes a `REVIEW.md` line in the code
     repo, per **Misses and review rules** in the `qa-swarm` skill's
     `TRIAGE.md`;
   - a rule about how agents work becomes an edit to the skill or the agent
     instructions it concerns;
   - a one-off stays in the log, marked `log only` with no route.

   The harvest changes no check, `REVIEW.md`, skill, or agent instruction
   itself. Park each routed rule of a repeat, a rollback, or a data, security,
   or delivery problem as one to-do with the `parked-todos` skill. The to-do
   names the rule, its route, and its entry, and says to set the entry's
   `Encoded:` to the change that lands it. When a to-do for the rule is
   already open, add the new entry to it instead of parking a second one.
   Mark the other routed rules `log only (route: <route>)` until they repeat.
5. **Write.** Add the entry to the log and push it. Post one map comment,
   `Lessons: <link to the entry>`, or `Lessons: none` when nothing qualified.
   Write no entry when nothing qualified. For a single PR, post nothing on the
   PR: the entry lives only in the log.

The harvest is done when every collected item is in the entry or dropped with
its reason, every rule names where it is enforced, any entry is pushed, and
on a map, the map comment is posted.

## Read

Lessons pay off only when the next agent reads them:

- **Charting.** Before the first grilling question of a new map, pull the
  lessons log, then search it for entries of the code repo and for causes
  that the destination touches. Raise each rule at the grilling question it bears on. Record the
  rules that apply in the map's **Notes** as
  `Lessons: <rule> (<entry link>); ...`. Every lane prompt carries that line.
- **Asked.** When the user asks what went wrong before, or why a rule exists,
  answer from the log with its links.
