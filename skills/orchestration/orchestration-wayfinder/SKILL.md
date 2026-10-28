---
name: orchestration-wayfinder
description: Conduct a wayfinder map from charting to reviewed pull requests, dispatching one worker per frontier ticket. Use when asked to conduct a map, or to take one over as its conductor.
---

# Orchestration Wayfinder

One conductor drives a `wayfinder` map from fog through built code. Ticket workers resolve one ticket each; the conductor keeps the frontier moving and surfaces only the work that needs the human.

## Foundation

Read the `wayfinder` skill's `SKILL.md` completely first. Its map, child tickets, native blocking, claims, frontier, parks, fog, and resolution protocol remain authoritative. **Charting rules** and **Reading the frontier** below add to it.

Before the first dispatch, recovery, or attention-state action, identify the runtime and read exactly one addendum completely:

- Codex drives → [`CODEX.md`](CODEX.md)
- Claude Code drives → [`CLAUDE.md`](CLAUDE.md)

When the conductor runs inside T3 Code (`T3CODE_HOME` is set), also read [`T3.md`](T3.md) before the first dispatch: grilling, prototype, spec, HITL task, and `implement` tickets get their own T3 threads.

Consent in this skill rests on a **user request**: the user asked to conduct a map, typed `/orchestration-wayfinder`, or asked to run this skill by name. Without one, such as when another agent's prompt loaded the skill, ask the user once before the first act that needs consent, and name each such act: private chat search and native task creation. A yes counts as a **user request**; a no limits the run to acts that need none.

## Ownership

The **conductor owns map-level coordination**: query and mutate map structure, blockers, frontier, dispatch, recovery, and projected human-attention state. It may record and close an invalidated ticket as scope reconciliation, but it never performs a worker's substantive ticket-resolution mutations. It does no ticket work itself: browser checks, seeding, screenshots, and pull request bodies go to a worker. Outreach, such as a Slack message, stays the human's; the conductor drafts none.

The **ticket worker owns one ticket's resolution**: mutate only that ticket's assignment, comments, labels, resolution, and closure — plus, for an `implement` ticket, its stack's branches and pull requests, and their merge only in a mode the human granted in its thread; use its prescribed skill; and stop after closing it. A worker never mutates other tickets or map-level orchestration state and never dispatches downstream work. The conductor never supplies the human side of a HITL decision or answers a ticket's substantive question.

Charting is the sole undispatched act, apart from its **Prior-art sweeps** and **Usage sweep**. With no map, chart it live through Wayfinder's Chart mode in the **Map tracker**, apply the **Charting rules**, and declare in **Notes** that execution remains inside the map.

## Map tracker

The map and its tickets live in the **map tracker**: the tracker the user's agent instructions name for maps, usually in their skill settings; otherwise the code repo's own tracker, per Wayfinder. The code lives in the **code repo**: worktrees, branches, and pull requests. When the two differ:

- Record `Code repo: <owner/repo>` in the map's **Notes** when you chart it.
- Name the map tracker in every tracker command: `-R <owner/repo>` on `gh issue`, and the map tracker's `repos/<owner>/<repo>/...` path or GraphQL variables on `gh api`, which rejects `-R`. Inside a checkout of the code repo, `gh` infers the code repo.
- Cross-repo references use the full form, `<owner/repo>#<n>`: a ticket links its pull request, and a pull request links its tickets.
- When the map tracker is private and the code repo is public, everything written to the code repo keeps only public context: pull request bodies, comments, commits, and branch names carry the decision and the ticket link, while the numbers, customer data, and internal findings behind it stay on the map.

## Charting rules

These rules bind the first chart and every later graduation of fog into tickets:

