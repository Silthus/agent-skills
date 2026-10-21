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

When the conductor runs inside T3 Code (`T3CODE_HOME` is set), also read [`T3.md`](T3.md) before the first dispatch: grilling, prototype, spec, HITL task, and ship tickets get their own T3 threads.

The addenda contain only task/session mechanics. Load only the matching runtime addendum. This file owns the shared tracker and conductor protocol.

## Ownership

The **conductor owns map-level coordination**: query and mutate map structure, blockers, frontier, dispatch, recovery, and projected human-attention state. It may record and close an invalidated ticket as scope reconciliation, but it never performs a worker's substantive ticket-resolution mutations. It does no ticket work itself: browser checks, seeding, screenshots, and pull request bodies go to a worker.

The **ticket worker owns one ticket's resolution**: mutate only that ticket's assignment, comments, labels, resolution, and closure — plus, for an implementation ticket, its own branch and its landing on the integration branch, and for a `ship` ticket, the spec's pull request and merge; use its prescribed skill; and stop after closing it. A worker never mutates other tickets or map-level orchestration state and never dispatches downstream work. The conductor never supplies the human side of a HITL decision or answers a ticket's substantive question.

Charting is the sole undispatched act, apart from its **Prior-art sweeps** and **Usage sweep**. With no map, chart it live through Wayfinder's Chart mode in the **Map tracker**, apply the **Charting rules**, and declare in **Notes** that execution remains inside the map.

## Map tracker

The map and its tickets live in the **map tracker**: the tracker the user's agent instructions name for maps, usually in their skill settings; otherwise the code repo's own tracker, per Wayfinder. The code lives in the **code repo**: worktrees, branches, the integration branch, and pull requests. When the two differ:

- Record `Code repo: <owner/repo>` in the map's **Notes** when you chart it.
- Name the map tracker in every tracker command: `-R <owner/repo>` on `gh issue`, and the map tracker's `repos/<owner>/<repo>/...` path or GraphQL variables on `gh api`, which rejects `-R`. Inside a checkout of the code repo, `gh` infers the code repo.
- Every worker prompt carries the map URL and the code repo.
- Cross-repo references use the full form, `<owner/repo>#<n>`: a ticket links its pull request, and a pull request links its tickets.
- When the map tracker is private and the code repo is public, everything written to the code repo keeps only public context: pull request bodies, comments, commits, and branch names carry the decision and the ticket link, while the numbers, customer data, and internal findings behind it stay on the map.

## Charting rules

These rules bind the first chart and every later graduation of fog into tickets:

- **Impact with the destination.** While you name the destination, run one round of the `impact` check. Write its Impact section into the map body, after **Destination**. When questions stay open, write `Impact: pending <ticket>` there instead and chart a grilling ticket for the rest. Block every non-research ticket on it. That ticket's resolution comment carries the Impact section, and the conductor copies it into the map body. When nothing measures the metric yet, put the instrumentation on the map. Code goes into **Not yet specified**, so the spec covers it and publishes it as an `implement` ticket. An insight or dashboard on existing events is a `task` ticket. When the check ends in pushback, chart nothing more until the human chooses to carry on, reshape, or drop.
- **Architecture first.** When the destination changes contracts between modules, the data model, or caching and performance, one of the tickets is an architecture `prototype` that blocks the spec or implementation tickets, so the human shapes the architecture before it is built. Its worker shapes it with the `architecture` skill.
- **Decision lines on the map.** Each decision locked while charting or re-charting goes into the map's Decisions-so-far as a decision line (see `pr-description`), beside the ticket gists.
- **Grilling stays the default** for every open decision. The map's **Notes** may waive it only when the human says so for this map: quote their words and the date. A waiver from another map, a memory, or an earlier session does not carry over; ask the human instead.

## Reading the frontier

