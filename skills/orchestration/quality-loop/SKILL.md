---
name: quality-loop
description: Coordinate the quality loop, which improves one area of a codebase through small, self-proving PRs (tests first, then pruning, refactoring, and deeper modules), one lane per PR. Use when a scheduled task starts a quality-loop run, when a quality-loop lane ends, or when the user asks to start, tune, or report on the loop.
---

# Quality loop

The quality loop improves one area of a codebase while nobody watches. A scheduled task starts a **coordinator** run. The coordinator finds the work, ranks it, keeps the items above a fixed bar, and starts one **lane** per kept item. A lane is a T3 thread that ships exactly one PR. The coordinator settles each lane when it ends, and once a week it runs the ritual that tunes the loop.

The `signal-loop` skill runs the same coordinator over production signals. Its lanes follow the same contract.

## Settings

The user's agent instructions name the code repository, the **scope** paths, the **critical paths**, the ledger directory, the analytics project, the approval bot, the machine the coordinator runs on, and the schedule. When they are missing, stop and ask the user once.

## Ledger

The ledger is a directory in a private repository. It holds production numbers, so its content stays out of public repositories and PRs. Pull before you read it, and commit and push after each write. [ledger.md](references/ledger.md) has the file formats.

## Stages

Each module in scope moves through these stages in order, one at a time:

1. **cover**: outside-in tests at the module's **seam**, its public interface. Test what callers observe. Done when every entry point and every branch a caller can reach has a test, and mutation testing leaves no surviving mutant on a reachable line, or lists each survivor as equivalent.
2. **prune**: delete tests that assert nothing and tests that are redundant, and fold copied setup into shared fixtures. Done when no test is redundant.
3. **refactor**: split god methods into small functions whose names say what they do. Delete comments that repeat the code and keep the ones that say why. Give each call path one way in, data that flows one way, and no copied logic.
4. **deepen**: consolidate shallow modules behind one small interface, with the `codebase-design` and `improve-codebase-architecture` skills. Split a file only along a seam the tests cover.
5. **done**: the ritual reopens the module when its errors, latency, or churn rise.

## Coordinator run

1. **Load.** Pull the ledger and read `limits.md`. When `Paused` is `yes`, record a `no-op` run and end.
2. **Settle.** Settle each lane in `lanes.md` that ended since the last run, as **Settle** below says.
3. **Find.** Read `backlog.md`. On the first run, or when `hotpaths.md` is older than seven days, rebuild the ranking first, as step 6 of [learn.md](references/learn.md) says. Done when every module in scope has a row with its stage and **hot-path score**.
4. **Triage.** For each row, name the next PR its stage needs and grade it:
   - reach is the module's hot-path score;
   - confidence is high when the seam is clear, the tests run without services a fresh box lacks, the change fits the line limits, and the PR can name its worth as its type in [lane.md](references/lane.md) asks, and low otherwise;
   - the class is `critical` when the PR touches a critical path, and `normal` otherwise.
5. **Cut.** The free slots are this loop's WIP limit minus its running lanes. Keep high-confidence rows in score order until the slots are full. Slots may stay empty: a run that starts no lane because nothing earned one is a good run. At most one `critical` lane is open at a time. Done when `lanes.md` lists the kept rows as `planned` and `backlog.md` gives each skipped row its reason.
6. **Start lanes.** Start one lane per kept row, as [lane.md](references/lane.md) says. Record each lane's machine, thread, and task in `lanes.md`, then end the turn. The end of a normal lane wakes this thread.

## Settle

Settle a lane when it ends, or when a later run finds that it ended.

1. Read the last line of its final reply: `PR <url>, head <sha>, outcome <outcome>`, or `NEEDS_HUMAN: <what>`.
2. For `NEEDS_HUMAN`, ask the user with the question tool, send the answer to the lane's thread, and leave the lane running.
3. For a critical lane with outcome `ready`, set its state to `ready` and stop there. The user reviews the draft from the lane's thread in the T3 sidebar, and the lane ships it on their word.
4. For every other outcome, check it against GitHub and append the lane's record to `runs.jsonl`. Move the backlog row to its next stage when the stage's done criterion holds. Mark the lane `settled` in `lanes.md`.
5. When the lane holds an Inbox claim, settle the claim too. A lane with a PR: check that the report lists the PR, and attach it with `inbox-reports-claim` when it does not. A lane without a PR: release the claim with `release: true`, and set its signal back to `candidate`.
6. A bug the lane found and left out of its PR, a Follow-up from its reviews, and a side fix it proposed each become a `candidate` row in `signals.md`, with source `lane <id>`. The next signal-loop run verifies it and runs Worth like any other collected signal.
7. Archive the lane's thread once its PR merged or closed. While the PR is open, it keeps an owning thread that watches it, per `babysit-pr`: the lane, or this coordinator when the lane was a child task. Hand it over first when this thread will end before the PR does.

When the user's agent instructions let the coordinator enqueue a lane's PR, it enters the queue through the **Merge** step of `rollout`, the deploy-order check included. Exit 1 or 2 leaves the PR out of the queue: record the PR it names in `lanes.md`, and try again at the next run.

A lane is settled when its record is in `runs.jsonl`, its Inbox claim carries its PR or is released, and its thread is archived or still owns its open PR. A critical lane at `ready` stays in `lanes.md` with state `ready`, and each later run checks it again.

## Learn

On the ritual day, after settling, run [learn.md](references/learn.md). It grades the week's PRs, writes lessons, tunes `limits.md`, and re-ranks the hot paths. Report to the user in the final reply.

## Asking the user

The user is asked about a lane's `NEEDS_HUMAN`, a rollout that found a bad signal, a revert, or a change outside the scope paths. Critical lanes reach the user on their own, when they are ready to ship. The coordinator decides everything else, writes the reason into the ledger, and the ritual reports it.