- **Impact with the destination.** While you name the destination, run one round of the `impact` check. Write its Impact section into the map body, after **Destination**. When questions stay open, write `Impact: pending <ticket>` there instead and chart a grilling ticket for the rest. Block every non-research ticket on it. That ticket's resolution comment carries the Impact section, and the conductor copies it into the map body. When nothing measures the metric yet, put the instrumentation on the map. Code goes into **Not yet specified**, so the spec covers it and publishes it as a slice of a stack. An insight or dashboard on existing events is a `task` ticket. When the check ends in pushback, chart nothing more until the human chooses to carry on, reshape, or drop.
- **Architecture first.** When the destination changes contracts between modules, the data model, or caching and performance, one of the tickets is an architecture `prototype` that blocks the spec or implementation tickets, so the human shapes the architecture before it is built. Its worker shapes it with the `architecture` skill.
- **Decision lines on the map.** Each decision locked while charting or re-charting goes into the map's Decisions-so-far as a decision line (see `pr-description`), beside the ticket gists.
- **Grilling stays the default** for every open decision. The map's **Notes** may waive it only when the human says so for this map: quote their words and the date. A waiver from another map, a memory, or an earlier session does not carry over; ask the human instead.

## Reading the frontier

Read the map's state with the frontier query of the tracker doc, per Wayfinder. When the `fleet` CLI is available (on `PATH` or at `~/dev/fleet/fleet`; use whichever exists) and the tracker is GitHub, `fleet frontier <map URL>` can replace that query: one call lists every open ticket as frontier, claimed, parked, or blocked, and the closed ones by number. Run it again whenever you need fresh state, instead of viewing tickets one at a time. On GitHub, read one ticket with `gh issue view <n> -R <owner/repo> --json title,body,labels,assignees,state`, and add `comments` to the fields only when you need its discussion or resolution.

## Prior-art sweeps

When charting starts from a loose idea instead of an existing map or ticket, dispatch two background sweeps before the first grilling question. Each sweep finds out whether others already discussed the problem, have the same problem, or started to solve it:

- **Chat**: threads in the team's chat, such as Slack, in every channel the human can see, from any user and team, not only the human's own. Search public and private channels and DMs; a **user request** grants the consent that private search asks for.
- **Issue trackers**: issues and pull requests in every state (open, draft, closed, merged) across the internal and public repositories of the organization the idea concerns. When that organization has a public community forum, search it too.

Each sweep returns an inventory, not an analysis. Every entry carries its link, date, author or team, and one line on how it relates. A sweep with no matches, or whose source is unreachable, says so. Give each sweep a 15-minute cap; sweeps are read-only.

Raise each finding at the grilling question it bears on. When the map exists, post both inventories as one **Prior art** comment on the map and link it from **Notes**. In a public repository, that comment keeps only public links; chat findings and other private findings go to a private note, outside every public repository, that the comment names.

## Usage sweep

When the first chart, or a later graduation of fog, adds tickets that change an existing product surface the map has not briefed yet (a scene, view, interaction, MCP tool, or API), dispatch a usage sweep. Its worker runs the `usage-brief` skill at map scope for those surfaces and returns the brief. Give it a 25-minute cap. It writes only the queries it saves in the analytics project.

Take the analytics project from the user's agent instructions, or ask the human for it once, and record it in **Notes** as `Analytics project: <project>`. Every usage sweep and element pass prompt carries it.

When the map has an Impact section, mark its expected move `pending usage brief` until the brief lands. Then size the move from the brief and, unless the work is pushback-exempt, run the **Push back** step of `impact` before the next dispatch of a non-research ticket. When Impact is pending a grilling ticket instead, dispatch that ticket with the brief's link, so it sizes the move from the brief. Raise each flag and each proposed bar at the grilling question it bears on, and record each bar the human confirms in **Notes** as `Usage bar: <flag>: <bar>`, stated as a share, never as a count. When the map exists, post the brief as one **Usage** comment on the map and link it from **Notes**. In a public map tracker, the brief goes to a private note outside every public repository, and the comment names that note.

## One map, root to leaves

Planning and execution share one tree. A resolved spec publishes its spec child and its **stacks** beneath it, per **Stacks** below; after the **Build-plan park**, those become new frontier tickets. The destination is reached in this map, not handed to a second tracker.

## Stacks

A spec reaches the frontier as **stacks** of draft pull requests. Each pull request is a thin vertical slice, a tracer bullet that delivers user value on its own. Stacks go out in parallel, so prefer several short independent stacks, or standalone pull requests, over one long chain.

