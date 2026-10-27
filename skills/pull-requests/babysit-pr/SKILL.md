---
name: babysit-pr
description: >-
  Keep a pull request green and answered through CI and review. Never merges.
  Use when the user asks to monitor, watch, or babysit a PR.
metadata:
  credits:
    - skill: babysit-pr
      author: Theo Browne
      license: MIT
      url: "https://github.com/t3dotgg/tstack"
---

# Babysit PR

Babysitting keeps a PR green and answered: fix real findings and CI failures,
answer the review bots, keep the branch mergeable. It never marks a PR ready,
requests reviewers, or merges. `full-stop`, `full-send`, `stamp-pr`, and
`rollout` decide those.

Many repos have AI review bots. They're helpful, even if they are not always
right.

## Waiting

Never write your own watcher, polling loop, or `sleep` loop. Use one watcher
per PR. Every watcher on a GitHub account shares one rate limit.

### In T3 Code: `watch_pull_request`

Handle the existing checks and comments first. Then call
`watch_pull_request` and end your turn. T3 Code wakes you with a message when
a check fails, the required checks pass, someone comments or reviews, or the
branch conflicts.

- **Only the thread that owns the PR watches it.** If you are a delegated
  child task (a reviewer, a review round, any `delegate_task` child), never
  call `watch_pull_request`. The parent owns the PR. Do not watch PRs you are
  not working on.
- **A wake is news, not a merge decision.** Read the PR yourself before you
  act.
- **Unwatch when you hand off.** A watched thread stays in Working and out of
  the user's inbox. When you stop (ready, blocked, or asking the user a
  question), call `unwatch_pull_request` first. A merge or close ends the
  watch on its own.
- **"Stopped watching, could not read it"** usually means GitHub's rate limit
  is used up. Run `gh api rate_limit --jq .resources.graphql` before you
  watch again. If `remaining` is near 0, wait for `reset` with one background
  command, then watch again. Never watch again in a tight loop.

### Everywhere else

Wait in one command that blocks until the checks finish:
`gh pr checks <number> --watch`, with the shell tool's timeout near its
maximum. Run it again when it times out first. When only a review is pending,
end your turn and report that the PR waits on review. Under `full-send` or
`stamp-pr`, ask instead with the question tool, per full-send's "Asking the
user".

With either watcher: when an event needs no action, end your turn without a
message. Never post or say "still waiting".

## GitHub rate limits

`gh pr create`, `gh pr view`, and `gh pr checks` use GraphQL. When GraphQL is
used up, the REST limit is separate and usually still has room. Use
`gh api repos/<owner>/<repo>/pulls/<n>` to read a PR, and
`gh api repos/<owner>/<repo>/commits/<sha>/check-runs` for checks.

## First pass

Before you watch, close the review-bot threads that already exist:

1. List every unresolved review thread as bot or human, answered or
   unanswered. When the `fleet` CLI is available (on `PATH` or at
   `~/dev/fleet/fleet`), run
   `fleet pr bot-threads --repo <owner/repo> --pr <number>`. It exits 1 while
   an unanswered bot thread remains. Otherwise read `reviewThreads` through
   `gh api graphql`.
2. Triage and answer each one as in Reviews.
3. Resolve every bot thread whose last comment is yours: run the command
   again with `--resolve`, or use the `resolveReviewThread` mutation. Human
   threads stay open.

## Reviews

Only act on checks and comments newer than the latest push. Triage every
finding, thread, and failed check per [`TRIAGE.md`](../qa-swarm/TRIAGE.md) of
the `qa-swarm` skill: verify it against the source before you change code, fix
real findings and CI failures, tell repository failures from infrastructure
flakes, and reply with a written reason when you dismiss a false positive. Use
the `leaving-pr-comments` skill for every comment posted on the user's behalf.

CodeRabbit is advisory. Treat its findings like any other finding, but never
wait for it and never hold a merge for it.

Keep the PR at the size the user's goal needs. Review loops tend to grow a
PR one cheap-looking fix at a time. Make the most minimal possible changes to
appease the reviewers. Be careful of scope creep and don't be scared to push
back. Fix real bugs in the intended case. Decline the rest with a written
reason, and list them as follow-ups: unneeded tests, guards for edge cases
that do not matter, extra integration or compatibility, and small performance
costs. Prefer the fix that deletes or narrows code.

Every push gets a final read of its diff: one review from the other model
family for a fix that changes behavior, and your own `git range-diff` check
for a rebase or a reworded fix. With the `fleet` CLI, run
`fleet proof review ... --scope final --base <last reviewed SHA> --phase babysit`
and answer it with `fleet proof respond ... --round final <responses file>`.
Record a `range-diff` check with `review-start` and `review-finish` in the
same phase. Without the CLI, record both in the ledger. From the third final
read, `fleet proof` asks its arbiter first, as in `qa-swarm`. Its refusal, or
the ceiling of six final reads, stops the push and is a question for the user.

## Base branch

Keep an eye on the base branch and rebase when needed. `watch_pull_request`
reports conflicts only, so check for BEHIND yourself before you report the PR
ready. Push a rebase with `--force-with-lease=<branch>:<head SHA before the
rebase>`. If the lease fails, fetch and reassess rather than overwriting new
work.

If an overlapping PR makes this one obsolete, stop monitoring, report it to
the user, and ask before closing the PR unless closure was explicitly
authorized.

If nothing has changed, stay quiet rather than posting filler comments.

## Done

The skill that called you sets the end. Called alone, babysitting ends when
the PR is approved, or is still a draft, and its required checks are green on
the latest head, no bot thread is open, no human thread waits on you, and the
branch is neither BEHIND nor DIRTY; or when the PR merges or closes. Report
that it is ready to merge, or for a draft, ready for the user's review. Never
merge it.