Read the map's state with the frontier query of the tracker doc, per Wayfinder. When the `fleet` CLI is available (on `PATH` or at `~/dev/fleet/fleet`; use whichever exists) and the tracker is GitHub, `fleet frontier <map URL>` can replace that query: one call lists every open ticket as frontier, claimed, parked, or blocked, and the closed ones by number. Run it again whenever you need fresh state, instead of viewing tickets one at a time. On GitHub, read one ticket with `gh issue view <n> -R <owner/repo> --json title,body,labels,assignees,state`, and add `comments` to the fields only when you need its discussion or resolution.

## Compute lease

When `<fleet> lease help` prints its usage, where `<fleet>` is the path resolved per **Reading the frontier**, and the user's instructions route the code repo's heavy work (broad tests, typechecks, builds, previews) through `fleet heavy`, the map gets one compute box. The conductor owns it. Every `fleet` command below and in the attach line uses that resolved path. The lease name is `map-<tracker repo name>-<n>`, such as `map-personal-12`, because map numbers repeat across trackers.

- **Lease early.** As soon as the map holds an open `implement` or `ship` ticket, or a `prototype` or `task` ticket that runs the code repo's tests or builds, blocked or not, run `fleet lease <name>` in the conductor's checkout. A new box takes about 3 minutes to boot and about 20 more to warm its test database, and leasing early does that while earlier tickets run. First dispatch the tickets that need no box. Then run the lease in the foreground with a 10-minute timeout, and record `Compute lease: <name>` in the map's **Notes**. When the lease fails, for example because the lease cap is reached, record the failure there instead, dispatch without the attach line, and try again at the next wake.
- **Keep it running.** The box stops after 2 idle hours. Before each dispatch of a ticket that runs code, run `fleet lease <name>` again in the conductor's checkout, the same way. It takes seconds while the box runs and about 3 minutes after a stop, and then the worker attaches to a running box.
- **Workers attach.** While the **Notes** record the lease, every prompt for a ticket that runs code carries the attach line: in your own worktree, before your first heavy command, run `fleet lease <name>` in the foreground with a 10-minute timeout. After that, `fleet heavy` in that worktree runs on the box. When the attach fails, run it once more before the next heavy command, then carry on locally. Workers never release the lease.
- **Handoff.** A new conductor after a handoff or resume runs `fleet lease <name>` in its own checkout before its first dispatch, so that it can release the lease later.
- **Release at done.** When the map is done, or the human drops it, run `fleet lease release` in the conductor's checkout and remove the **Notes** line. That stops the box, and Fleet's nightly reap deletes it after 3 days unused.

## Prior-art sweeps

When charting starts from a loose idea instead of an existing map or ticket, dispatch two background sweeps before the first grilling question. Each sweep finds out whether others already discussed the problem, have the same problem, or started to solve it:

- **Chat**: threads in the team's chat, such as Slack, in every channel the human can see, from any user and team, not only the human's own. Search public and private channels and DMs; invoking this skill grants the consent that private search asks for.
- **Issue trackers**: issues and pull requests in every state (open, draft, closed, merged) across the internal and public repositories of the organization the idea concerns. When that organization has a public community forum, search it too.

Each sweep returns an inventory, not an analysis. Every entry carries its link, date, author or team, and one line on how it relates. A sweep with no matches, or whose source is unreachable, says so. Give each sweep a 15-minute cap; sweeps are read-only.

Raise each finding at the grilling question it bears on. When the map exists, post both inventories as one **Prior art** comment on the map and link it from **Notes**. In a public repository, that comment keeps only public links; chat findings and other private findings go to a private note, outside every public repository, that the comment names.

## Usage sweep

When the idea changes an existing product surface (a scene, view, interaction, MCP tool, or API), dispatch a third background sweep beside the prior-art sweeps. Its worker runs the `usage-brief` skill at map scope for the surfaces the idea concerns and returns the brief. Give it a 25-minute cap; it is read-only.

