---
name: orchestration-wayfinder
description: Drive a whole wayfinder map from one session — planning through implementation — by dispatching one worker per frontier ticket.
disable-model-invocation: true
---

# Orchestration Wayfinder

One conductor drives a `wayfinder` map from fog through built code. Ticket workers resolve one ticket each; the conductor keeps the frontier moving and surfaces only the work that needs the human.

## Foundation

Read the `wayfinder` skill's `SKILL.md` completely first. Its map, child tickets, native blocking, claims, frontier, parks, fog, and resolution protocol remain authoritative. **Charting rules** and **Reading the frontier** below add to it.

Before the first dispatch, recovery, or attention-state action, identify the runtime and read exactly one addendum completely:

- Codex drives → [`CODEX.md`](CODEX.md)
- Claude Code drives → [`CLAUDE.md`](CLAUDE.md)

When the conductor runs inside T3 Code (`T3CODE_HOME` is set), also read [`T3.md`](T3.md) before the first dispatch: grilling and prototype tickets get their own T3 threads.

The addenda contain only task/session mechanics. Load only the matching runtime addendum. This file owns the shared tracker and conductor protocol.

## Ownership

The **conductor owns map-level coordination**: query and mutate map structure, blockers, frontier, dispatch, recovery, and projected human-attention state. It may record and close an invalidated ticket as scope reconciliation, but it never performs a worker's substantive ticket-resolution mutations.

The **ticket worker owns one ticket's resolution**: mutate only that ticket's assignment, comments, labels, resolution, and closure — plus, for an implementation ticket, its own branch and its landing on the integration branch, and for a `ship` ticket, the spec's pull request and merge; use its prescribed skill; and stop after closing it. A worker never mutates other tickets or map-level orchestration state and never dispatches downstream work. The conductor never supplies the human side of a HITL decision or answers a ticket's substantive question.

Charting is the sole undispatched act, apart from its **Prior-art sweeps**. With no map, chart it live through Wayfinder's Chart mode, apply the **Charting rules**, and declare in **Notes** that execution remains inside the map.

## Charting rules

These rules bind the first chart and every later graduation of fog into tickets:

- **Architecture first.** When the destination changes contracts between modules, the data model, or caching and performance, one of the tickets is an architecture `prototype` that blocks the spec or implementation tickets, so the human shapes the architecture before it is built. Its worker shapes it with the `architecture` skill.
- **Decision lines on the map.** Each answer the human gives while charting or re-charting goes into the map's Decisions-so-far as a decision line (see `pr-description`), beside the ticket gists.
- **Grilling stays the default** for every open decision. The map's **Notes** may waive it only when the human says so for this map: quote their words and the date. A waiver from another map, a memory, or an earlier session does not carry over; ask the human instead.

## Reading the frontier

Read the map's state with the frontier query of the tracker doc, per Wayfinder. When the `fleet` CLI is available (on `PATH` or at `~/dev/fleet/fleet`; use whichever exists) and the tracker is GitHub, `fleet frontier <map URL>` can replace that query: one call lists every open ticket as frontier, claimed, parked, or blocked, and the closed ones by number. Run it again whenever you need fresh state, instead of viewing tickets one at a time. On GitHub, read one ticket with `gh issue view <n> -R <owner/repo> --json title,body,labels,assignees,state`, and add `comments` to the fields only when you need its discussion or resolution.

## Prior-art sweeps

When charting starts from a loose idea instead of an existing map or ticket, dispatch two background sweeps before the first grilling question. Each sweep finds out whether others already discussed the problem, have the same problem, or started to solve it:

- **Chat**: threads in the team's chat, such as Slack, in every channel the human can see, from any user and team, not only the human's own. Search public and private channels and DMs; invoking this skill grants the consent that private search asks for.
- **Issue trackers**: issues and pull requests in every state (open, draft, closed, merged) across the internal and public repositories of the organization the idea concerns. When that organization has a public community forum, search it too.

