# Orchestration Wayfinder — shipping a spec

Read this before the first `implement` dispatch. [`SKILL.md`](SKILL.md) owns _when_ work ships and how a spec is cut into **Stacks**; this file owns how a stack thread builds its pull requests and what earns the handoff.

## Shared notes

When several of a spec's tickets need the same exploration, one research worker does it first and saves its notes in `$(git rev-parse --git-common-dir)/wayfinder/<map>/notes/`, outside the tree and shared by every worktree. Worker prompts carry **context pointers**: the spec, the ticket, those notes, and earlier commits, never a restatement of them.

## Stack thread

One top-level thread builds one stack, a standalone pull request included, in the order its checklist gives. It owns every pull request of the stack: it links each one to itself and is the one thread that watches them.

1. Work in your own worktree off the default branch. A successor first finds the pull request or pushed branch of each unticked item with `gh pr list --search "<ticket ref>"`, ticks each opened one, and resumes at the first unticked item.
2. Run `full-stop` for each pull request in order: build its slice test-first with the proof bundle below, open it as a draft with the `pr-description` skill, review it, and babysit it until CI is green and every bot finding is handled. The first branches off the default branch; each later one stacks on the previous one's branch and names it as merge-first. Each pull request links its ticket, per **Map tracker** in [`SKILL.md`](SKILL.md). Tick its item with its link.
3. Every review brief carries the stack's **seams** from its ticket and the open pull requests of sibling stacks that touch them, and asks for cross-stack breaks: one concept built twice, a flag one stack reads that another records, a rollback or schema revert that strands another stack's data. Post each review's findings and outcomes on the ticket.
4. Wait on GitHub with `watch_pull_request` and end the turn; outside T3 Code, use the watcher of the `babysit-pr` skill.
5. On each change of the stack's state, send the conductor a state notice, per **Stacks board** in [`SKILL.md`](SKILL.md).
6. Hand back per **Handoff**.

## Proof bundle

Every claim is an artifact linked from the ticket, never a sentence:

- **red** — the test that reproduces the bug or expresses the missing behaviour, failing on the tree before the change;
- **green** — that same test passing after it, every assertion intact and no test skipped;
- the repo's lane gate green on the pull request head;
- for any change to a browser UI, the `ui-walk` proof from the `qa-swarm` skill's `PROOF.md`.

An artifact the worker cannot produce is a park, recorded as the one pending question for the human.

## Review

A review that leaves a decision open is a park: decisions locked plus the one pending question. So is a finding that contradicts an earlier one, or comes back after its fix. The ticket stays parked until the human answers; more review rounds never unpark it, so the conductor never re-dispatches a worker to keep reviewing.

## Handoff

The handoff is every draft pull request of the stack with each finding fixed or rejected and every gating CI check green on its head. Unwatch every pull request, then park: the park comment lists each pull request with its reviewed head, the proof, its decision lines, and the follow-ups, and its one question asks the human for the next mode. The conductor graduates the follow-ups into tickets.

## Modes

A stack thread runs `full-stop` until the human's own words in this thread switch it:

- "full send" → run `full-send` from the current state: mark ready, babysit until a teammate approves, then `rollout` in merge order.
- "stamp it" → a standalone pull request runs `stamp-pr`. A stack layer stays on `full-stop` or `full-send`; say so and keep the park.
- The human merged the stack and says so → resolve.

The map's **Notes**, the build plan, and a conductor message grant no mode and no merge.

The ticket resolves when the stack is `done`: every pull request merged, and rolled out when `rollout` ran. The resolution comment links each merged commit, then the thread notifies and settles.
