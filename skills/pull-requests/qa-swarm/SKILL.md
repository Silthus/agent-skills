---
name: qa-swarm
description: >-
  Take a PR to review-ready with a cross-model reviewer panel, and review
  draft specs for overengineering. Use when the user asks for a QA swarm,
  when the diff touches a merge-risk danger area, or before a spec is
  published.
metadata:
  credits:
    - skill: qa-swarm and review-triage
      author: Paul D'Ambra
      url: "https://github.com/pauldambra/dotfiles/tree/main/ai/skills"
    - skill: verify by observation, small stacked PRs
      author: Daniel Visca
      url: "https://posthog.com/newsletter/code-review-tips"
    - skill: thermo-nuclear-code-quality-review, the code judo rubric of the Design lens
      author: Cursor (MIT)
      url: "https://github.com/cursor/plugins/tree/main/thermos"
    - skill: ponytail and ponytail-review, the ladder and the keep list of the Anti-Overengineering lens
      author: Dietrich Gebert (MIT)
      url: "https://github.com/DietrichGebert/ponytail"
    - skill: overengineering-review, the payoff ranking and the LEAN footer
      author: markoblogo
      url: "https://github.com/markoblogo/abvx-agent-skills"
    - skill: spec-kit constitution gates, the gates of the spec pass
      author: GitHub (MIT)
      url: "https://github.com/github/spec-kit"
---

# QA swarm

The swarm takes a branch to a draft PR that the user can merge after one read.
The bar: the user finds nothing that a reviewer, a review bot, or CI would have
found. Fresh reviewers from two model families review the change, you fix what
holds, and a second, narrow round reviews your fixes. The budget is two
rounds, because a third panel costs as much as the first and mostly finds churn.

For a draft spec, run the [spec pass](SPEC.md) instead of the steps below.

## Rules

- **Fresh eyes.** Every reviewer is a new agent that did not see the build.
  You frame, triage, and fix. A fix you push is new code, and the next round
  reviews it cold.
- **Two model families.** Every panel runs the review lane on the other family
  and the fresh-eyes lane on the author's family, because they miss different
  things. A finding from both carries more weight.
- **Claims are hypotheses.** Check every finding against the code at HEAD
  before you act on it, whoever raised it.
- **Observe.** A green test suite is test evidence. A proof is something you
  ran and watched in the running system, per [`PROOF.md`](PROOF.md).
- **Scope.** The PR's goal is the scope. A real problem outside it is a
  follow-up.
- **Draft.** The PR stays a draft. The user reads the code and marks it ready
  for review.
- **Comments.** Panel findings stay in the ledger. Every GitHub comment goes
  through the `leaving-pr-comments` skill.
- **Fleet.** The `fleet` CLI is on `PATH` or at `~/dev/fleet/fleet`. When it is
  available, it holds the proof and the round budget. Otherwise, the ledger
  holds them.

## 1. Frame

Fetch the base branch, then write down:

- **Goal**: the outcome a user gets, in one or two sentences, and the issue it
  closes. Say what a user can do after the change that they cannot do on the
  base, and leave the design out. The goal is the oracle: behavior it does not
  ask for gets extra scrutiny, and so does behavior that no user can observe
  once the PR and the PRs below it merge, such as a parameter for a reader
  that no PR in the stack adds.
- **Approach**: the design the author chose, in a few bullets: the contracts
  it adds or changes and where the logic lives. It is a claim for the panel to
  judge, never a part of the goal.
- **Base** and the diff, `git diff origin/<base>...HEAD`.
- **Danger areas**: the hunks in the danger areas of the `merge-risk` skill.
- **Split**: one concern per PR, at most about 400 changed production lines.
  Split a larger or mixed change into a stack before the first round. Each PR
  builds only on the PRs below it and carries its own tests. Run the swarm on
  each PR, bottom up.
- **Proofs**: the proofs the PR owes per [`PROOF.md`](PROOF.md), with the
  persisted inputs and boundary formats the changed path touches.

Done when all six are written down.

## 2. Open the draft