- **Size.** A pull request holds at most about 400 changed production lines, the slice rule of `full-send`. A stack aims for 5 pull requests and never holds more than 10; more work becomes the next stack, blocked by this one.
- **Cut.** The `spec` worker slices the spec with `to-tickets`, one slice per pull request, and groups the slices into stacks: slices that share a file go in one stack, ordered by the `Blocked by` edges from `to-tickets`. Shared **hot files**, such as lockfiles, index files, and migration folders, join nothing. Slices with no file in common go in separate stacks. Each stack is one `implement` ticket, natively blocked by each stack that holds a slice one of its slices needs. When the blocking forms a cycle, merge the stacks in it.
- **Body.** A stack's ticket lists its pull requests in merge order as a checklist. Each item carries the slice's title, acceptance criteria, and estimated changed production lines, and links its section of the spec. The body names the files the stack owns, the one place a ticket names paths, and its **seams**: the interfaces and files it shares with sibling stacks.
- **Build plan.** The `spec` worker's resolution comment carries the build plan: a tree diagram of the stacks and their pull requests, the merge order, the estimated changed production lines and the predicted merge risk (`merge-risk`) per pull request, and the recommended mode per stack thread, `full-stop` unless a reason is given.
- **Lane.** Each stack runs in its own top-level thread and worktree, per [`SHIP.md`](SHIP.md). Its wall-time cap scales with its pull request count, and each ticked pull request counts as durable activity.

### Build-plan park

After a spec ticket closes, and before any of its stack threads launches, the conductor parks the build plan as one HITL question on the map: a map comment with the plan and the question "Approve this build plan, or edit it?", and `wayfinder:awaiting-human` on the map. End the turn with the plan as the final reply and the question last. Apply the human's edits to the stack tickets and the board, remove the label, then launch. The mode column recommends; it grants nothing.

### Stacks board

The map body carries the conductor's address and one row per stack in exactly this format, which a daily digest parses. The conductor keeps it current:

```md
Conductor: [<thread title>](t3-thread://v1/<thread id>)

## Stacks
| Stack | Thread | Mode | PRs | State |
| --- | --- | --- | --- | --- |
| <name> | [<title>](t3-thread://v1/<id>) | full-stop | owner/repo#1, owner/repo#2 | building |
```

Outside T3 Code, the `Conductor` line and the Thread cell carry the runtime's locator. A standalone pull request is a stack of one. State is one of:

- `planned`: charted, no thread yet.
- `building`: the thread builds, reviews, or babysits its drafts.
- `review`: handed back; the drafts wait on the human.
- `ready`: marked ready; waiting on an approval.
- `merging`: `rollout` merges the stack.
- `rolling-out`: `rollout` watches the deploy and stages the flags.
- `done`: merged, and rolled out when `rollout` ran.
- `blocked`: parked on another question, or behind an orchestration blocker.

A stack thread sends the conductor a state notice, `stack <name>: <state> (<mode>)`, on each change of its state or mode. The conductor updates the row and posts one map comment per state change: `<stack>: <state>`.

## Ticket types

| Type        | Human loop      | Dispatch                                  | Resolution                                  |
| ----------- | --------------- | ----------------------------------------- | ------------------------------------------- |
| `grilling`  | live throughout | serial, one at a time                     | `grilling` + `domain-modeling`              |
| `prototype` | decision at end | parallel AFK stretch, then park           | `prototype`, or `architecture` for an architecture prototype; throwaway |
| `spec`      | decision at end | parallel AFK stretch, then park           | `to-spec` + spec pass + `to-tickets`, cut into **Stacks** |
| `research`  | none            | parallel                                  | `research`, throwaway                       |
| `task`      | as required     | parallel when AFK                         | prerequisite work for a decision            |
| `implement` | at handback     | parallel across stacks after the **Build-plan park**, one top-level thread and worktree each | one stack: `full-stop` per pull request, then the mode the human grants, per [`SHIP.md`](SHIP.md) |

