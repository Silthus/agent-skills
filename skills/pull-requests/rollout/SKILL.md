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

Merge with the method the repo uses. Check the allowed methods and recent
merged PRs. In a repo with a merge queue, enter the queue, for example with a
bare `/trunk merge` comment. Stay until GitHub reports the PR as merged. Push
nothing while the queue holds the PR. A failed queue run is a failed check:
triage it and queue the PR once more. Never use `--admin` or other bypasses.

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

1. **Deploy.** Find when the merge commit reached production from the repo's
   deploy signal, such as the PostHog `checking-deploy-timing` skill, a deploy
   workflow run, or a release tag. Wait on a deploy run with
   `gh run watch <id> --exit-status`. When no deploy shows up within 24 hours,
   record a gap and ask.
2. **Sandbox**, only when `merge-risk` grades the PR high, calls it a one-way
   door, or names silent harm: enable the flag for the sandbox project and its
   test user. Walk the changed journey in production as that user with the
   `agent-browser` skill, and save the walk as proof. The walk is part of the
   rollout grant.
3. **Internal**: enable the flag for the internal project, after the check one
   hour after the deploy is clean.
4. **10%**: 24 hours after Internal.
5. **50%**: 48 hours after 10%.
6. **100%**: on the first working day, Monday to Friday, at least 3 days after
   50%.
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

After each stage change, append one line to the rollout log and push it:

```json
{"at":"<ISO time>","repo":"<owner/repo>","pr":123,"flag":"<key>","stage":"merged|deployed|sandbox|internal|10%|50%|100%|cleanup|done","state":"watching|holding|rolled-back|done|gap","next":"<ISO time of the next check>","note":"<one short line>","thread":"<this thread's id>"}
```

Use `null` for a missing flag, next check, or thread. The note carries no
numbers or customer data.

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
set the flag to its previous stage. A runtime change without a flag cannot
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
2. Cite the triage bot's investigations of alerts in the window.
3. Start the fix in a new top-level thread from the default branch, in
   `full-stop`, with the evidence and a link to this thread.
4. Prepare the revert: a `git revert` of the merge commit on its own branch,
   and the revert PR's body. Open it only when the user says so.
5. Ask with the question tool, per full-send's "Asking the user": the
   notebook, the fix thread, the revert branch, and the options, with your
   recommendation first.

Numbers stay in the notebook and the proof storage. The revert PR and any
other public text carry the conclusion only.

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
