---
name: qa-swarm
description: >-
  Bring a PR to review-ready: a cross-model reviewer panel, a fix for every
  verified finding and bot thread, in at most two rounds. Use when the user
  asks for a QA swarm, or when the diff touches a merge-risk danger area.
---

# QA swarm

The swarm takes a branch to a draft PR that the user can merge after one read.
The bar: the user finds nothing that a reviewer, a review bot, or CI would have
found. Fresh reviewers on two model families review the change, you fix what
holds, and a second, narrow round reviews your fixes. Two rounds is the
budget: a third panel costs as much as the first and mostly finds churn.

## Rules

- **Fresh eyes.** The agent that built the change never reviews it. Every
  reviewer is a new agent that did not see the build. You frame, triage, and
  fix. A fix you push is new code, and the next round reviews it cold.
- **Two model families.** Every panel runs the review lane on the other family
  and the fresh-eyes lane on the author's family. They miss different things.
  A finding from both carries more weight.
- **Claims are hypotheses.** Check every finding against the code at HEAD
  before you act on it, whoever raised it.
- **Observe.** Proof is something you ran and watched, never an argument that
  the code works.
- **Scope.** The PR's goal is the scope. A real problem outside it is a
  follow-up for the handoff.
- **Draft.** The user marks the PR ready for review. Leave the draft state to
  them.
- **Comments.** The swarm's findings stay in the ledger, not on GitHub. Every
  GitHub comment goes through the `leaving-pr-comments` skill.

## 1. Frame

Fetch the base branch, then write down:

- **Goal**: what the user asked for, in one or two sentences, and the issue it
  closes. The goal is the oracle: behaviour it does not ask for gets extra
  scrutiny.
- **Base** and the diff, `git diff origin/<base>...HEAD`.
- **Danger areas**: the hunks in the danger areas of the `merge-risk` skill.
- **Split**: one concern per PR, at most about 400 changed production lines.
  Split a larger or mixed change into a stack before the first round. Each PR builds only on the PRs below it and carries its
  own tests. Run the swarm on each PR, bottom up.

Done when the goal, base, danger areas, and split are written down.

## 2. Open the draft

1. Run the repo's local gate: its formatter, lint, typecheck, and tests. Find
   them in the repo's agent docs, scripts, and CI configuration. Done when the
   gate is green.
2. Run the change and watch it work before review. Keep the verification
   command's real output and send a real request to a changed API. For UI
   changes, follow [UI evidence](../pr-description/references/ui-evidence.md) and capture
   the changed journey in that session. Record verification gaps explicitly.
3. Push. When no PR exists, open a draft with `gh pr create --draft`. Write
   the description with the `pr-description` skill.
4. Keep the proof and the ledger in storage that outlives the worktree. When
   the `fleet` CLI is available (on `PATH` or at `~/dev/fleet/fleet`), get the
   commit proof directory with
   `fleet proof path --repo <owner/repo> --pr <number> --commit <full SHA>`.
   Save the verification output and captures there with `fleet proof save`.
   Keep the canonical ledger in its parent PR directory as `ledger.md`. Copy an
   existing Git-metadata ledger there once and preserve its findings.
   Otherwise, keep an existing durable ledger location, or create one
   directory per PR outside the repository. The ledger holds every finding,
   thread, and check failure with its source, location, bucket, and evidence.
   It stays out of source history.

Done when the PR exists, its head is your HEAD, and the description carries
the observed behavior and any verification gaps for reviewers.

## 3. Rounds

A round works on one HEAD. Run its steps in order.

