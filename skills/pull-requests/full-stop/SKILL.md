---
name: full-stop
description: >-
  Trigger this if the user says 'full stop', or when the user's agent
  instructions make full stop the default for work that ends in a PR.
metadata:
  credits:
    - skill: full-stop
      author: Theo Browne
      license: MIT
      url: "https://github.com/t3dotgg/tstack"
---

# Full Stop

Do the same work as `full-send`, but stop with a draft PR ready for the user's
review. Never mark it ready for review, and never merge it.

Read [full-send](../full-send/SKILL.md) and follow its workflow, proof rules,
review, and babysitting steps 1 to 5. An explicit "full stop" request, or the
user's agent instructions making full stop the default, authorizes that work
without a separate "full send" request. That includes full-send's testing
permission. It is the permission for the test methods Proof needs, even when
a project file says to ask first, for example before computer use. Use those
methods directly. Its permissions to mark the PR ready, merge, and roll out do
not apply. The overrides below take precedence.

## No merging

You may commit, push, rebase, fix conflicts, and use `--force-with-lease` on
this task's branch. Never mark the PR ready for review, request reviewers,
merge, enable auto-merge, enter a merge queue, push to the default branch,
bypass branch protection, or delegate those actions.

Disable existing auto-merge and remove the PR from any merge queue before
work begins; check again before each push. Report these changes. If you
cannot prevent automatic merging, report the blocker before proceeding.

## Stop at the gate

Use full-send's merge gate as the readiness check, without its approval
condition. Replace its steps 6 to 8 with a handoff. Proof and review must cover
the final diff; recheck behavior changes and meaningful conflict fixes before
handoff.

Fetch the target branch and check the live PR's head, base, checks, reviews,
and mergeability. Confirm it is open, still a draft, and not set to merge
without the user. If someone else merged it, report that instead.

- **Ready for your review:** the gate passes. Leave the PR open as a draft.
- **Blocked:** explain what prevents readiness, what you tried, and what is
  needed. Follow full-send's rules for asking the user.

In T3 Code, call `unwatch_pull_request` before the handoff or a question.
Report the PR link, final head, verdict, proof, reviewer outcome, merge risk,
and remaining risks. State that the PR is still an unmerged draft.

The user can continue from here with "full send" or "stamp it". That skill
starts from this PR as it stands.
