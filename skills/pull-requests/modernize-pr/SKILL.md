---
name: modernize-pr
description: >-
  Bring an old PR up to date with its base branch: check whether newer changes
  invalidate it, rebase, adapt the code to what changed, verify, and summarize.
  Use when the user asks to modernize, refresh, or update a stale PR.
---

# Modernize PR

A PR drifts while it waits. The base branch renames APIs, moves files, adopts
new patterns, or merges a PR that solves the same problem. Modernizing makes
the PR read as if it was written today, with the same goal and no new scope.

For several PRs, dispatch one subagent per PR. Each subagent works in its own
worktree and returns the summary from step 6.

## Steps

1. **Check out.** Create a worktree on the PR head:
   `gh pr view <url> --json headRefName,baseRefName,files,body`, then
   `git worktree add`. Never change the current checkout. Done when the
   worktree builds its dependencies.
2. **Survey drift.** Fetch the base branch and find the merge base. For each
   file in the PR, list the base commits since the merge base that touch it:
   `git log --oneline <merge-base>..origin/<base> -- <file>`. Search merged PRs
   with the same goal: `gh pr list --state merged --search "<key terms>"`.
   Done when every PR file has a verdict: unchanged upstream, or what changed.
3. **Decide.** If the base branch already solves the problem, stop. Report the
   overlapping change and ask the user before closing the PR. If the PR is
   approved and only waits for CI or a merge, continue only when it has
   conflicts: a push can dismiss the approval and, in repositories such as
   `PostHog/posthog`, needs a maintainer to authorize CI again.
4. **Rebase and adapt.** Rebase onto `origin/<base>`. Resolve each
   conflict by the intent of both sides, traced to their commits and PRs. Adapt the change to the
   drift from step 2: renamed APIs, moved files, and the patterns that
   neighboring code uses now. Keep the PR's goal and size. Done when the diff
   against the base contains only the PR's intent.
5. **Verify.** Run the typecheck, lint, and tests for the touched area. For UI
   changes, refresh the browser verification and media through
   [UI evidence](../pr-description/references/ui-evidence.md). Update the
   description with the `pr-description` skill so it describes the current change and its evidence. Done when the
   checks pass, or a failure also occurs on the base branch, and the body
   distinguishes verified behavior from remaining gaps. Then push with
   `git push --force-with-lease`.
6. **Summarize.** Report per PR: its state now, what changed upstream, what
   you adapted, the verification result, and the next step. Offer the
   `babysit-pr` skill to watch the new CI run and review bots.