1. **Review.** Reserve the round before dispatch, so that a resumed session
   does not reset the budget. A spent budget ends panel dispatch, while valid
   findings still get fixed. An extra panel requires the user's explicit
   request. When the `fleet` CLI is available (on `PATH` or at `~/dev/fleet/fleet`), run
   `fleet proof review-start --repo <owner/repo> --pr <number> --commit <full SHA> --scope full`.
   For round two use `--scope fixes --base <round 1 SHA>`. Reuse an unfinished
   reservation on resume. Complete it after the panel with
   `fleet proof review-finish` and its `--round <number>` and findings file.
   Record the user's request for an extra panel with `--override`. Otherwise,
   write the round number, scope, and HEAD to the ledger before dispatch, mark
   the round finished after the panel, and count the rounds from the ledger on
   resume. Record the user's request for an extra panel in the ledger.
   Read [`PANEL.md`](PANEL.md) and dispatch the panel on HEAD.
   While it runs, wait until the review bots of the repo's recent PRs have
   reviewed HEAD and the **gating checks** on HEAD have finished. The gating
   checks are the required checks (`gh pr checks --required`), or every check
   when the repo marks none as required. Wait at most 15 minutes and record a
   bot that stays silent.
2. **Triage** every panel finding, unresolved review thread, bot comment on
   HEAD, and failed check per [`TRIAGE.md`](TRIAGE.md). Done when each one is
   in the ledger with exactly one bucket.
3. **Fix** every fix and call item. Fix a bug red first with the `tdd` skill:
   a test that fails on the bug, then the fix. Close the sibling sites a
   finding names in the same commit. Run the local gate and verify the
   behavior the fixes affect, commit, and push. Refresh the description with
   `pr-description` before another panel reads it. Then answer the threads as TRIAGE.md
   says.

The round is clean when it produced no fix or call item. A clean first round
ends the rounds.

After a first round with fixes, run the second round on the new HEAD. It is
narrow: its panel runs only the lenses whose findings you fixed, and their
briefs carry the fix diff, `git diff <round 1 head>...HEAD`, in place of the
full diff. When every fix only renamed, reworded, or reformatted code, the
second round skips the panel and waits for the bots and checks only.

The second round is the last. Fix what it finds and push without another
panel; the bots and checks on that HEAD review the fix. A fix item you cannot
close becomes a decision, and the handoff is blocked.

Done when every ledger item is fixed, rejected, or a decision, and every
gating check on HEAD is green. A check that has not reported yet is not green. A repo without CI relies on the
local gate; name that as a gap. A check that waits for a maintainer to approve
the run is a gap too, not a failure.

## 4. Refresh proof

1. Recheck behavior changed since the last verification. For UI changes, use
   the refresh rules in [UI evidence](../pr-description/references/ui-evidence.md). Preserve the run
   output and applicable captures for the final reviewed commit through the
   proof storage from step 2, recording any reused evidence's original run.
2. A failed proof is a fix item in the ledger. Use the remaining round budget
   from step 3; after it is spent, unresolved proof blocks the handoff.
3. Update the description with `pr-description` so its evidence describes the final
   behavior, its merge risk matches the final diff, and its Decisions block
   carries the ledger's decisions and calls, the same ones the handoff
   reports, with the rounds and bots on its Involvement line.

Behaviour that only production can show is a gap for the handoff. Done when
the description carries the proof, the decisions, and a merge risk that
matches the final diff.

## 5. Hand off

Report to the user, then stop:

- The PR link and its outcome. **Ready**: every ledger item is fixed or
  rejected on `<short sha>`, the gating checks are green, and no decision is
  open. **Blocked**: anything else, with what blocks it: the open decisions or
  a red check.
- The merge risk and its first bullet.
- The rounds, and the number of fixed and rejected items per source.
- **Decisions**: each load-bearing question with your recommended answer.
- **Calls made**: each choice between defensible options, with the
  alternative, so that the user can redirect it in one line.
- **Drafts**: each reply that needs the user's approval, with its thread URL.
- **Read first**: the danger hunks.
- **Follow-ups**: real problems outside the goal.
- **Gaps**: a lane that failed and its substitute, a silent bot, a proof you
  could not run.

When the user's agent instructions ask for a Slack message at the end of a
PR, end with it; the `slack-pr-update` skill formats it. The user reads the
code and marks the PR ready for review. When they ask you to babysit it, the
`babysit-pr` skill takes over.
