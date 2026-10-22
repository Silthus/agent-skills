# Orchestration Wayfinder — shipping a spec

Read this before a spec's first implementation dispatch. [`SKILL.md`](SKILL.md) owns _when_ work ships; this file owns how it lands and what earns the handoff.

A spec ships as one **integration branch**, `spec/<slug>`, unless it says `Ships as: per-slice pull requests`, per **Per-slice pull requests** below. Each strand, an `implement` ticket per **Strands** in [`SKILL.md`](SKILL.md), **lands** its slices there one by one; the spec's `ship` ticket turns the branch into one reviewed draft pull request.

## Integration branch

When a spec publishes its strands, the conductor creates `spec/<slug>` from `main`, or from the integration branch of a spec it is blocked by whose pull request is still open, so the two pull requests form a stack. It records the branch and `Base: <sha>`, the commit it was created from, on the `ship` ticket and in the map's decision index.

## Shared notes

When several of a spec's tickets need the same exploration, one research worker does it first and saves its notes in `$(git rev-parse --git-common-dir)/wayfinder/<map>/notes/`, outside the tree and shared by every worktree. Worker prompts carry **context pointers**: the spec, the ticket, those notes, and earlier commits, never a restatement of them.

## Strand

One lane builds the strand's slices in the order its checklist gives. A ticket without a spec, and every strand of a spec that ships as per-slice pull requests, follows **Per-slice pull requests** below instead.

1. Work in an own worktree on `spec/<slug>-<n>`, where `<n>` is the strand's issue number. `spec/<slug>` is already a ref, so Git can't create a branch beneath it. When that branch exists, work in the previous lane's worktree if it still holds the branch; otherwise check the branch out, locally or from origin, in a new worktree. A slice whose commits already sit on the integration branch but whose item is unticked has landed: tick it, then resume at the first unticked slice. Otherwise branch from the integration branch tip and post that tip as `Start: <sha>` on the ticket. Confirm the base before the first edit.
2. For each slice in order, build it with the `tdd` skill and gather the proof bundle below.
3. **Land** each slice: merge the integration branch tip into the strand branch, run the repo's full local gate green, push to the integration branch as a fast-forward, and push the strand branch to origin. A rejected push means another strand landed first: merge again and repeat. Tick the slice's checklist item with its own commits, `git log --first-parent --no-merges --format=%h <newest commit of the previous tick, or the start>..HEAD`.
4. **Review** the strand once, after its last slice lands: one review from the model family that did not write it, with the spec as the oracle. The strand's diff is its own commits, the ticked ones, read with `git show`, plus each of its merge commits whose resolution changed a file, read with `git show --remerge-diff`. As seam context, the brief carries the other strands' commits on the integration branch, `git log --no-merges <Base>..<tip>` without the strand's own, and asks for **seams**: one concept built twice, a flag one strand reads that another records, a rollback or schema revert that strands another strand's data. Post each review's findings and outcomes on the ticket as it finishes. Fix what holds red first and land each fix. Each landed fix gets one final read of its own commits, until a read comes back clean. A finding that contradicts an earlier one, or comes back after its fix, is a park.
5. Write the resolution comment: the landed commits per slice, the proof, each review with its findings and their outcomes, its decision lines, and the follow-ups. Close the ticket and remove the worktree.

## Proof bundle

Every claim is an artifact linked from the ticket, never a sentence:

- **red** — the test that reproduces the bug or expresses the missing behaviour, failing on the tree before the change;
- **green** — that same test passing after it, every assertion intact and no test skipped;
- the repo's full local gate green on the landed tree, or on the pull request head for a ticket that ships by its own pull request;
- for any change to a browser UI, the `ui-walk` proof from the `qa-swarm` skill's `PROOF.md`.

An artifact the worker cannot produce is a park, recorded as the one pending question for the human.

## Ship ticket

The `ship` ticket unblocks when every `implement` ticket of its spec has closed. Its worker never built the code, so it reviews with fresh eyes:

1. Open a draft pull request in the code repo from the integration branch with the `pr-description` skill, closing the spec and its tickets, per **Map tracker** in [`SKILL.md`](SKILL.md) when they live in another repo. The Summary maps each strand and its slices to their commits, which are the reading order. The body carries the Decisions block the `pr-description` skill defines: when the `fleet` CLI is available (on `PATH` or at `~/dev/fleet/fleet`), `fleet decisions <map URL>` collects the decision lines of the map and its closed tickets with the Involvement counts; otherwise, copy them by hand from the map's Decisions-so-far and each ticket's resolution comment. The spec stays one pull request; a `qa-swarm` split step keeps it whole.
2. Review the whole branch against its base, with the spec as the oracle, the way the PR workflow in the user's agent instructions prescribes, when one exists; otherwise one review from the other model family, or the `qa-swarm` skill where those instructions call for it. Two strands or slices that built the same concept twice, such as one field under two names, are a finding. The danger areas are the ones `merge-risk` lists, as written; a docs-only diff has none.
3. Fix every finding that holds in this one worker, gate green, and push. Append each load-bearing call you made during the review as a row of the Decisions block, marked per `pr-description`. A question you leave for the human goes on its Open line. Add the reviews run to its Involvement line.

## Review

A review that leaves a decision open is a park: decisions locked plus the one pending question. The ticket stays parked until the human answers; more review rounds never unpark it, so the conductor never re-dispatches a worker to keep reviewing.

## Handoff

The terminal is the reviewed draft pull request with every finding fixed or rejected. The ship worker links it in the resolution comment with the reviewed head, the proof, its decision lines, and the follow-ups. Then it closes the ticket. The conductor graduates the follow-ups into tickets.

## Per-slice pull requests

A spec that says `Ships as: per-slice pull requests` has no integration branch and no `ship` ticket; neither does a ticket without a spec, which is one slice. The lane works in its own worktree and builds each slice per step 2 of **Strand**, then opens its draft pull request with the `pr-description` skill and ticks the slice's item with its link: the first on a branch off the default branch or, while its blockers' pull requests are open, off the last pull request branch of the ticket before it in its strand, with each other open blocker's pull request branch merged in, and each later slice stacked on the previous slice's branch. A description that builds on another pull request names it as merge-first. Each pull request gets the review the PR workflow in the user's agent instructions prescribes. A strand of several pull requests adds the seam read of step 4 over their combined diff. The lane then runs the Handoff above itself and removes its worktree.

## Merge, when the map grants it

When the map's **Notes** grant merge authority, the worker that owns the pull request drives it to merged after the handoff, following the repo's prescribed ship-to-main procedure and whatever main-safety gate that repo defines. The terminal is then a merged commit: the worker links it in the resolution comment and closes the ticket on it. A red gate is reported on the ticket and parked rather than merged past.
