---
name: rollout
description: >-
  Merge a PR whose merge gate passed, watch its deploy, and roll its feature
  flags out in stages while you watch production. Use when the user says to
  roll out a PR, when full-send or stamp-pr reaches the merge, or to watch a
  merged PR after its deploy.
---

# Rollout

You own the change from the merge until it runs for every user, or until a
rollback hands it back to the user. Each stage waits for a clean check, not
only for the clock.

Merge only under a clear grant: `full-send`, `stamp-pr`, or the user's own
words asking to roll out or merge this PR, such as "babysit and roll out the
PR". Without one, start at Deploy on a PR that is already merged, or stop. On a
PR that is not ready, babysit it with `babysit-pr` until full-send's merge gate
passes. If it is a draft, or only approval remains and no grant covers marking
it ready, stop and report what remains.

The user's agent instructions name the values this skill needs: the project
that holds the flags and the internal project to watch, the sandbox project
and its test user, the alert channels, and the rollout log. When a step needs
a value they do not name, ask for it then.

## Merge

Right before the merge, run `git fetch` and check the PR again. Never merge
when it is BEHIND or DIRTY, or when base commits that landed after the last
green run touch this PR's files. Rebase, push, and wait for green again.

Right before every merge or queue entry, run the **deploy-order check** when
the `fleet` CLI is available:
`fleet pr deploy-order --repo <owner/repo> --pr <number>`. Exit 0 lets the
PR enter. Exit 1 refuses it and prints the PR to wait for: a migration this
PR reads that is not live in every production region yet, or a migration
mixed with another deploy unit in this PR. Exit 2 means the deploy state is
unknown and waits the same way. On exit 1 or 2, do not enqueue: report the
PR it names, or the unknown state, and enter the queue only after a later
run exits 0. For a stack, check every layer that enters. Without the CLI,
apply **Deploy order** below by hand.

Right before the merge or queue entry, read the PR's comments and reviews
once more. A **person's comment** the user has not answered holds it, per
full-send's merge gate, even under a merge grant with every check green: ask
the user first. For a stack, check every layer.

Merge with the method the repo uses. Check the allowed methods and recent
merged PRs. In a repo with a merge queue, enter the queue, for example with a
bare `/trunk merge` comment. Stay until GitHub reports the PR as merged. Push
nothing while the queue holds the PR. Trunk reports queue state only by
editing one comment, and an edit wakes no PR watch, so never report a PR as
queued from one read of it. Right after `/trunk merge` in `PostHog/posthog`,
run `fleet pr queue-wait --repo <owner/repo> --pr <number>` (on `PATH` or at
`~/dev/fleet/fleet`) in the background and wait on it. Exit 1 prints why the
queue dropped the PR; for a merge conflict, merge the base forward. Exit 2 is
a timeout: read the queue's comment and wait again. A failed queue run is a failed check:
triage it and queue the PR once more. Never use `--admin` or other bypasses.

### Merge a stack as one

Merge approved layers with one queue entry, not one per layer. A layer is
approved by a teammate's review or, under `stamp-pr`, a stamp. Post one bare
`/trunk merge` comment on the top approved layer. The queue collapses the
layers below it and tests and merges them as one, which is much faster than
queuing each layer in turn. Do not queue a layer while a layer below it
still waits for approval; the queue drops a PR that stays not ready.

Deploy order still wins. When a layer reads what a lower layer adds, collapse
the layers up to and including the one that adds it, follow that merge to its
production deploy, then collapse the rest.

An **approved bottom** merges as soon as it is approved: the layers from the
base up that are approved, green, and safe to deploy without the layers
above. Do not wait for the layers above or for a review deadline. Under a
merge grant that covers it, queue it on its top layer. Otherwise offer it to
the user at once, on the daily merge decision when the user's agent
instructions have one. Merge the rest the same way once it is approved.

### Deploy order

Services that deploy on their own, such as a background worker or the
frontend, can go live before the migrations of a PR that merged at the same
moment. A worker that reads a column before its migration runs fails every
request until the migration lands.

Before each merge, list each column, table, and API field that the diff reads
or sends and that does not exist on the default branch's production
deploy yet. For each one, find the PR that adds it. Merge this PR only when
that PR's merge commit is deployed to production in every region, with its
migrations run, per the Deploy stage below. This holds for every PR, stacked
or not.

