---
name: babysit-pr
description: >-
  Monitor a PR until it merges, fixing real findings on the way. Use when the
  user asks to monitor, watch, or babysit a PR.
---

# Babysit PR

All the repos we work in have various AI review bots. They're helpful, even if
they are not always right.

If your harness offers tools to monitor a PR, use them so you can respond when
comments arrive. Otherwise, poll the PR for new comments and checks.

Only act on checks and comments newer than the latest push. Verify every bot
finding against the source before changing code. Fix real findings and CI
failures, distinguish repository failures from infrastructure flakes, and draft
a reply with a written reason when dismissing false positives.

Keep an eye on changes to the base branch (`main` or `master`) and rebase when
needed. If an overlapping PR makes this one obsolete, stop monitoring, report
it to the user, and ask before closing the PR unless closure was explicitly
authorized.

Use the `leaving-pr-comments` skill for every comment on the user's behalf.
When you push a fix for a review-bot finding, reply in its thread right away
unless the bot resolved it on the push. That skill allows it without approval.
If a review bot leaves feedback you believe is not worth addressing, draft a
reply with a written reason. Post that reply, any reply to a human, or any
other comment only after the user approves that exact comment. When you cannot
ask the user, for example as a subagent, return those drafts in your report.

Do not let review feedback expand the PR beyond the user's original goal.
Address real shortcomings, but avoid scope creep.

CI on a PR from a fork, or from a first-time contributor, can wait for a
maintainer to approve its workflow runs. After every push, check for runs that
wait on approval, and approve them when your account has write access:

```sh
sha=$(gh pr view PR --repo OWNER/REPO --json headRefOid --jq .headRefOid)
gh run list --repo OWNER/REPO --commit "$sha" --status action_required \
  --json databaseId --jq '.[].databaseId' |
  xargs -I{} gh api -X POST repos/OWNER/REPO/actions/runs/{}/approve
```

Approve only runs for the PR's latest commit. Before you approve, read that
commit's diff for changes to workflow files or to scripts CI executes, and ask
the user first if you find any you did not expect.

If you cannot approve CI runs or merge in the repository, report a PR that
waits for either as waiting for a maintainer.

If nothing has changed, stay quiet rather than posting filler comments. When
the review bots and required checks are green on the latest commit, report
that the PR is ready. Merge only when the user explicitly requested it.

Keep monitoring until the PR is merged, because a ready PR can still get review
comments, conflicts, or a failed merge queue. Stop earlier only when the user
says to stop monitoring, or when the PR is closed without a merge; then report
it.
