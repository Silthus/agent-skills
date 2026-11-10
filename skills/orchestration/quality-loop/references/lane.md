# Lane contract

A lane is one T3 thread that ships one PR for the quality loop or the signal loop. Both coordinators start lanes as this file says, and every lane follows it.

There are two kinds of lane:

- A **normal lane** touches no critical path. It runs `full-send` with the approval bot, on its own ephemeral box, and ends merged and deployed.
- A **critical lane** touches a critical path. It runs `full-stop` on the coordinator's machine and ends with a reviewed, proven, green draft PR. The user reads it in the T3 sidebar, and the lane ships it with `full-send` on their word.

## Start a lane

Write the **lane brief** first. It holds:

- the loop, the ledger row or signal with its evidence, the class, and the PR type;
- the path of this file, `quality-loop/references/lane.md`;
- for a normal lane: "You cannot reach the user. When you need them, end your turn with a last line `NEEDS_HUMAN: <what, from whom>`."

Then start the lane:

- **Normal lane.** Spawn a box with `fleet box spawn <loop>-<slug>` in the background, because a spawn can take up to 15 minutes. Find the code repository's T3 project on the box with `t3_project_list` and the box's `environmentId`. When the lane reads production data, give the box that access as the user's agent instructions say. Start the lane with `delegate_task`, with the box's `environmentId`, the project, the model and effort that the user's model table gives implementation, `runtimeMode: "full-access"`, and the brief as the task. When the spawn fails, start the lane on the coordinator's machine with `isolation: "worktree"`, and record the fallback.
- **Critical lane.** Start a top-level thread with `t3_thread_launch` on the coordinator's machine, in the code repository's project, with a new worktree from the default branch, and the brief as its message. A top-level thread stays in the user's sidebar, and the machine stays up while the PR waits for them.

## PR types

Every lane PR has exactly one type. The type makes the PR self-proving: anyone can check its safety from the diff.

- **`test`** adds or rewrites tests. Only test files and fixtures change. Every new test passes on the base commit, because it pins current behavior. A test that fails on the base found a bug. Leave that test out, and name it in the final reply so the coordinator queues a `fix`.
- **`prune`** deletes or merges tests. Only test files change. Each deleted test asserts nothing that can fail, or is redundant: every mutant it kills, a kept test also kills. The PR body lists the evidence per test.
- **`refactor`** changes production code only. Test files stay byte for byte the same, the same tests pass before and after, and the mutation score of the touched files stays the same or rises. Each PR makes one move, such as one god method split or one copy removed.
- **`fix`** changes behavior on purpose. The first commit adds a test that fails on the base. The next commit makes it pass with the smallest change.

Every test that a `test` or `fix` PR adds or changes is outside-in. It drives the unit through its public interface and asserts what a caller observes, such as the response, the stored row, or the delivered message. It asserts no mock calls, call counts, or call arguments, except where a stubbed boundary injects a fault. It does not reach past the seam. Do not copy a neighbouring test's mock assertions. Each review round checks this bar.

A change that needs two types becomes two lanes. Every PR stays inside the line limits in `limits.md`.

## Steps

1. **Branch.** Create a branch from the latest default branch. Read the module from its callers inward, and write its seam into the PR body, one line per entry point. For a `fix`, reproduce the signal first. When you cannot reproduce it, end with outcome `abandoned: cannot reproduce` and list what you tried.
2. **Change.** Make the change. Done when `git diff --stat` shows only the files the type allows and the type's proof passes.
3. **Prove.** Prove the change as `full-send` defines proof, and record it with `fleet proof` when the Fleet CLI is installed. Each type adds its own proof:
   - `test` and `refactor`: the output of the same test command on the base and on the head;
   - `prune` and `refactor`: mutation results before and after;
   - `fix`: the failing run before the fix and the passing run after it.

   A UI change also needs a walk through the running app, with screenshots.
4. **Review.** Get reviews from the other model family until a review finds nothing new. Add `qa-swarm` when `merge-risk` grades the PR medium or higher, and for every critical lane.
5. **Ship.** Write the PR with `pr-description`, without production numbers. A `fix` links its signal's metric in an Impact section, as the `impact` skill says.
   - **Normal lane:** `stamp-pr`. The user gave "stamp it" for every normal lane. When the approval bot refuses twice, convert the PR to a draft and end with outcome `stamp-refused` and the bot's reason.
   - **Critical lane:** `full-stop`. Babysit the draft until its checks are green and every bot finding is fixed or answered. Then end the turn with outcome `ready` and a final reply the user can decide from: the problem, the change, the proof, the review rounds, the merge-risk grade, and what a teammate's review should check. When the user answers "full send" in this thread, continue with `full-send`.
6. **Roll out.** Merge and roll out with `rollout`, and watch the module's errors and latency through the deploy. When the rollout needs later stages, schedule them on the coordinator's machine with its `environmentId` before you end, because the box goes away.
7. **End.** Put the lane's record line for `runs.jsonl` in the final reply, in the format of `ledger.md`, with a ❌ line for each thing that did not work. The last line is `PR <url>, head <sha>, outcome <outcome>`.

A normal lane is done when its PR is merged and deployed, or when it stops with a recorded outcome. A critical lane is done the same way after the user's word. Until then, it rests at outcome `ready`.