Raise its flags at the grilling questions and the `impact` round they bear on. When the map exists, post the brief as one **Usage** comment on the map and link it from **Notes**. In a public map tracker, the brief goes to a private note outside every public repository, and the comment names that note.

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
| `ship`      | on an open review decision | one per spec, after its implementations   | reviewed draft pull request per [`SHIP.md`](SHIP.md) |

Backticked names in the Resolution column are skills. One grilling ticket is one live exchange, and the `grilling` skill works it in rounds: the whole answerable frontier goes to the human at once, then the tree reshapes. Serial applies to the ticket, not to its questions.

Some prescribed skills, such as `to-spec` and `to-tickets`, set `disable-model-invocation`, so the Skill tool refuses them inside a worker. Every worker prompt says: when the Skill tool refuses a prescribed skill, read that skill's `SKILL.md` file and follow it directly.

## Casting

Use runtime-native workers and choose their models with the model selection policy in the user's agent instructions, when one exists; otherwise the runtime defaults. Apply it to UI work, prototypes, implementation, and nested workers. If the user-selected model is unavailable, record a durable orchestration blocker and ask for a replacement.

Provider bridges are **retired casts**: they report a successful spawn and then die silently minutes later, so a dead worker reads as a live one on the frontier and the map stalls behind it. Where a rubric, addendum, or ticket names one, use a runtime-native worker and record the substitution in the claim comment.

T3 threads cast per [`T3.md`](T3.md).

Review follows [`SHIP.md`](SHIP.md). Review calls are calls the worker waits on and that fail visibly, so the retired-cast rule binds workers, not review calls.

Record the cast in the map's **Notes**: provider, model, and effort per ticket type and for review. Copy it into every dispatch's model and effort fields, and restate **Casting** in the prompt, since a conductor's cast binds only the worker it spawns.

## Ship

A spec's code reaches the human as one pull request. Each implementation ticket resolves when its commits have **landed** on the spec's integration branch; the spec's `ship` ticket resolves when that branch is **shipped**: a reviewed draft pull request, per [`SHIP.md`](SHIP.md). The human reads it, marks it ready for review, and has it merged through `babysit-pr`. The map's **Notes** are where an effort grants merge authority instead; then shipped means merged into `main`.

**Throwaway stays throwaway.** A prototype or research ticket answers a question: its code and notes live on their own `prototype/<name>` or `research/<name>` branch behind a context pointer from the ticket, and `main` keeps only the decision they settled. Folding a validated decision into real code is an `implement` ticket, built fresh.

The worker earns its handoff through the proof gate and the review in [`SHIP.md`](SHIP.md). Anything it cannot prove there is a HITL park.

## Dispatch contract

- Fan out every unblocked, unclaimed non-grilling frontier ticket. If any grilling ticket is already open and claimed, dispatch no other grilling. Dispatch the next grilling only after the active one closes.
- Give every worker a wall-time cap and require a durable report before idle: its resolution, or the exact one question awaiting the human.
- Every worker prompt carries **leave nothing running**: the worker runs each wait it needs in the foreground and ends every turn, a park included, with nothing it started still live: no background command such as `kickoff wait`, watcher, monitor, subagent, or child task. In T3 Code, anything left live keeps the worker's thread, and the conductor that started it, on the Working shelf, so the park never reaches the human's inbox.
- Give every worker that writes files, commits, or checks out a branch its own worktree. A worker in the conductor's checkout can switch the conductor's branch. Serialize shared-file work.
- While a ticket is open, send its follow-up work, such as review fixes, to its existing worker when it touches the same files. Chart every other follow-up, including those in a resolution comment, as its own ticket and dispatch that ticket.
- When a review provider has an **outage** (a 429 or a usage limit), record it and its reset date once in the map's **Notes**, and state it in every dispatch until the reset.
- Reserve one of three map-level CodeRabbit slots before dispatching a `ship` ticket. Hold the slot through review; release it when the ticket is shipped or parked.
- Treat the tracker as semantic truth. Runtime workers and human-attention affordances are projections, never substitutes.
- Keep ordinary AFK work off the human's attention rail. A prototype or spec doing its AFK stretch is also background work until it parks.
- A HITL park is complete only when the ticket has a comment containing the decisions locked as decision lines plus one pending question, and `wayfinder:awaiting-human` is present.
- Every resolution comment records each load-bearing decision the ticket settled as a decision line (see `pr-description`): the human's answers and the worker's own calls.
- A HITL resolution is complete only when its durable handoff comment carries its decision lines and links the resulting artifacts, the ticket is closed, and `wayfinder:awaiting-human` is absent. Then retire its runtime worker from human attention as the matching runtime addendum specifies.

