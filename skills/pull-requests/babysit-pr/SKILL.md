---
name: babysit-pr
description: >-
  Take a PR that is ready for review to merged and watched in production,
  fixing real findings on the way. Use when the user asks to monitor, watch,
  or babysit a PR, or to watch a merged PR after its deploy.
---

# Babysit PR

Babysitting starts when the user has marked a PR ready for review and asks you
to babysit it. It ends when the post-deploy watch after the merge is reported.
The rollout of its feature flags stays with the user.

## Ready

When the user says the PR is ready, close the review-bot threads before
anything else:

1. List every unresolved review thread as bot or human, answered or
   unanswered. When the `fleet` CLI is available (on `PATH` or at `~/dev/fleet/fleet`), run
   `fleet pr bot-threads --repo <owner/repo> --pr <number>`, which prints that
   list and exits 1 while an unanswered bot thread remains. Otherwise read the
   threads with the GitHub GraphQL `reviewThreads` field through `gh api graphql`.
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
After you push a fix that changes behaviour, get one review of the fix diff
from the other model family, so that review fixes get a fresh review too.
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

After the merge, run the **post-deploy watch** that `PROOF.md` of the
`qa-swarm` skill defines:

1. Register the watch as owed before anything else, with
   `fleet proof require ... --kinds post-deploy-watch` when the CLI is
   available, or in the ledger. This holds for a PR that never ran the swarm
   too.
2. Find when the merge commit reached production: the repo's deploy signal,
   such as the PostHog `checking-deploy-timing` skill, a deploy workflow run,
   or a release tag.
3. Map the touched area to its signals: the services, error groups, log
   sources, and metrics that carry the changed paths. Record the map in the
   ledger, so the second check reuses it.
4. Schedule two checks, one hour and 24 hours after the deploy, with the
   harness's scheduler when it has one. Otherwise wait for the first check
   and report the second as pending, with its time.
5. Each check compares the deploy window with the same length of time before
   it, in the project the user's agent instructions name. A new error group,
   or a rate that moves past the baseline's noise, is a finding. Report it
   with the evidence and a drafted revert PR. The user decides on the revert.
6. Save each check's queries and results with
   `fleet proof save ... --kind post-deploy-watch` when the CLI is available,
   then run `fleet proof gate ... --landed`.

The watch is done when both checks are reported. When the project or the
deploy signal cannot be reached, record the watch as a gap with `fleet proof gap ... --kind post-deploy-watch`, report it, and stop.

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
user's agent instructions or `BABYSIT_PR_FLAG_PROJECT` name, else ask the user. Give the flag one release
condition that enables it for the user only, so the user can test it after
the deploy. Check first that the flag does not exist. The user owns the wider
rollout. If creating the flag fails or the MCP server cannot reach the
project, stop at that first failure: make "create the flag" the first step of
the flag's tracking entry and tell the user.

Track each flag in one entry. The entry names the flag key and the PR, then
the remaining steps in order: any post-deploy step such as a backfill command
or a migration, the rollout, then removing the flag from code and deleting
it. When a parked to-do skill exists, such as `parked-todos`, keep the entry
in the `## Pending flags and rollouts` section of its to-do list; create the
section if it is missing, and reshape an existing item for the flag instead
of adding a second one. Check the entry off only when the flag is removed.
Otherwise, put the entry in your report. Report each flag, whether you
created it, and its tracking entry.