Backticked names in the Resolution column are skills. A `spec` worker writes the `to-spec` draft as a comment on its ticket and runs the spec pass in `SPEC.md` of the `qa-swarm` skill on it before it publishes the spec. The park's one question asks the human to approve the draft and carries the pass's Decisions, each with its recommended answer. The worker publishes after the human answers. One grilling ticket is one live exchange, and the `grilling` skill works it in rounds: the whole answerable frontier goes to the human at once, then the tree reshapes. Serial applies to the ticket, not to its questions.

## Casting

Use runtime-native workers and choose their models with the model selection policy in the user's agent instructions, when one exists; otherwise the runtime defaults. Apply it to UI work, prototypes, implementation, and nested workers. If the user-selected model is unavailable, record a durable orchestration blocker and ask for a replacement.

Provider bridges are **retired casts**: they report a successful spawn and then die silently minutes later, so a dead worker reads as a live one on the frontier and the map stalls behind it. Where a rubric, addendum, or ticket names one, use a runtime-native worker and record the substitution in the claim comment.

T3 threads cast per [`T3.md`](T3.md).

Review follows [`SHIP.md`](SHIP.md). Review calls are calls the worker waits on and that fail visibly, so the retired-cast rule binds workers, not review calls.

Record the cast in the map's **Notes**: provider, model, and effort per ticket type and for review. Copy it into every dispatch's model and effort fields, and restate **Casting** in the prompt, since a conductor's cast binds only the worker it spawns.

## Ship

A spec's code reaches the human as stacks of reviewed draft pull requests, per [`SHIP.md`](SHIP.md). Every stack thread runs `full-stop` and hands back; only the human's own words in that thread switch it, per **Modes** in [`SHIP.md`](SHIP.md).

**Throwaway stays throwaway.** A prototype or research ticket answers a question: its code and notes live on their own `prototype/<name>` or `research/<name>` branch behind a context pointer from the ticket, and `main` keeps only the decision they settled. Folding a validated decision into real code is an `implement` ticket, built fresh. When the human accepts a UI prototype and asks to build it, the conductor charts that `implement` ticket under the map, copies the prototype's element checklist with its screenshots into its body, and dispatches it. The ticket's `ui-walk` proof checks the build against it. Without a spec, the ticket ships as a standalone pull request, per [`SHIP.md`](SHIP.md).

The worker earns its handoff through the proof gate and the review in [`SHIP.md`](SHIP.md). Anything it cannot prove there is a HITL park.

## Dispatch contract

- Fan out every unblocked, unclaimed non-grilling frontier ticket. If any grilling ticket is already open and claimed, dispatch no other grilling. Dispatch the next grilling only after the active one closes.
- Render every ticket worker's prompt from the map's template per [`LANE.md`](LANE.md).
- Every prompt for a `prototype` ticket that changes an existing UI carries the **element pass**: before drafting variants, run the `usage-brief` skill at element scope for the controls and flows the variants touch, with the map's analytics project, **Usage** comment, and confirmed bars as the start. Post the brief as a ticket comment, or in a public map tracker as a private note the comment names. Add the name of each flag a variant trips and the control it trips on to that variant's switcher label, such as `B (Overflow menu) · low use: Export`. Flag names and controls, without numbers, are the one usage finding a prototype branch in a public code repo may carry.
- **Walks experiment.** When the user's agent instructions turn on the walks experiment for a map, record `Experiment: walks` in its **Notes** at charting. While the line stands, every prompt for a `spec` or `implement` ticket carries the order to read [`WALKS.md`](WALKS.md).
- Give every worker that writes files, commits, or checks out a branch its own worktree. A worker in the conductor's checkout can switch the conductor's branch. Serialize shared-file work: it belongs in one stack.
- Before each dispatch that creates a worktree, run `<fleet> disk` when the `fleet` CLI is available. `Disk is critical` with exit 1 means this machine is too full for one more worktree: record a durable orchestration blocker in the map's **Notes** with that message, cue the human once to free space, and dispatch only work that needs no new worktree. Remove the blocker when `<fleet> disk` prints `Disk: …G free.` again. Any other output means the check is unavailable; dispatch as usual. `t3-kickoff` checks its own launches either way.
- While a ticket is open, send its follow-up work, such as review fixes, to its existing worker when it touches the same files. Chart every other follow-up, including those in a resolution comment, as its own ticket and dispatch that ticket.
- When a review provider has an **outage** (a 429 or a usage limit), record it and its reset date once in the map's **Notes**, and state it in every dispatch until the reset.
- Reserve one of three map-level CodeRabbit slots before launching a stack thread. Hold the slot through review; release it when the stack parks.
- Keep ordinary AFK work off the human's attention rail. A prototype or spec doing its AFK stretch is also background work until it parks.
- A HITL park is complete only when the ticket has a comment containing the decisions locked as decision lines plus one pending question, and `wayfinder:awaiting-human` is present.
- Every resolution comment records each load-bearing decision the ticket settled as a decision line (see `pr-description`): the human's answers and the worker's own calls.
- A HITL resolution is complete only when its durable handoff comment carries its decision lines and links the resulting artifacts, the ticket is closed, and `wayfinder:awaiting-human` is absent. Then retire its runtime worker from human attention as the matching runtime addendum specifies.

