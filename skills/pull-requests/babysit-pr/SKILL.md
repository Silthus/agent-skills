---
name: babysit-pr
description: >-
  Merge a ready PR and run its post-deploy watch. Use when the user asks to
  monitor, watch, or babysit a PR, or to watch a merged PR after its deploy.
---

# Babysit PR

Babysitting starts when the user has marked a PR ready for review and asks you
to babysit it. For a PR that is already merged, start at Landed. Babysitting
ends when the post-deploy watch is done or parked, as Landed describes. The
user owns the rollout of the PR's feature flags.

When babysitting starts and the PR changes runtime behavior, register the
post-deploy watch as owed. When the `fleet` CLI is available (on `PATH` or at
`~/dev/fleet/fleet`), run
`fleet proof require --repo <owner/repo> --pr <number> --commit <head SHA> --kinds post-deploy-watch`.
Otherwise, register it in the ledger. For a PR that never ran the swarm,
create the ledger where step 2.5 of the `qa-swarm` skill puts it. Until the
merge, `fleet proof gate` without `--landed` lists the watch as pending.

## Ready

When the user says the PR is ready, close the review-bot threads before
anything else:

1. List every unresolved review thread as bot or human, answered or
   unanswered. When the `fleet` CLI is available, run
   `fleet pr bot-threads --repo <owner/repo> --pr <number>`. It prints that
   list and exits 1 while an unanswered bot thread remains. Otherwise read
   the `reviewThreads` field through `gh api graphql`.
2. Reply to each unanswered bot thread as
   [`TRIAGE.md`](../qa-swarm/TRIAGE.md) of the `qa-swarm` skill says.
3. Resolve every bot thread whose last comment is yours: run the command
   again with `--resolve`, or use the `resolveReviewThread` mutation. Human
   threads stay open.
4. Report every open human thread, together with every bot thread whose item
   waits on a Decision.

The gate is done when no unanswered or unresolved bot thread remains. A bot
thread whose item waits on a Decision holds the gate until the user answers.
Then start monitoring.

## Monitor

Use the harness's PR-monitoring tools when it has them. Otherwise, poll the
PR for new reviews, comments, and checks.

Act on reviews, comments, and checks newer than the latest push, and triage
each one per `TRIAGE.md`. Every push you make gets a final read of its
diff: one review from the other model family for a fix that changes
behavior, and your own `git range-diff` check for a rebase or a reworded
fix. Record it: start it with
`fleet proof review-start ... --scope final --base <last reviewed SHA>` and
finish it with `fleet proof review-finish ... --round final <findings file>`
when the CLI is available, else in the ledger. Follow the PR workflow and
model selection policy in the user's agent instructions.

Keep the branch mergeable. Rebase on the base branch when it conflicts, or
when the repo requires an up-to-date branch outside a merge queue. When an
overlapping PR makes this one obsolete, stop monitoring and report it. Close
the PR only when the user explicitly authorized closure; otherwise ask.

Post only when something changed.

## Merge

The user's request to babysit authorizes the merge. Merge when all of these
hold on HEAD:

- A reviewer approved it, and no review requests changes.
- Every gating check, as `qa-swarm` defines it, is green.
- No Decision is open. An open thread is fine only when its item is fixed
  and only the reply waits for the user's approval.
- The branch has no conflict.

Merge through the repo's merge queue when it has one, otherwise with a merge
method the repo allows. Push nothing while the queue holds the PR. A failed
queue run is a failed check: triage it and queue the PR again once.

When the user cannot approve CI runs or merge in the repo, report a PR that
waits for either as waiting for a maintainer. Check the user's permission
with `gh repo view <owner/repo> --json viewerPermission` and the repo's rules
for CI approval and merges.

Monitor until the PR is merged, then report the merge commit. Stop earlier
only when the user says to stop or the PR closes without a merge, and report
that.

## Landed

When the PR changes runtime behavior, run the post-deploy watch that
[`PROOF.md`](../qa-swarm/PROOF.md) of the `qa-swarm` skill defines. A PR with
no runtime change owes no watch, and babysitting ends with the merge report.

