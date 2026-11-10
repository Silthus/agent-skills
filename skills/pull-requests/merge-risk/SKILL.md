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

## Door

Judge the door against the switch-off, never against `git revert`. A
**two-way door** leaves nothing behind once the switch is off. A **one-way
door** leaves something that stays: data or schema, a sent message, a public
contract that SDKs, docs, or callers build on, or a design on a core path that
other code comes to depend on. Name what we commit to. A door that is two-way
at merge and turns one-way on a later event, such as an SDK release or a
docs publish, names that event.

## Incident

Name the worst incident a missed bug in the diff causes for a user:

- **Silent harm**: nobody sees it happen. Messages are dropped, sent twice, or
  sent to the wrong person, scheduled work does not run, data is lost or
  wrong.
- **Broken core action**: a user sees that the product's main task fails,
  such as saving or sending.
- **Cosmetic**: a user sees it, and nothing they need is blocked.

When no path leads to an incident, say so in one bullet.

## Hot paths

A **hot path** is a route that live traffic takes into the diff. Trace each
one from its entry point in the product, such as a route, a job, a consumer,
or a UI action, down to the changed code it runs. Shared code that the diff
changes is on every path that calls it, including paths outside the diff.
A new entry point is a path of its own, and existing traffic reaches only
the shared code it calls.

## Reach

Measure each hot path's reach from data: the share of active teams or users
who ran it in the last 30 days, from the product analytics project the
user's agent instructions name. A new entry point reaches the teams that can
call it and are likely to, such as the users of the feature it extends. Band
each path as few, some, or most. Code on a path that every request or event
runs through reaches most.

Reach counts the traffic whose behavior changes. When the change acts only
under a condition, such as an unset setting, a flag, or one input shape, band
the path by who meets that condition: a path that most teams run, changed
only where a setting is unset, reaches the teams that leave it unset.

## Grade

The grade is the true risk: the worst incident on each hot path, weighed by
that path's reach. The highest path sets the grade.

- A door that is one-way at merge is high.
- A design on a core path is graded by what it does at full use, even when
  the merge exposes no one yet. A new table in a shared queue database that
  can bloat and stall every job is high.
- A migration that adds or changes a column, in one PR with code in another
  deploy unit that reads it, is high: the reader can go live first and fail
  until the migration runs. Ask for the split in full-send step 1.
- Silent harm is never low. It is high when the changed behavior reaches
  some or most, and medium otherwise. The critical paths in the user's agent
  instructions say what can go wrong there; the incident is still the worst
  one this diff can cause.
- A broken core action is medium. It is low only behind a switch-off on a
  path that reaches few.
- Cosmetic is low, even when most users see it.

Behind a default-off switch-off, grade what the merge exposes with the switch
off, and add the grade at full rollout when it is higher. More than about
400 changed production lines raise the grade. Focused tests
on the risky path, a shadow diff that shows existing paths behave as before,
and an alert that pages on the incident lower it, but never below the first
matching rule above. Done when every hot path is traced and banded, every
danger hunk and every commitment is named, and the grade follows from them.

## Callout

The callout stays short: the headline, one or two incident bullets naming the
path, who, and the regions, and the switch-off. Never put measured numbers in
it: the repo may be public. The grade sets the circle and the callout color:

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
> - <the incident: the path, what breaks, for whom, in which regions>
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