### Lane contract

1. State a wall-time cap before dispatch.
2. Dispatch only through a surface that guarantees a one-shot deadline wake allowing a durable report, or worker termination at the cap. After hard termination, mark the lane orphaned and reconcile its ticket comments, labels, assignment, and closure before re-dispatching or reaping it. If neither enforcement mode is available, record a durable orchestration blocker instead of dispatching. T3 threads are the exception: they notify the conductor and settle themselves, per [`T3.md`](T3.md).
3. On each conductor wake and before completion, health-check lanes whose last durable activity is older than 15 minutes; do not create a polling lane.
4. A lane reports durably before idle; no report means orphaned, not done. Reconcile durable ticket state before any redispatch.
5. Reap every lane and remove its worktree before declaring the map complete.
6. The conductor owns waits as event/state transitions, never background pollers or chained blocking waits; the T3 hold in [`T3.md`](T3.md) is neither. A compaction ends every background shell and monitor the conductor started, so the conductor waits on worker notifications.

## Wake law

On any worker notification, read the tracker per **Reading the frontier** (with `fleet frontier`, one call, then a view of only the ticket that changed); never message the worker merely because it notified.

- **Closed** → verify the resolution, reconcile the runtime attention state, then re-query the frontier.
- **Open + `wayfinder:awaiting-human`** → parked HITL. Surface it once, then stay silent until the human acts.
- **Open + assigned, no awaiting label** → active, queued, or orphaned. Use the runtime addendum to distinguish them without interrogating the worker.
- **Invalidated by another resolution** → record why, stop or retire its runtime worker, clear its human-attention state, and update or close the ticket through Wayfinder's scope rules.

The tracker is semantic truth; a worker, a human-attention affordance, and the conductor's own context are caches. Treat a compaction as a resume: reload the map and its **Notes**, re-read the runtime addendum, and [`T3.md`](T3.md) in T3 Code, and run their **Recovery**, then query the frontier per **Conductor loop** before you dispatch.

## Conductor loop

1. Load the map's low-resolution body.
2. Query open child state and compute the unblocked, unclaimed frontier per **Reading the frontier**. `fleet frontier`, when available, returns both in one call.
3. Dispatch per ticket type and runtime addendum.
4. On every tracker transition, reconcile attention state and dispatch newly unblocked work.
5. Graduate newly sharp fog into tickets. Keep the canonical decision lookup index on the map, per **Decision lines on the map**, while preserving ticket comments as the durable evidence for each decision.

Done means **every in-scope ticket is closed, every stack on the board is `done`, every dispatch setup and worker is terminal, and no runtime worker remains on the attention rail**. An empty frontier alone is not completion: claimed, blocked, and parked tickets are deliberately absent from it.

At done, offer the human a retro of the map with the `retro` skill once. Running it stays their call.
