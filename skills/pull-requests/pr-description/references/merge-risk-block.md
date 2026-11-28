# Merge-risk block

The `merge-risk` skill grades the PR and writes its output. This file says how
that output goes into the PR body. Keep the output of `merge-risk` as it
writes it, and add only the markers, the Tier line, and the Rollout section.

## Block

```markdown
<!-- merge-risk -->
<the output of merge-risk: the Merge risk line, then one line per category with its gaps>

**Tier:** <critical (<letters>: <what holds>), or non-critical>

## Rollout

- **Switch-off:** <flag or allowlist>, or none: live on deploy, fix forward.
- **Stages:** <deploy order, then the switch-off's stages>
- **Decided:** <the call that sets the risk>
- **Watch:** <the alert that pages, or the metric; a missing alert>
<!-- /merge-risk -->
```

Keep the `<!-- merge-risk -->` markers. `hedge` reads the grade, the door, and
the tier between them.

The repository may be public, so never put measured numbers in the block.

## Door

A PR is a **one-way door** when its Rollback cost verdict is high ⚠️, or when a
gap bullet calls it a one-way door. Name what the PR commits to in a Rollback
cost bullet, such as `one-way door: the email is sent`. A door that is two-way
at merge and turns one-way on a later event, such as an SDK release or a docs
publish, names that event in the same bullet.

## Tier

The **tier** says who decides the PR's asks, under the user's agent
instructions. A PR is **critical** when any criterion holds:

- (a) the diff touches a critical path that the user's agent instructions
  list for the repo. A diff whose every file is a test or fixture that no
  production code imports does not touch one by its path alone;
- (b) the grade is high;
- (c) the door is one-way;
- (d) it adds a migration;
- (e) it changes auth, permissions, or infra;
- (f) it makes an irreversible public release, such as an SDK publish;
- (g) it sends something to people outside the team.

A repo with no critical-path list uses (b) to (g). Every other PR is
**non-critical**. Set the tier again on every run, with the grade. Write it
as `**Tier:** critical (a: <path>; d)` or `**Tier:** non-critical`.

## Rollout

Add the Rollout section when the grade is medium or high, or when a decision
from the PR or its thread shapes the risk. Each line appears only when it has
content.

The **switch-off** is how we stop the change in production: a feature flag,
or an env allowlist where the code has no flags. Without one, the change is
live on deploy and we fix forward. A **flag-off hunk** is changed code that
runs with the flag off, such as an else branch or shared code the flagged
work changed. It is live on deploy for everyone the flag excludes, so name it
on the Switch-off line.

## Post

On someone else's PR, show the user the proposed body change and post it
after they approve.

1. Read the body with `gh pr view <n> --json body -q .body`.
2. Remove every `merge-risk` and `line-count` marker block from the body.
3. Put the block under the `Merge Danger` heading when the body has one,
   else right after the Impact section, else right after the problem
   section, else first. Keep the rest of the body byte for byte.
4. Write it back with `gh pr edit <n> --body-file <file>`.

Done when the description carries one merge-risk block with the current
grade and tier. With the `hedge` CLI, the judge in `hedge proof gate` fails a
grade or door that does not follow from the diff and the saved proofs, and a
Tier line that says non-critical while the diff touches a listed critical
path.