In a stack, merge the layer that adds it, follow it to its production deploy,
and only then merge the layer that reads what it adds. Never merge both in one
go or one queue run. A layer that mixes a migration with a reader in another deploy
unit goes back to the author to split, per full-send step 1. Never merge it.
The user's agent instructions name the repo's deploy units.

## Flags

List every feature flag the PR introduces or depends on. A flag that does not
exist evaluates as off. In `PostHog/posthog`, look for `feature_flag:` keys in
`products/*/mcp/tools.yaml`, keys in `FEATURE_FLAGS` in
`frontend/src/lib/constants.tsx`, and `posthog_feature_flag_enabled(...)` or
`posthoganalytics.feature_enabled(...)` calls in the diff.

Before the merge, create each missing flag in the project the user's
instructions name, off for everyone. Check first that it does not exist. If
creating it fails, stop and follow the user's instructions for a failed flag;
without any, ask.

## Stages

The default cadence, unless the user names another:

1. **Deploy.** Find when the merge commit reached production. In
   `PostHog/posthog`, run `fleet deploy wait <pr>` (on `PATH` or at
   `~/dev/fleet/fleet`) as one background command whose timeout is longer than
   its `--timeout`, 120 minutes by default. It blocks until the deploy bot's
   PR comment shows prod-us and prod-eu deployed. It prints each region's
   deploy time, the minutes since the merge, and the workflow links, and when
   the one-hour check is due. It exits 0 when the PR is live. Exit 1 means a
   failed row or a PR closed without a merge. Exit 2 is a timeout. The bot
   writes no failure status, so a failed deploy usually shows as a timeout:
   open the state-deploy runs it links. Do not poll Slack, Grafana, or image
   builds for this. Its rows track the Django `posthog` release only. For a
   change to a Node or Rust service, also confirm that service's own deploy,
   as the PostHog deploy-signal memory describes. In other repos, wait on the
   repo's deploy signal: a deploy workflow run with
   `gh run watch <id> --exit-status`, or a release tag. When no deploy shows up within 24 hours,
   record a gap and ask. Then **mark the deploy** on each insight that the
   PR's Impact section links: in PostHog, an annotation at the deploy time
   that reads `<owner/repo>#<number> deployed`, scoped to that insight
   (`dashboard_item`, the numeric ID behind the link's short ID) or to that
   dashboard. The impact retro reads the metric on both sides of this mark.
   Keep it off the whole project, where every chart would show it.
2. **Sandbox**, only when `merge-risk` grades the PR high, calls it a one-way
   door, or names silent harm: enable the flag for the sandbox project and its
   test user. Walk the changed journey in production as that user with the
   `agent-browser` skill, and save the walk as proof. The walk is part of the
   rollout grant.
3. **Internal**: enable the flag for the internal project, after the check one
   hour after the deploy is clean.
4. **10%**: 24 hours after Internal.
5. **50%**: 48 hours after 10%.
6. **100%**: at least 3 days after 50%.
7. **Done**: 24 hours after 100%.

A PR that `merge-risk` grades low goes from Internal to 100% after a clean
check 24 hours later. A runtime change without a flag gets checks one hour
and 24 hours after the deploy; a low one only the first. A PR with no runtime
change owes no watch.

Check one hour after each stage change, then every 24 hours, and right before
the next stage. The last check before a stage is its gate. Schedule each check
with the harness's scheduler: in T3 Code, one `schedule_task` bound to this
thread, updated after each check to the next one. Without a scheduler, park the
next check with its due time, the PR, the head SHA, and the ledger path.

After each stage change or Hold, append one line to the rollout log and push it:

```json
{"at":"<ISO time>","repo":"<owner/repo>","pr":123,"flag":"<key>","stage":"merged|deployed|sandbox|internal|10%|50%|100%|cleanup|done","state":"watching|holding|rolled-back|done|gap","next":"<ISO time of the next check>","note":"<one short line>","thread":"<this thread's id>"}
```

Use `null` for a missing flag, next check, or thread. The note carries no
numbers or customer data.

When the user's agent instructions name a deploy ledger, the ledger writes
the `deployed` line. Write one by hand only when the ledger has not run:
pull the log after the deploy, and append the line when it still has none
for this PR.

## Check

Map each changed path to its signals once: the services, error groups, log
sources, and metrics that carry it. Every path gets at least one signal, or the
report names it unmonitored. Compare the window since the last check with the
flag on against the flag off, using the `$feature/<key>` event property, or
without a flag, with the 24 hours before the deploy. Read:

- Error tracking: new issues whose stack frames hit the changed files, and
  error rates.
- Logs and metrics of the services the changed paths run in.
- For delivery code: failed deliveries and dead-letter queue alerts.
- Support tickets that mention the feature.
- The alert channels the user's instructions name, including the
  investigations a triage bot posts there for alerts in the window.
- The feature's own usage: its key events still fire.

When the user's instructions name a production debug tool, run it on each
Hold or roll-back signal: the deploy state of the changed services, and the
metrics and logs behind the alert. When the tool is out of reach, record that
as a gap and go on.

Save each check's queries and results with
`fleet proof save ... --kind post-deploy-watch` when the `fleet` CLI is
available (on `PATH` or at `~/dev/fleet/fleet`), else in the ledger. Every
`fleet proof` command here takes `--commit <the PR's final head SHA>`, never
the merge commit.

Each check ends in one verdict:

- **Roll back** when any of these holds:
  - A new error-tracking issue whose stack frames hit the changed files, with
    at least 5 affected users or 20 occurrences.
  - The error rate with the flag on is more than twice the rate with it off,
    with at least 50 errors in the flag-on group.
  - A support ticket clearly ties a breakage to the change.
  - Delivery failures, data loss, or a security problem that the change caused.
- **Hold** when errors run 1.2 to 2 times the flag-off rate, a ticket might be
  related, or too few events exist to judge.
- **Advance** otherwise.

A roll-back signal must show in two checks at least 30 minutes apart. When a
check finds one, schedule the confirming check 30 minutes later. Delivery
failures, data loss, and security problems roll back at once. To roll back,
set the flag to its previous stage. A rollback or a revert of a reviewed PR is
a reviewer miss: once the cause is known, record it with
`fleet proof miss --commit <final head SHA> --source rollback|revert --finding "<the cause the review should have flagged>"`. A runtime change without a flag cannot
roll back: prepare a revert and ask.

On Hold, keep the stage and investigate. After a rollback, or a second Hold in
a row, follow "Before you ask". After a rollback, the flag never advances on
its own. It advances only when the user says so, or when a fix has
merged and passed its own rollout.

## Before you ask

The user gets a finding with the evidence and a way out already prepared:

1. Write the investigation in a notebook in the internal project: the signal,
   the window, the queries, the flag-on and flag-off comparison, the affected
   users, and the suspected cause with its file and line.
2. Cite the triage bot's investigations of alerts in the window and the
   debug tool's findings.
3. Start the fix in a new top-level thread from the default branch, in
   `full-stop`, with the evidence and a link to this thread.
4. Prepare the revert: a `git revert` of the merge commit on its own branch,
   and the revert PR's body. Open it only when the user says so.
5. Ask with the question tool, per full-send's "Asking the user": the
   notebook, the fix thread, the revert branch, and the options, with your
   recommendation first.

Numbers stay in the notebook and the proof storage. The revert PR and any
other public text carry the conclusion only.

Record the rollback or the second Hold as a ❌ line, per the `lessons` skill:
on the map's ticket when the PR belongs to a map, whose harvest collects it.
Outside a map, run the `lessons` harvest for the PR once the rollout settles.

## Finish

1. At Done, run `fleet proof gate ... --landed`. Exit 0 ends the watch. Exit 3
   means gaps wait for acceptance: ask the user. Exit 1 names a missing proof,
   an unreviewed head, CI not green on the head, or a failed judge: fix a
   missing proof, and record an unreviewed head on a merged PR as a gap.
2. At Done, schedule a check two weeks after 100% that starts a `full-stop`
   thread to remove the flag from the code. When a merged PR removes a flag
   from the code, delete the flag at that PR's Done.
3. Record a gap with `fleet proof gap ... --kind post-deploy-watch --reason
   "<reason>"` when the deploy signal or a project is unreachable, or no
   deploy shows up in time. Then ask the user to accept it.

Report each flag and its stage, each check's verdict, and the next check.