Every `fleet proof` command here takes `--commit <head SHA>`: the PR's final
head, from `gh pr view <number> --json headRefOid`, never the merge commit.

1. Find when the merge commit reached production from the repo's deploy
   signal, such as the PostHog `checking-deploy-timing` skill, a deploy
   workflow run, or a release tag. When no deploy of the merge commit shows
   up within 24 hours of the merge, record a gap and stop waiting.
2. Map each changed path to its signals: the services, error groups, log
   sources, and metrics that carry it. Record the map in the ledger for the
   second check. The map is done when every changed path has at least one
   signal, or the report lists the path as unmonitored. Report a path behind
   a feature flag enabled only for the user as unobserved until rollout.
3. Run the one-hour check one hour after the deploy. When a check time has
   already passed, run that check at once over its historical window.
4. Save each check's queries and results with
   `fleet proof save ... --kind post-deploy-watch` when the CLI is
   available, else in the ledger.
5. Schedule the 24-hour check with the harness's scheduler when it has one.
   Otherwise park it as one entry with its due time, the repo, the PR, the
   head SHA, and the ledger path. When a parked to-do skill exists, such as
   `parked-todos`, keep the entry in the `## Pending flags and rollouts`
   section that Feature flags uses; otherwise put it in the report.
   Babysitting then ends with the watch open, and the report says so.
6. Run `fleet proof gate ... --landed` after the 24-hour check is saved, or
   once a gap or a revert ends the watch early. Exit 0 means the watch is
   done. Exit 3 means gaps wait for acceptance: ask the user to accept them.
   Exit 1 means a proof is missing or the head is unreviewed. Fix a missing
   proof; record an unreviewed head on a merged PR as a gap for the user.

The watch is done when `gate --landed` exits 0, or exits 3 with the gaps put
to the user. Then close its scheduled or parked entry.

For a finding, prepare the revert locally: a `git revert` of the merge
commit on its own branch, and the revert PR's body text in your report. Open
the revert PR only when the user says so. Its body carries the conclusion
only. Error rates and other numbers stay in the private proof storage, as
Prod shape in `PROOF.md` keeps its measurements. After a one-hour finding,
the 24-hour check still runs unless the user reverts. A revert ends the
watch at step 6.

Record a gap for the watch when the deploy signal or the project is
unreachable, when the user's agent instructions name no project, or when no
deploy shows up in time. Use
`fleet proof gap ... --kind post-deploy-watch --reason "<reason>"` when the
CLI is available, else the ledger. Then ask the user to accept the gap.

## Feature flags

List every feature flag the PR introduces or depends on. A flag that does not
exist evaluates as off, and nothing creates it automatically. In
`PostHog/posthog`, look for `feature_flag:` keys in
`products/*/mcp/tools.yaml`, keys in `FEATURE_FLAGS` in
`frontend/src/lib/constants.tsx`, and `posthog_feature_flag_enabled(...)` or
`posthoganalytics.feature_enabled(...)` calls in the diff.

When the repo's flags live in PostHog and the PostHog MCP server is
available, create each missing flag when babysitting starts. Use the project
that evaluates the repo's flags, as the user's agent instructions or
`BABYSIT_PR_FLAG_PROJECT` name it, else ask the user. Check first that the
flag does not exist. Give it one release condition that enables it for the
user only, so the user can test it after the deploy. If creating a flag
fails or the MCP server cannot reach the project, stop at that first
failure: make "create the flag" the first step of the flag's tracking entry
and tell the user.

Track each flag in one entry: the flag key, the PR, then the remaining steps
in order. These are any post-deploy step such as a backfill command or a
migration, the rollout, then removing the flag from code and deleting it.
When a parked to-do skill such as `parked-todos` exists, keep the entry in
the `## Pending flags and rollouts` section of its to-do list, and create the
section when it is missing. Reshape an existing item for the flag rather
than adding a second one. Check the entry off only when the flag is removed.
Without such a skill, put the entry in your report.

Report each flag, whether you created it, and its tracking entry.
