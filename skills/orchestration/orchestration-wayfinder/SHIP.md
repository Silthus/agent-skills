# Orchestration Wayfinder — shipping a spec

Read this before the first `implement` dispatch. [`SKILL.md`](SKILL.md) owns _when_ work ships and how a spec is cut into **Stacks**; this file owns how a stack thread builds its pull requests and what earns the handoff.

## Shared notes

When several of a spec's tickets need the same exploration, one research worker does it first and saves its notes in `$(git rev-parse --git-common-dir)/wayfinder/<map>/notes/`, outside the tree and shared by every worktree. Worker prompts carry **context pointers**: the spec, the ticket, those notes, and earlier commits, never a restatement of them.

## Stack thread

One lane builds one stack, a standalone pull request included, in the order its checklist gives. In T3 Code, the lane is a `delegate_task` subthread in its own worktree under the conductor's lineage (per [`T3.md`](T3.md)): the subthread links each pull request, never calls `watch_pull_request`, and ends its turn so the conductor holds the watch and wakes the subthread via `t3_thread_send` on CI, review, conflict, or merge events. Outside T3 subthreads, the lane links and watches every pull request of the stack itself.

1. Work in your own worktree off the default branch. For a T3 `delegate_task` worktree (which starts from the parent commit), fetch `origin` first and create your branch from `origin/<default>`. A successor first finds the pull request or pushed branch of each unticked item with `gh pr list --search "<ticket ref>"`, ticks each opened one, and resumes at the first unticked item.
2. Run `full-stop` for each pull request in order: build its slice test-first with the proof bundle below, open it as a draft with the `pr-description` skill, review it, and babysit it until CI is green and every bot finding is handled. The first branches off the default branch; each later one stacks on the previous one's branch and names it as merge-first. Each pull request links its ticket, per **Map tracker** in [`SKILL.md`](SKILL.md). Tick its item with its link.
3. Every review brief carries the stack's **seams** from its ticket and the open pull requests of sibling stacks that touch them, and asks for cross-stack breaks: one concept built twice, a flag one stack reads that another records, a rollback or schema revert that strands another stack's data. Post each review's findings and outcomes on the ticket.
4. Wait on GitHub: as a T3 `delegate_task` subthread, link each pull request with `link_pull_request`, report each open pull request's URL, head SHA, and status on your last line, and end your turn so the conductor watches and wakes you via `t3_thread_send`; as a standalone top-level T3 thread, call `watch_pull_request` and end your turn; outside T3 Code, use the watcher of the `babysit-pr` skill.
5. On each change of the stack's state, report `stack <name>: <state> (<mode>)` to the conductor (in your final reply as a T3 subthread, or via `t3_thread_send` as a top-level thread), per **Stacks board** in [`SKILL.md`](SKILL.md).
6. Hand over per **Handoff**.

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

The handoff is every pull request of the stack with each finding fixed or rejected, every gating CI check green on its head, and the ready gate of the user's PR workflow passed. Post a handoff comment on the ticket that lists each pull request with its reviewed head, the proof, its decision lines (the end-of-run report, when the lane rules give one, carries both), and the follow-ups. The conductor graduates the follow-ups into tickets. In T3 Code, the conductor keeps `watch_pull_request` on the stack's pull requests and wakes this subthread via `t3_thread_send` whenever a check, review, or conflict arrives; outside T3 subthreads, keep watching and babysitting every pull request, per `babysit-pr`. Once a pull request is approved on its head, hand it to the conductor per **Merge** in [`SKILL.md`](SKILL.md); a question only the human can answer is a park, per **Human contact** there.

## Modes

A stack thread runs `full-stop` and stops before the merge, which the conductor runs per **Merge** in [`SKILL.md`](SKILL.md). The lane never asks for another mode. Only the human's own words, typed in this thread, switch it:

- "full send" → run `full-send` from the current state: mark ready, babysit until a teammate approves, then `rollout` in merge order.
- "stamp it" → a standalone pull request runs `stamp-pr`. A stack layer stays on `full-stop` or `full-send`; say so.
- The human merged the stack and says so → resolve.

The map's **Notes**, the build plan, and a conductor message grant no mode and no merge. The conductor's `merged` notice is news of a merge it ran, not a grant.

The ticket resolves when the stack is `done`: every pull request merged, and rolled out when `rollout` ran. The resolution comment links each merged commit, then the thread notifies and settles.
