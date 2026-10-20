# Orchestration Wayfinder — shipping a spec

Read this before a spec's first implementation dispatch. [`SKILL.md`](SKILL.md) owns _when_ work ships; this file owns how it lands and what earns the handoff.

A spec ships as one **integration branch**, `spec/<slug>`. Each implementation ticket **lands** its commits there; the spec's `ship` ticket turns the branch into one reviewed draft pull request.

## Integration branch

When a spec publishes its implementation tickets, the conductor creates `spec/<slug>` from `main`, or from the integration branch of a spec it is blocked by whose pull request is still open, so the two pull requests form a stack. It records the branch on the `ship` ticket and in the map's decision index.

## Shared notes

When several of a spec's tickets need the same exploration, one research worker does it first and saves its notes in `$(git rev-parse --git-common-dir)/wayfinder/<map>/notes/`, outside the tree and shared by every worktree. Worker prompts carry **context pointers**: the spec, the ticket, those notes, and earlier commits, never a restatement of them.

## Implementation ticket

1. Work in an own worktree on `spec/<slug>-<n>`, where `<n>` is the ticket's issue number, branched from the integration branch tip. `spec/<slug>` is already a ref, so Git can't create a branch beneath it. Confirm that base before the first edit.
2. Build with the `tdd` skill and gather the proof bundle below.
3. **Land**: merge the integration branch tip into the ticket branch, run the repo's full local gate green, and push to the integration branch as a fast-forward. A rejected push means another ticket landed first: merge again and repeat.
4. Write the resolution comment: the landed commit, the proof, its decision lines, and the follow-ups. Close the ticket and remove the worktree.

## Proof bundle

Every claim is an artifact linked from the ticket, never a sentence:

- **red** — the test that reproduces the bug or expresses the missing behaviour, failing on the tree before the change;
- **green** — that same test passing after it, every assertion intact and no test skipped;
- the repo's full local gate green on the landed tree;
- for any user-facing surface, the `ui-walk` proof from the `qa-swarm` skill's `PROOF.md`: screenshots of HEAD on a seeded preview, with the ticket's element checklist ticked when it has one.

An artifact the worker cannot produce is a park, recorded as the one pending question for the human.

## Ship ticket

The `ship` ticket unblocks when every implementation ticket of its spec has landed. Its worker never built the code, so it reviews with fresh eyes:

1. Open a draft pull request in the code repo from the integration branch with the `pr-description` skill, closing the spec and its tickets, per **Map tracker** in [`SKILL.md`](SKILL.md) when they live in another repo. The Summary maps each ticket to its commits, which are the reading order. The body carries the Decisions block the `pr-description` skill defines: when the `fleet` CLI is available (on `PATH` or at `~/dev/fleet/fleet`), `fleet decisions <map URL>` collects the decision lines of the map and its closed tickets with the Involvement counts; otherwise, copy them by hand from the map's Decisions-so-far and each ticket's resolution comment. The spec stays one pull request; a `qa-swarm` split step keeps it whole.
2. Review the whole branch against its base, with the spec as the oracle, the way the PR workflow in the user's agent instructions prescribes, when one exists; otherwise one review from the other model family, or the `qa-swarm` skill where those instructions call for it. Two tickets that built the same concept twice, such as one field under two names, are a finding. The danger areas are the ones `merge-risk` lists, as written; a docs-only diff has none.
3. Fix every finding that holds in this one worker, gate green, and push. Append each load-bearing call you made during the review as a row of the Decisions block, marked per `pr-description`. A question you leave for the human goes on its Open line. Add the reviews run to its Involvement line.

## Review

A review that leaves a decision open is a park: decisions locked plus the one pending question. The ticket stays parked until the human answers; more review rounds never unpark it, so the conductor never re-dispatches a worker to keep reviewing.

## Handoff

The terminal is the reviewed draft pull request with every finding fixed or rejected. The ship worker links it in the resolution comment with the reviewed head, the proof, its decision lines, and the follow-ups. Then it closes the ticket. The conductor graduates the follow-ups into tickets.

## Per-ticket pull requests

A spec whose implementation tickets already opened their own pull requests finishes that way and gets no `ship` ticket. Each remaining ticket opens a draft pull request with the `pr-description` skill from its own branch, stacked on its blocker's pull request branch, and runs the Review and Handoff above itself.

## Merge, when the map grants it

When the map's **Notes** grant merge authority, the worker that owns the pull request drives it to merged after the handoff, following the repo's prescribed ship-to-main procedure and whatever main-safety gate that repo defines. The terminal is then a merged commit: the worker links it in the resolution comment and closes the ticket on it. A red gate is reported on the ticket and parked rather than merged past.
