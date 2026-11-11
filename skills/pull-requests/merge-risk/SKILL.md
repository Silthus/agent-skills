---
name: merge-risk
description: >-
  Grade a PR's merge risk, its blast radius, as low, medium, or high, call
  its door one-way or two-way, and post the risk callout to its description.
  Use when pr-description, qa-swarm, or review-pr reach their risk step, or
  when the user asks how risky a PR is.
---

# Merge risk

The **merge risk** is the incident a merge can cause: what breaks, for whom,
in which regions, and what limits it. Grade the PR's own increment, together
with the design it commits us to. In a stack, the increment is the diff
against its parent PR.

Grade from the **behavior delta**: what real traffic gets at HEAD that it did
not get on the base. Grade afresh from the current diff and evidence on every
run. An earlier grade, from a panel, a lens, an old body, or a thread, is a
claim to check, never evidence.

## Danger areas

Hunks that touch authentication, permissions, secrets or crypto, billing or
real sends to customers, migrations or schema, destructive writes, data
ingestion, locking or concurrency, public API contracts, dependencies, or
deploy and CI configuration. Read each danger hunk first, with its callers.
A danger area marks where to look; the grade comes from what the change does
there, so it sets no grade of its own.

## Switch-off

The **switch-off** is how we stop the change in production: a feature flag,
or an env allowlist where the code has no flags. It limits risk only when its
check runs before the changed code; shared code that runs before the check is
live on deploy. Without a switch, the change is live on deploy and we fix
forward. A rollback or a revert is the last resort for a disaster, so the
callout never plans one.

## Hot paths

A **hot path** is a route that live traffic takes into the diff. Trace each
one from its entry point in the product, such as a route, a job, a consumer,
or a UI action, down to the changed code it runs. Shared code that the diff
changes is on every path that calls it, including paths outside the diff.
A new entry point is a path of its own, and existing traffic reaches only
the shared code it calls.

## Behavior delta

Write one **row** for each branch the diff changes on each hot path, and one
for each change that acts without a branch: a migration's lock and run time,
a dependency, config, or the query count and load on a hot path. A row holds:

- **Who takes it**: the traffic that reaches it, banded as in Reach.
- **Base**: what that traffic gets on the base.
- **HEAD**: what it gets at HEAD. Write "same as base" only when a proof
  covers the row; otherwise the row is uncovered.

The **incident** of a row is the harm in its HEAD outcome that its base
outcome lacks:

- **Silent harm**: nobody sees it happen. Messages are dropped, sent twice, or
  sent to the wrong person, scheduled work does not run, data is lost or
  wrong.
- **Broken core action**: a user sees that the product's main task fails,
  such as saving or sending.
- **Cosmetic**: a user sees it, and nothing they need is blocked.

Harm the base already caused is no incident. A send the base dropped while
it logged success, and that HEAD fails visibly on that send alone, loses
nothing that worked: cosmetic at most. When the new failure stops other work,
such as the rest of a batch, a retry loop, or the user's save, that work is
a row of its own. When no row has an incident, say so in one bullet.

**Residual risk** is the bug a reviewer has not found yet. It sits on the
uncovered rows: the worst incident a missed bug there causes, at that row's
reach, graded with the rules below as an incident HEAD adds. A proof covers a
row when it runs inputs that select the row on the base and at HEAD and gets
the same outcome:

- a shadow diff or a live run over those inputs;
- tests that run the changed code with its real collaborators up to the
  boundary the diff touches, such as the provider client, the queue, or the
  database, and that pass unchanged on the base. A test that mocks the
  changed code covers nothing.

On a hot path that reaches most, the outcome includes latency, query count,
and locks; a proof that does not measure them leaves that part uncovered.
Locking and concurrency are covered only by a proof that runs them
concurrently.

## Reach

Measure each row's reach from data: the share of active teams or users who
take it, in the last 30 days, from the product analytics project the user's
agent instructions name, or from a prod-shape read of the stored rows that
select it. A new entry point reaches the teams that can call it and are
likely to, such as the users of the feature it extends. Without a
measurement, band the row as widely as the code lets traffic reach it. Band
each row as none, few, some, or most.

Reach counts the traffic whose behavior changes. Code that every request
runs through reaches most only where its outcome changes for most: a check
that every send passes, and that changes the outcome only for one stored
setting, reaches the teams with that setting. Band a row none only when no
stored row selects it and no write the product allows can create one;
otherwise band it by who can make that write.

