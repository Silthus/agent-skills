---
name: full-stop
description: >-
  Trigger this if the user says 'full stop', 'create a draft PR', or
  'draft PR', or when the user's agent instructions make full stop the
  default for work that ends in a PR.
metadata:
  credits:
    - skill: full-stop
      author: Theo Browne
      license: MIT
      url: "https://github.com/t3dotgg/tstack"
---

# Full Stop

Do the same work as `full-send`, but stop with a PR ready for the user's
review. Keep it a draft, unless the user's agent instructions turn on
**Ready on green** below. Never merge it.

Read [full-send](../full-send/SKILL.md) and follow its workflow, proof rules,
review, and babysitting steps 1 to 5. An explicit "full stop" request, or the
same request worded as "create a draft PR" or "draft PR", or the
user's agent instructions making full stop the default, authorizes that work
without a separate "full send" request. That includes full-send's testing
permission. That request, or that default, is the permission for the test
methods Proof needs, even when a project file says to ask first, for example
before computer use. Use those methods directly. Its permissions to mark the
PR ready, merge, and roll out do not apply. The overrides below take precedence.

## No merging

You may commit, push, rebase, fix conflicts, and use `--force-with-lease` on
this task's branch. Never mark the PR ready for review, request reviewers,
merge, enable auto-merge, enter a merge queue, push to the default branch,
bypass branch protection, ask the approval bot for a run or add its label, or
delegate those actions. Two exceptions: the code-owner request in "Ask code
owners at draft time", and the steps of "Ready on green", both below.

Disable existing auto-merge and remove the PR from any merge queue before
work begins; check again before each push. Report these changes. If you
cannot prevent automatic merging, report the blocker before proceeding.

## Ask code owners at draft time

When the user's agent instructions name an approval bot for this repo, as
`stamp-pr` uses, run this right after the draft PR opens:

`fleet pr forecast --repo <owner/repo> --pr <number> --request`

It matches the changed paths and size against the bot's own policy files. On
a likely refusal it requests the owning teams from CODEOWNERS and owners.yaml,
so their review overlaps CI and the proof gate instead of starting after
them. The slices were already cut to the bot's rules before code, per
**Slice to the stamp** in full-send step 1. Exit 0 means the forecast ran,
whatever it predicts. Run it again after
a push that adds paths. Report any path it prints as having no owning team.
It never posts to Slack and never asks the bot for a run.

## Stop at the gate

Use full-send's merge gate as the readiness check, without its approval
condition. Replace its steps 6 to 8 with a handoff. Proof and review must cover
the final diff; recheck behavior changes and meaningful conflict fixes before
handoff.

Fetch the target branch and check the live PR's head, base, checks, reviews,
and mergeability. Confirm it is open, still a draft, and not set to merge
without the user. If someone else merged it, report that instead.

- **Ready for your review:** the gate passes. Leave the PR open as a draft,
  or follow "Ready on green" when it is on.
- **Blocked:** explain what prevents readiness, what you tried, and what is
  needed. Follow full-send's rules for asking the user.

## Ready on green

Turn this on only when the user's agent instructions say that a PR passing
their ready gate is marked ready by the agent. A draft then means agents are
still working on it, and ready means ready for a person. The instructions
name the gate; it adds to the merge gate above and never replaces it.

Ready is a check, not a claim. When the `fleet` CLI is available, the gate
passes only when `fleet proof gate` exits 0 on the final head. That needs a
finished panel round on the PR (`fleet proof review --lens ...`, as
`qa-swarm` runs it), with the head covered by that panel or by a final read
after it. A single-reviewer round does not count. After each
`fleet proof gate` on a new head, run `fleet proof receipt` as
`pr-description` says under Proof. Ready also needs a receipt run on the
final head that exits 0 and prints `receipt current` or `receipt written`,
with no warning for a missing line, caption or screenshot URL. Never mark,
report, or hand back a PR as ready before both.

When the gate passes on the final head:

1. Mark the PR ready for review. Request no reviewers; the repo assigns them.
2. Babysit it per `babysit-pr` until every check and bot review that runs
   only on ready PRs has finished on the head, each failure is fixed, and
   each new finding is fixed or answered and resolved.
3. When the user's agent instructions name an approval bot for this repo,
   wait until its own prerequisites are met, such as other bot reviews
   finished, then ask it for one run on the head, as `stamp-pr` does. Do not
   merge on its approval. Record its verdict and reasons, and run it again
   after every push.

Every push after the flip goes back through the gate and then the receipt,
as above. If the gate fails after the flip, convert the PR back to a draft, fix it, and
start again. Report the bot's verdict in place of the forecast below.

## Forecast the stamp

When the PR is ready for your review, "Ready on green" is off, and the
user's agent instructions name an approval bot for this repo, as `stamp-pr`
uses, forecast its verdict on the final head. The bot refuses drafts, and a passing run posts a real approval,
so never run it here. Predict the verdict instead:

- Run `fleet pr forecast --repo <owner/repo> --pr <number>` on the final
  head, and check `stamp-pr`'s Qualify rules against the final diff.
- Name every team other than the user's that owns a changed path, per
  `stamp-pr`'s "Other teams' code". A stamp will ask the user about them.
- Check that every bot review on the head is finished, and each finding is
  fixed or answered and its thread resolved.
- Check the refusal patterns that the user's agent instructions record for
  the bot.

The verdict is **likely approve**, or **likely refuse** with the rule or
pattern that fails. The forecast is not a requirement for the handoff.

In T3 Code, keep the watch through the handoff, per `babysit-pr`. Unwatch
only right before a question, and watch again once the user answers.
Report the PR link, final head, verdict, proof, reviewer outcome, merge risk,
stamp forecast, and remaining risks. Label the forecast as a prediction, not
the bot's verdict. State whether the PR is still a draft or marked ready, and
that it is unmerged.

The user can continue from here with "full send" or "stamp it". That skill
starts from this PR as it stands.
