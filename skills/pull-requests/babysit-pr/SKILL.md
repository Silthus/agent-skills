---
name: babysit-pr
description: >-
  Take a PR that is ready for review to merged and watched in production,
  fixing real findings on the way. Use when the user asks to monitor, watch,
  or babysit a PR, or to watch a merged PR after its deploy.
---

# Babysit PR

Babysitting starts when the user has marked a PR ready for review and asks you
to babysit it. For a PR that is already merged, start at Landed. Babysitting
ends when the post-deploy watch is done or parked, as Landed describes. The
rollout of its feature flags stays with the user.

When babysitting starts and the PR changes runtime behavior, register the
post-deploy watch as owed. When the `fleet` CLI is available (on `PATH` or at
`~/dev/fleet/fleet`), run
`fleet proof require --repo <owner/repo> --pr <number> --commit <head SHA> --kinds post-deploy-watch`.
Otherwise, register it in the ledger. For a PR that never ran the swarm,
create the ledger where step 2.4 of the `qa-swarm` skill puts it. Until the
merge, `fleet proof gate` without `--landed` lists the watch as pending.

## Ready

When the user says the PR is ready, close the review-bot threads before
anything else:

1. List every unresolved review thread as bot or human, answered or
   unanswered. When the `fleet` CLI is available, run
   `fleet pr bot-threads --repo <owner/repo> --pr <number>`, which prints that
   list and exits 1 while an unanswered bot thread remains. Otherwise read the
   threads with the GitHub GraphQL `reviewThreads` field through
   `gh api graphql`.
2. Reply to each unanswered bot thread per the `leaving-pr-comments` skill:
   the fixing commit, or the reason for a rejection.
3. Resolve every bot thread whose last comment is yours: run the command
   again with `--resolve`, or use the `resolveReviewThread` mutation. Leave
   human threads alone.
4. Report every human thread that is still open.

The gate is done when no unanswered or unresolved bot thread remains. Only
then start the monitoring below.

If your harness offers tools to monitor a PR, use them so you can respond when
comments arrive. Otherwise, poll the PR for new reviews, comments, and checks.

Act only on reviews, comments, and checks newer than the latest push. Triage
each one per [`TRIAGE.md`](../qa-swarm/TRIAGE.md) of the `qa-swarm` skill.
After you push a fix that changes behavior, get one review of the fix diff
from the other model family, so that review fixes get a fresh review too.
Record it as a final read: start it with
`fleet proof review-start ... --scope final --base <last reviewed SHA>` and
finish it with `fleet proof review-finish ... --round final <findings file>`
when the CLI is available, else in the ledger.
Follow the PR workflow and model selection policy in the user's agent
instructions, when they exist; otherwise use the runtime defaults.

Keep the branch mergeable. Rebase on the base branch (`main` or `master`) when
it conflicts or when the repo requires an up-to-date branch outside a merge
queue. If an overlapping PR makes this one obsolete, stop monitoring, report
it to the user, and ask before closing the PR unless closure was explicitly
authorized.

If nothing has changed, stay quiet rather than posting filler comments.

## Merge

The user's request to babysit authorizes the merge. Merge when all of these
hold on HEAD:

- A reviewer approved it, and no review requests changes.
- Every gating check, as `qa-swarm` defines it, is green.
- No decision is open. A thread is open only when its item is fixed and only
  the reply waits for the user's approval.
- The branch has no conflict.

Use the repo's merge path: its merge queue when it has one, otherwise the merge
method the repo allows. Push nothing while the merge queue holds the PR. A
failed queue run is a failed check: triage it and queue the PR again once.

When the user cannot approve CI runs or merge in the repository, report a PR
that waits for either as waiting for a maintainer. Check the user's
permission with `gh repo view <owner/repo> --json viewerPermission` and the
repository's rules for CI approval and merges.

Keep monitoring until the PR is merged, because a ready PR can still get review
comments, conflicts, or a failed merge queue. Stop earlier only when the user
says to stop monitoring, or when the PR is closed without a merge; then report
it. Report the merge commit when the PR is merged.

## Landed