### Lane contract

1. State a wall-time cap before dispatch.
2. Dispatch only through a surface that guarantees a one-shot deadline wake allowing a durable report, or worker termination at the cap. After hard termination, mark the lane orphaned and reconcile its ticket comments, labels, assignment, and closure before re-dispatching or reaping it. If neither enforcement mode is available, record a durable orchestration blocker instead of dispatching. T3 threads are the exception: they notify the conductor and settle themselves, per [`T3.md`](T3.md).
3. On each conductor wake and before completion, health-check lanes whose last durable activity is older than 15 minutes; do not create a polling lane.
4. A lane reports durably before idle; no report means orphaned, not done. Reconcile durable ticket state before any redispatch.
5. Reap every lane and remove its worktree before declaring the map complete, then release the map's compute lease per **Compute lease**.
6. The conductor owns waits as event/state transitions, never background pollers or chained blocking waits. The T3 hold in [`T3.md`](T3.md) is neither: it reads no state and only keeps a waiting conductor out of the human's inbox. A compaction ends every background shell and monitor the conductor started, so the conductor waits on worker notifications.
7. The map has exactly three CodeRabbit slots shared by its `ship` lanes.

## Wake law

On any worker notification, read the tracker per **Reading the frontier** (with `fleet frontier`, one call, then a view of only the ticket that changed); never message the worker merely because it notified.

- **Closed** → verify the resolution, reconcile the runtime attention state, then re-query the frontier.
- **Open + `wayfinder:awaiting-human`** → parked HITL. Surface it once, then stay silent until the human acts.
- **Open + assigned, no awaiting label** → active, queued, or orphaned. Use the runtime addendum to distinguish them without interrogating the worker.
- **Invalidated by another resolution** → record why, stop or retire its runtime worker, clear its human-attention state, and update or close the ticket through Wayfinder's scope rules.

The ticket is durable state; a worker and the conductor's own context are caches. The runtime compacts the conductor's context automatically. Treat a compaction as a resume: reload the map and its **Notes**, re-read the runtime addendum, and [`T3.md`](T3.md) in T3 Code, and run their **Recovery**, then query the frontier per **Conductor loop** before you dispatch. In T3 Code, the old hold is gone; end each turn per **Wait out of the inbox** in [`T3.md`](T3.md). Recovery starts from the map, ticket comments, assignment, labels, and recorded runtime locator.

## Conductor loop

1. Load the map's low-resolution body.
2. Query open child state and compute the unblocked, unclaimed frontier per **Reading the frontier**. `fleet frontier`, when available, returns both in one call.
3. Dispatch per ticket type and runtime addendum.
4. On every tracker transition, reconcile attention state and dispatch newly unblocked work.
5. Graduate newly sharp fog into tickets. Keep the canonical decision lookup index on the map, per **Decision lines on the map**, while preserving ticket comments as the durable evidence for each decision.

Done means **every in-scope ticket is closed, every spec is shipped, every dispatch setup and worker is terminal, no runtime worker remains on the attention rail, and the map's compute lease is released**. An empty frontier alone is not completion: claimed, blocked, and parked tickets are deliberately absent from it.

At done, offer the human a retro of the map with the `retro` skill once. Running it stays their call.
