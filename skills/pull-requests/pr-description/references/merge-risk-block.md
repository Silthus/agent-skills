# Merge-risk block

Grade the PR with the `merge-risk` skill and the
[merge-risk rules](merge-risk-rules.md). This file says how the output goes
into the PR body: the output of `merge-risk` as it writes it, between the
markers, with the Tier line and the Rollout section.

## Block

```markdown
<!-- merge-risk -->
**Merge risk: <low, medium, or high>**

**Alignment:** <verdict>
- <gap>

**Impact:** <verdict>

**Verification:** <verdict>
- Safe because: <fact> (step <n>)

**Rollback cost:** <verdict>

**Error detection:** <verdict>

**Tier:** <critical (<letters>: <what holds>), or non-critical>

## Rollout

- **Switch-off:** <flag or allowlist>, or none: live on deploy, fix forward.
- **Stages:** <deploy order, then the switch-off's stages>
- **Decided:** <the call that sets the risk>
- **Watch:** <the alert that pages, or the metric; a missing alert>
<!-- /merge-risk -->
```

Keep the `<!-- merge-risk -->` markers. `hedge` reads the grade, the door, and
the tier between them. Each category holds at most two gap bullets.

The repository may be public, so never put measured numbers in the block.

## Rollout

Add the Rollout section when the grade is medium or high, or when a decision
from the PR or its thread shapes the risk. Each line appears only when it has
content.

The **switch-off** is how we stop the change in production: a feature flag,
or an env allowlist where the code has no flags. Without one, the change is
live on deploy and we fix forward. Name each flag-off hunk, as the
[merge-risk rules](merge-risk-rules.md#evidence) define it, on the Switch-off
line.

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
grade, door, or tier that is more optimistic than the diff, the saved proofs,
and the merge-risk rules support.