Each sweep returns an inventory, not an analysis. Every entry carries its link, date, author or team, and one line on how it relates. A sweep with no matches, or whose source is unreachable, says so. Give each sweep a 15-minute cap; sweeps are read-only.

Raise each finding at the grilling question it bears on. When the map exists, post both inventories as one **Prior art** comment on the map and link it from **Notes**. In a public repository, that comment keeps only public links; chat findings and other private findings go to a private note, outside every public repository, that the comment names.

## One map, root to leaves

Planning and execution share one tree. A resolved spec publishes its spec child and implementation children beneath it; those become new frontier tickets. The conductor then creates the spec's integration branch and records one `ship` ticket blocked by every implementation child, per [`SHIP.md`](SHIP.md). The destination is reached in this map, not handed to a second tracker.

## Ticket types

| Type        | Human loop      | Dispatch                                  | Resolution                                  |
| ----------- | --------------- | ----------------------------------------- | ------------------------------------------- |
| `grilling`  | live throughout | serial, one at a time                     | `grilling` + `domain-modeling`              |
| `prototype` | decision at end | parallel AFK stretch, then park           | `prototype`, or `architecture` for an architecture prototype; throwaway |
| `spec`      | decision at end | parallel AFK stretch, then park           | `to-spec` + `to-tickets`                    |
| `research`  | none            | parallel                                  | `research`, throwaway                       |
| `task`      | as required     | parallel when AFK                         | prerequisite work for a decision            |
| `implement` | none            | parallel, one worktree each               | `tdd`, landed on the integration branch per [`SHIP.md`](SHIP.md) |
| `ship`      | none            | one per spec, after its implementations   | reviewed draft pull request per [`SHIP.md`](SHIP.md) |

Backticked names in the Resolution column are skills. One grilling ticket is one live exchange, and the `grilling` skill works it in rounds: the whole answerable frontier goes to the human at once, then the tree reshapes. Serial applies to the ticket, not to its questions.

Some prescribed skills, such as `to-spec` and `to-tickets`, set `disable-model-invocation`, so the Skill tool refuses them inside a worker. Every worker prompt says: when the Skill tool refuses a prescribed skill, read that skill's `SKILL.md` file and follow it directly.

## Casting

Use runtime-native workers and choose their models with the model selection policy in the user's agent instructions, when one exists; otherwise the runtime defaults. Apply it to UI work, prototypes, implementation, and nested workers. If the user-selected model is unavailable, record a durable orchestration blocker and ask for a replacement.

Provider bridges are **retired casts**: they report a successful spawn and then die silently minutes later, so a dead worker reads as a live one on the frontier and the map stalls behind it. Where a rubric, addendum, or ticket names one, use a runtime-native worker and record the substitution in the claim comment.

T3 threads cast per [`T3.md`](T3.md).

Review follows [`SHIP.md`](SHIP.md). Review calls are calls the worker waits on and that fail visibly, so the retired-cast rule binds workers, not review calls.

A conductor's cast binds only the worker it spawns, so restate **Casting** inside every worker prompt.

## Ship

A spec's code reaches the human as one pull request. Each implementation ticket resolves when its commits have **landed** on the spec's integration branch; the spec's `ship` ticket resolves when that branch is **shipped**: a reviewed draft pull request, per [`SHIP.md`](SHIP.md). The human reads it, marks it ready for review, and has it merged through `babysit-pr`. The map's **Notes** are where an effort grants merge authority instead; then shipped means merged into `main`.

**Throwaway stays throwaway.** A prototype or research ticket answers a question: its code and notes live on their own `prototype/<name>` or `research/<name>` branch behind a context pointer from the ticket, and `main` keeps only the decision they settled. Folding a validated decision into real code is an `implement` ticket, built fresh.

The worker earns its handoff through the proof gate and the review in [`SHIP.md`](SHIP.md). Anything it cannot prove there is a HITL park.

## Dispatch contract