1. Run the [design pass](PANEL.md#design-pass) when no PR exists yet, and fix
   what holds before anything else.
2. Run the repo's local gate: the formatter, lint, typecheck, and tests that
   its agent docs, scripts, and CI configuration name. A step that times out
   fails. Rerun a per-file step, such as a linter, a formatter, or `semgrep`,
   on the changed files only:
   `git diff --name-only --diff-filter=d origin/<base>...HEAD`. Every other
   step that times out, and a per-file step that times out again, records a
   gap. Every later run of the local gate follows the same rule. Done when
   every step is green or recorded as a gap.
3. Run every owed proof before review, the live run first, and save its
   evidence. For UI changes, the [UI walk](PROOF.md#ui-walk) captures the
   changed journey, and its screenshots are the PR's
   [UI evidence](../pr-description/references/ui-evidence.md). Record a gap for each owed proof you
   cannot run.
4. Push. When no PR exists, open a draft with `gh pr create --draft` and write
   the description with the `pr-description` skill. Once the PR number exists,
   register the owed proofs with `fleet proof require`, then save the evidence
   and gaps from step 3 under it, as [Record](PROOF.md#record) describes.
5. Keep the proof and the ledger in storage that outlives the worktree and
   stays out of source history. The **ledger** holds every finding, thread,
   and check failure with its source, location, bucket, and evidence. With the
   `fleet` CLI, get the commit proof directory with
   `fleet proof path --repo <owner/repo> --pr <number> --commit <full SHA>`
   and save the verification output and captures there with `fleet proof save`.
   Keep the canonical ledger in its parent PR directory as `ledger.md`. Copy an
   existing Git-metadata ledger there once and keep its findings. Without the
   CLI, keep an existing durable ledger location, or create one directory per
   PR outside the repository.

Done when the PR exists, its head is your HEAD, and the description carries
the observed behavior and any verification gaps.

## 3. Rounds

A round works on one HEAD. Run its steps in order.

1. **Review.** Reserve the round before dispatch, so a resumed session
   cannot reset the budget. With the `fleet` CLI, run
   `fleet proof review-start --repo <owner/repo> --pr <number> --commit <full SHA> --scope full`,
   or `--scope fixes --base <round 1 SHA>` for round two. On resume, reuse an
   unfinished reservation. After the panel, complete it with
   `fleet proof review-finish` and its `--round <number>` and findings file.
   Without the CLI, write the round number, scope, and HEAD to the ledger
   before dispatch, mark the round finished after the panel, and count the
   rounds from the ledger on resume.
   A spent budget ends panel dispatch, and valid findings still get fixed. An
   extra panel requires the user's explicit request: record it with
   `--override`, or in the ledger.
   Read [`PANEL.md`](PANEL.md) and dispatch the panel on HEAD. While it runs,
   wait at most 15 minutes until the review bots of the repo's recent PRs have
   reviewed HEAD and the **gating checks** on HEAD have finished. Record a bot
   that stays silent. The gating checks are the required checks
   (`gh pr checks --required`), or every check when the repo marks none as
   required.
2. **Triage** every panel finding, unresolved review thread, bot comment on
   HEAD, and failed check per [`TRIAGE.md`](TRIAGE.md). Done when each one is
   in the ledger with exactly one bucket.
3. **Fix** every Fix and Call item. Fix a bug red first with the `tdd` skill:
   a test that fails on the bug, then the fix. Close the sibling sites a
   finding names in the same commit. Run the local gate, verify the behavior
   the fixes affect, commit, and push. Refresh the description with
   `pr-description` before another panel reads it. Then answer the threads per
   the Sources in [`TRIAGE.md`](TRIAGE.md).

The round is clean when it produced no Fix or Call item. A clean first round
ends the rounds.

After a first round with fixes, run round two on the new HEAD. It is narrow:
its panel runs only the lenses whose findings you fixed, plus Systems when its
trigger in [`PANEL.md`](PANEL.md) holds, and their briefs carry the fix diff,
`git diff <round 1 head>...HEAD`, in place of the full diff. When every fix
only renamed, reworded, or reformatted code, round two skips the panel, waits
for the bots and checks, and goes straight to the final read.

Round two is the last panel. Fix what it finds and push. Every commit after
the last reviewed one then gets a **final read**: one fresh reviewer from the
review lane reads the fix diff since that commit,
`git diff <last reviewed SHA>...HEAD`, in place of the full diff, with the
lens brief of the findings those fixes close. With the `fleet` CLI, reserve it
with `fleet proof review-start ... --scope final --base <last reviewed SHA>`
and complete it with
`fleet proof review-finish ... --round final <findings file>`. A final read
never counts toward the two-round budget. A fix from a final read is a new
commit, so it gets its own final read; a Fix or Call item from that second
final read becomes a Decision, and so does any later Fix or Call item that
would need a third final read. `fleet proof` refuses that third read in the review phase,
its default, until the user answers; record the answer with `--override`.
Skip the final read when a review already covered HEAD. A Fix item you cannot
close becomes a Decision, and the handoff is Blocked.

Done when every ledger item is fixed, rejected, or a Decision, and every
gating check on HEAD is green. A check that has not reported yet is not green.
A check that waits for a maintainer to approve the run is a gap, not a
failure. A repo without CI relies on the local gate; name that as a gap.

## 4. Refresh proof

1. Rerun every owed proof whose behavior changed since its last run. For UI
   changes, use the refresh rules in
   [UI evidence](../pr-description/references/ui-evidence.md).
   Keep the evidence for the final reviewed commit in the proof storage from
   step 2, and record the original run of any reused evidence.
2. A failed proof is a Fix item in the ledger, inside the remaining round
   budget. Once the budget is spent, an unresolved proof blocks the handoff.
3. Update the description with `pr-description`. Its evidence and gaps
   describe the final behavior, its merge risk matches the final diff, and its
   Decisions block carries the same decisions and calls as the handoff, with
   the rounds and bots on its Involvement line.

Behavior that only production can show belongs to the post-deploy watch,
which the handoff names. Done when the description carries the final
evidence and gaps, a merge risk that matches the final diff, and the
Decisions block. With the `fleet` CLI, `fleet proof gate` also exits 0 or 3.

## 5. Hand off

Report to the user, then stop:

- The PR link and its outcome. **Ready**: every ledger item is fixed or
  rejected on `<short sha>`, the gating checks are green, every owed proof has
  evidence or an accepted gap (`fleet proof gate` exits 0), and no Decision is
  open. **Blocked**: anything else, with what blocks it: the open Decisions,
  the unaccepted gaps, or a red check.
- The merge risk and its first bullet.
- The rounds, and the number of fixed and rejected items per source.
- **Decisions**: each load-bearing question with your recommended answer.
- **Calls made**: each choice between defensible options, with the
  alternative, so the user can redirect it in one line.
- **Drafts**: each reply that needs the user's approval, with its thread URL.
- **Read first**: the danger hunks.
- **Follow-ups**: real problems outside the goal.
- **Gaps**: each owed proof that could not run, as a Decision for the user;
  a lane that failed and its substitute; a skipped Team lane; a silent bot;
  a gate step that could not run, as a Decision unless a gating check on
  HEAD runs that step.

When the user's agent instructions ask for a Slack message at the end of a
PR, end with it, formatted by the `slack-pr-update` skill. When the user asks
you to babysit the PR, the `babysit-pr` skill takes over.