When the PR changes runtime behavior, run the **post-deploy watch** that
[`PROOF.md`](../qa-swarm/PROOF.md) of the `qa-swarm` skill defines. A PR with
no runtime change owes no watch, and babysitting ends with the merge report.

Every `fleet proof` command here takes `--commit <head SHA>`: the PR's final
head, from `gh pr view <number> --json headRefOid`, never the merge commit.

1. Find when the merge commit reached production: the repo's deploy signal,
   such as the PostHog `checking-deploy-timing` skill, a deploy workflow run,
   or a release tag. When no deploy of the merge commit shows up within 24
   hours of the merge, record a gap and stop waiting.
2. Map each changed path to its signals: the services, error groups, log
   sources, and metrics that carry it. Record the map in the ledger, so the
   second check reuses it. The map is done when every changed path has at
   least one signal, or the report lists the path as unmonitored. Report a
   path behind a feature flag enabled only for the user as unobserved until
   rollout.
3. Run the one-hour check one hour after the deploy. When a check time has
   already passed, run that check at once over its historical window.
4. Save each check's queries and results with
   `fleet proof save ... --kind post-deploy-watch` when the CLI is
   available, else in the ledger.
5. Park the 24-hour check as one entry with its due time, the repo, the PR,
   the head SHA, and the ledger path. When a parked to-do skill exists, such
   as `parked-todos`, keep the entry in the `## Pending flags and rollouts`
   section that Feature flags uses; otherwise put it in the report.
   Babysitting then ends with the watch open, and the report says so.
6. After the 24-hour check is saved, run `fleet proof gate ... --landed`.
   Exit 0 means the watch is done. Exit 3 means gaps wait for acceptance: ask
   the user to accept them. Exit 1 means a proof is missing or the head is
   unreviewed: fix that before you report the watch as done.

The watch is done when both checks are saved and `gate --landed` exits 0, or
exits 3 with the gaps put to the user.

For a finding, prepare the revert locally: a `git revert` of the merge
commit on its own branch, and the revert PR's body text in your report. Open
the revert PR only when the user says so. Its body carries the conclusion
only. Error rates and other numbers stay in the private proof storage, as
Prod shape in PROOF.md keeps its measurements. After a one-hour finding, the
24-hour check still runs unless the user reverts.

Record a gap for the watch when the deploy signal or the project cannot be
reached, when the user's agent instructions name no project, or when no
deploy shows up in time. Use
`fleet proof gap ... --kind post-deploy-watch --reason "<reason>"` when the
CLI is available, else the ledger. Then ask the user to accept the gap.

## Feature flags

Note every feature flag the PR introduces or depends on. A flag that does not
exist evaluates as off, and nothing creates it automatically. In
`PostHog/posthog`, look for `feature_flag:` keys in
`products/*/mcp/tools.yaml`, keys in `FEATURE_FLAGS` in
`frontend/src/lib/constants.tsx`, and `posthog_feature_flag_enabled(...)` or
`posthoganalytics.feature_enabled(...)` calls in the diff.

When the repository's flags live in PostHog and the PostHog MCP server is
available, create each missing flag when babysitting starts. Use the PostHog
project that evaluates the repository's flags: the project ID that the
user's agent instructions or `BABYSIT_PR_FLAG_PROJECT` name, else ask the
user. Give the flag one release condition that enables it for the user only,
so the user can test it after the deploy. Check first that the flag does not
exist. The user owns the wider rollout. If creating the flag fails or the MCP
server cannot reach the project, stop at that first failure: make "create the
flag" the first step of the flag's tracking entry and tell the user.

Track each flag in one entry. The entry names the flag key and the PR, then
the remaining steps in order: any post-deploy step such as a backfill command
or a migration, the rollout, then removing the flag from code and deleting
it. When a parked to-do skill exists, such as `parked-todos`, keep the entry
in the `## Pending flags and rollouts` section of its to-do list; create the
section if it is missing, and reshape an existing item for the flag instead
of adding a second one. Check the entry off only when the flag is removed.
Otherwise, put the entry in your report. Report each flag, whether you
created it, and its tracking entry.