- Fan out every unblocked, unclaimed non-grilling frontier ticket. If any grilling ticket is already open and claimed, dispatch no other grilling. Dispatch the next grilling only after the active one closes.
- Give every worker a wall-time cap and require a durable report before idle: its resolution, or the exact one question awaiting the human.
- Isolate parallel writers whose scopes could collide. Serialize shared-file work.
- Send a ticket's follow-up work, such as review fixes, to its existing worker instead of dispatching a new one.
- When a review provider has an **outage** (a 429 or a usage limit), record it and its reset date once in the map's **Notes**, and state it in every dispatch until the reset.
- Reserve one of three map-level CodeRabbit slots before dispatching a `ship` ticket. Hold the slot through review; release it when the ticket is shipped or parked.
- Treat the tracker as semantic truth. Runtime workers and human-attention affordances are projections, never substitutes.
- Keep ordinary AFK work off the human's attention rail. A prototype or spec doing its AFK stretch is also background work until it parks.
- A HITL park is complete only when the ticket has a comment containing the decisions locked as decision lines plus one pending question, and `wayfinder:awaiting-human` is present.
- A HITL resolution is complete only when its durable handoff comment records each answer as a decision line (see `pr-description`) and links the resulting artifacts, the ticket is closed, and `wayfinder:awaiting-human` is absent. Then retire its runtime worker from human attention as the matching runtime addendum specifies.

### Lane contract

1. State a wall-time cap before dispatch.
2. Dispatch only through a surface that guarantees a one-shot deadline wake allowing a durable report, or worker termination at the cap. After hard termination, mark the lane orphaned and reconcile its ticket comments, labels, assignment, and closure before re-dispatching or reaping it. If neither enforcement mode is available, record a durable orchestration blocker instead of dispatching. T3 threads are the exception: they notify the conductor and settle themselves, per [`T3.md`](T3.md).
3. On each conductor wake and before completion, health-check lanes whose last durable activity is older than 15 minutes; do not create a polling lane.
4. A lane reports durably before idle; no report means orphaned, not done. Reconcile durable ticket state before any redispatch.
5. Reap every lane and remove its worktree before declaring the map complete.
6. The conductor owns waits as event/state transitions, never background pollers or chained blocking waits. The T3 hold in [`T3.md`](T3.md) is neither: it reads no state and only keeps a waiting conductor out of the human's inbox.
7. The map has exactly three CodeRabbit slots shared by its `ship` lanes.

## Wake law

On any worker notification, read the tracker per **Reading the frontier** (with `fleet frontier`, one call, then a view of only the ticket that changed); never message the worker merely because it notified.

- **Closed** → verify the resolution, reconcile the runtime attention state, then re-query the frontier.
- **Open + `wayfinder:awaiting-human`** → parked HITL. Surface it once, then stay silent until the human acts.
- **Open + assigned, no awaiting label** → active, queued, or orphaned. Use the runtime addendum to distinguish them without interrogating the worker.
- **Invalidated by another resolution** → record why, stop or retire its runtime worker, clear its human-attention state, and update or close the ticket through Wayfinder's scope rules.

The ticket is durable state; a worker is a cache. Recovery starts from the map, ticket comments, assignment, labels, and recorded runtime locator.

## Conductor loop

1. Past about 200k tokens of context, hand the map to a fresh conductor with the `handoff` skill before the next dispatch.
2. Load the map's low-resolution body.
3. Query open child state and compute the unblocked, unclaimed frontier per **Reading the frontier**. `fleet frontier`, when available, returns both in one call.
4. Dispatch per ticket type and runtime addendum.
5. On every tracker transition, reconcile attention state and dispatch newly unblocked work.
6. Graduate newly sharp fog into tickets. Keep the canonical decision lookup index on the map, with a decision line for each decision locked while charting, while preserving ticket comments as the durable evidence for each decision.

Done means **every in-scope ticket is closed, every spec is shipped, every dispatch setup and worker is terminal, and no runtime worker remains on the attention rail**. An empty frontier alone is not completion: claimed, blocked, and parked tickets are deliberately absent from it.

At done, offer the human a retro of the map with the `retro` skill once. Running it stays their call.