## Door

Judge the door against the switch-off, never against `git revert`. A
**two-way door** leaves nothing behind once the switch is off. A **one-way
door** leaves something that stays and that the base did not leave: data or
schema, a sent message, a public contract that SDKs, docs, or callers build
on, or a design on a core path that other code comes to depend on. Name what
we commit to, on which row. A door that is two-way at merge and turns one-way
on a later event, such as an SDK release or a docs publish, names that event.

## Grade

The grade is the true risk: the incidents of the rows and the residual risk,
weighed by reach. Apply every rule below; the highest grade any rule gives
wins.

- A door that is one-way at merge is high.
- A design on a core path is graded by what it does at full use, even when
  the merge exposes no one yet. A new table in a shared queue database that
  can bloat and stall every job is high.
- A migration that adds or changes a column, in one PR with code in another
  deploy unit that reads it, is high: the reader can go live first and fail
  until the migration runs. Ask for the split in full-send step 1.
- Silent harm is never low. It is high when its row reaches some or most,
  and medium otherwise. The critical paths in the user's agent instructions
  say what can go wrong there; the incident is still one a row names.
- A broken core action is medium. It is low only behind a switch-off on a
  row that reaches few.
- Cosmetic is low, even when most users see it.
- Rows that all reach none or are covered with no incident are low.

Behind a default-off switch-off, grade what the merge exposes with the switch
off, and add the grade at full rollout when it is higher. More than about
400 changed production lines raise the grade one step while any row is
uncovered.

Done when every hot path is traced, every change on it has a row with its
reach, every uncovered row is named, every commitment is named, and the
grade follows from them.

## Callout

The callout stays short: the headline, the delta, and the switch-off. Never
put measured numbers in it: the repo may be public. The bullets say:

- who changes, from what to what, and in which regions;
- who is unchanged, naming the proof that covers them, such as the shadow
  diff, the live run, or the tests;
- each uncovered row and its residual incident.

Each bullet names a row. A bullet that predicts a bug names the uncovered row
it sits on.

The grade sets the circle and the callout color:

| Grade  | Circle | Callout       |
| ------ | ------ | ------------- |
| low    | 🔵     | `[!NOTE]`     |
| medium | 🟡     | `[!WARNING]`  |
| high   | 🔴     | `[!CAUTION]`  |

A **Rollout** section follows the callout when the grade is medium or high,
or when a decision from the PR or its thread shapes the risk. Each line
appears only when it has content:

- **Stages:** deploy order and the switch-off's stages, per the `rollout`
  skill and the user's agent instructions.
- **Decided:** the user's calls that set the risk, such as an accepted limit
  or a design choice.
- **Watch:** the alert that pages on the incident, else the metric to watch.
  Name a missing alert.

```markdown
<!-- merge-risk -->
> [!WARNING]
> 🟡 **Merge risk: medium**, 🔴 at full rollout · one-way door once <event>: <what we commit to>
> - <who changes: the branch, from what to what, for whom, in which regions>
> - <who is unchanged and the proof that covers them, or an uncovered row and its residual incident>
> - **Switch-off:** `<flag or allowlist>`, or none: live on deploy, fix forward.

## Rollout

- **Stages:** <deploy order, then the switch-off's stages>
- **Decided:** <the call that sets the risk>
- **Watch:** <the alert that pages, or the metric; a missing alert>
<!-- /merge-risk -->
```

Drop the full-rollout grade when it matches the merge grade, and the "once
<event>" when the door is already one-way or stays two-way. GitHub fixes the
callout title and strips `class` and `style` from HTML, so the circle and the
bold grade carry the risk.

## Post

On someone else's PR, show the user the proposed body change and post it
after they approve.

1. Read the body with `gh pr view <n> --json body -q .body`.
2. Remove every `merge-risk` and `line-count` marker block from the body.
3. Put the block under the `Merge Danger` heading when the body has one,
   else right after the Impact section, else right after the problem
   section, else first. Keep the rest of the body byte for byte.
4. Write it back with `gh pr edit <n> --body-file <file>`.

Done when the description carries one merge-risk block with the current grade.
With the `fleet` CLI, the judge in `fleet proof gate` fails a grade or door
that does not follow from the diff and the saved proofs.
