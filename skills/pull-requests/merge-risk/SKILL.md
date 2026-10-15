---
name: merge-risk
description: >-
  Grade a PR's merge risk, its blast radius, as low, medium, or high, call
  its door one-way or two-way, and post the risk callout to the PR
  description. Use when the pr-description, qa-swarm, or review-pr skills
  reach their risk step, or when the user asks how risky a PR is to merge.
---

# Merge risk

The **merge risk** is the blast radius of merging a diff: what breaks, for
whom, and what limits it. Grade only the PR's own increment: in a stack, the
diff against its parent PR.

## Danger areas

Hunks that touch authentication, permissions, secrets or crypto, billing or
real sends to customers, migrations or schema, destructive writes, data
ingestion, locking or concurrency, public API contracts, dependencies, or
deploy and CI configuration.

## Door

A **two-way door** is a change a revert fully undoes. A **one-way door**
leaves effects a revert cannot undo: a dropped column, a data migration, a
sent email, published data, a released public contract. Name the one-way
effect.

## Grade

Read every danger hunk with its callers. Danger areas and more than about
400 changed production lines raise the grade. A default-off feature flag,
focused tests on the risky path, and a two-way door lower it; a one-way door
raises it. Done when every danger hunk and every one-way effect is named and the
grade follows from them.

## Callout

Name the concrete risk and what limits it, in one to three bullets. The
door follows the grade on its line. The grade sets the circle and the
callout colour:

| Grade  | Circle | Callout       |
| ------ | ------ | ------------- |
| low    | 🔵     | `[!NOTE]`     |
| medium | 🟡     | `[!WARNING]`  |
| high   | 🔴     | `[!CAUTION]`  |

```markdown
<!-- merge-risk -->
> [!WARNING]
> 🟡 **Merge risk: medium** · two-way door (merge-risk rubric)
> - <the concrete risk: the path, what could break, for whom>
> - <what limits it: the flag, the tests, the revert>
<!-- /merge-risk -->
```

GitHub fixes the callout's title and strips `class` and `style` from HTML, so
the circle and the bold grade line inside the callout carry the risk.

## Post

Write only the risk callout to the PR description, after the problem. On a
PR by someone else, show the proposed body change and post it after the user
approves it.

1. Read the body with `gh pr view <n> --json body -q .body`.
2. Remove existing `merge-risk` and `line-count` marker blocks wherever they sit.
3. Put the callout under the `Merge Danger` heading when the body has one,
   else right after the problem section. When the body has neither, put the
   callout first. Keep the rest of the body byte for byte.
4. Write it back with `gh pr edit <n> --body-file <file>`.

Done when the description carries one risk callout with the current grade.
