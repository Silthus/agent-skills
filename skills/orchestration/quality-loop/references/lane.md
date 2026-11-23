# Lane contract

A lane is one coordinator subthread (`delegate_task` with `isolation: "worktree"`) that ships one PR for the quality loop or the signal loop. Both coordinators start every lane — normal and critical — as a subthread under their lineage, and every lane follows this contract.

There are two kinds of lane:

- A **normal lane** touches no critical path. It runs `full-send` with the approval bot, in its own worktree, and ends merged and deployed (or `stamped`, when the user's merge card handles the enqueue).
- A **critical lane** touches a critical path. It runs `full-stop` as a coordinator subthread in its own worktree and ends with a reviewed, proven, green PR (`outcome ready`). It never asks the user directly: its PR goes on the user's daily merge card as its own row (and the coordinator holds `watch_pull_request` on it while it waits), and when the merge lands the coordinator wakes the subthread via `t3_thread_send` to run rollout.

## Start a lane

Write the **lane brief** first. It holds:

- the loop, the ledger row or signal with its evidence, the class, and the PR type;
- the path of this file, `quality-loop/references/lane.md`;
- for a signal with an Inbox report: the report id and the coordinator's `claim_id`;
- "You are a delegated subthread and cannot reach the user or call `watch_pull_request`. When you need the user, end your turn with a last line `NEEDS_HUMAN: <what, from whom>`."

Then start the lane — both normal and critical — with `delegate_task` on the coordinator's machine, with `mode: "async"`, `isolation: "worktree"`, a clear `title` (`<loop> <id>: <short description>`), `target` set to the model and effort that the user's model table gives implementation, `runtimeMode: "full-access"`, and the brief as `task`. The lane runs its heavy tests and typechecks where the user's agent instructions say, such as a per-worktree box. Keep every lane under the coordinator's lineage instead of launching top-level sidebar threads.

## PR types

Every lane PR has exactly one type. The type makes the PR self-proving: anyone can check its safety from the diff.

- **`test`** adds or rewrites tests. Only test files and fixtures change. Every new test passes on the base commit, because it pins current behavior. The PR body names, per test, the behavior a caller relies on or the surviving mutant it kills, on a critical or churning path. Coverage supports that case; it is not the case. A test that fails on the base found a bug. Leave that test out, and name it in the final reply so the coordinator files it as a `candidate` signal. Its reach starts at zero until failures or exposure show.
- **`prune`** deletes or merges tests. Only test files change. Each deleted test asserts nothing that can fail, or is redundant: every mutant it kills, a kept test also kills. The PR body lists the evidence per test.
- **`refactor`** changes production code only. Test files stay byte for byte the same, the same tests pass before and after, and the mutation score of the touched files stays the same or rises. Each PR makes one move, such as one god method split or one copy removed. The move deletes more concepts than it adds, and the PR body names the next change it makes easier or the debugging burden it removes. A move that only relocates code is no refactor lane.
- **`fix`** changes behavior on purpose. The first commit adds a test that fails on the base. The next commit makes it pass with the smallest change.

Every test that a `test` or `fix` PR adds or changes is outside-in. It drives the unit through its public interface and asserts what a caller observes, such as the response, the stored row, or the delivered message. It asserts no mock calls, call counts, or call arguments, except where a stubbed boundary injects a fault. It does not reach past the seam. Do not copy a neighbouring test's mock assertions. Each review round checks this bar.

A change that needs two types becomes two lanes. Every PR stays inside the line limits in `limits.md`.

## Steps

1. **Branch.** Fetch `origin` and create a branch from `origin/<default>` (`delegate_task` worktrees start from the parent commit). Read the module from its callers inward, and write its seam into the PR body, one line per entry point. For a `fix`, reproduce the signal first. When you cannot reproduce it, end with outcome `abandoned: cannot reproduce` and list what you tried.
2. **Change.** Make the change. Done when `git diff --stat` shows only the files the type allows and the type's proof passes.
3. **Prove.** Prove the change as `full-send` defines proof, and record it with `fleet proof` when the Fleet CLI is installed. Each type adds its own proof:
   - `test` and `refactor`: the output of the same test command on the base and on the head;
   - `prune` and `refactor`: mutation results before and after;
   - `fix`: the failing run before the fix and the passing run after it.

   A UI change also needs a walk through the running app, with screenshots.
4. **Review.** Get reviews from the other model family until a review finds nothing new. Add `qa-swarm` when `merge-risk` grades the PR medium or higher, and for every critical lane.
5. **Ship.** Write the PR with `pr-description`, without production numbers. A `fix` links its signal's metric in an Impact section, as the `impact` skill says. When the brief names an Inbox report, attach the PR to it as soon as the PR exists: `inbox-reports-claim` with the report id, the `claim_id`, and `pull_requests`. Then append a `note` artefact with the same `claim_id` that names the PR's type, its proof, and its review rounds. A merged PR resolves the report.
   - **Normal lane:** `stamp-pr` (without calling `watch_pull_request`; link the PR and let the coordinator own any open-PR watch). The user gave "stamp it" for every normal lane. When the approval bot refuses twice, convert the PR to a draft and end with outcome `stamp-refused` and the bot's reason.
   - **Critical lane:** `full-stop`. Link the PR (`link_pull_request`), run proofs and reviews, and end the turn once checks are green and every bot finding is fixed or answered, with `outcome ready` and a final reply the coordinator can put in its report: the problem, the change, the proof, the review rounds, the merge-risk grade, and what a teammate's review should check. Never call `watch_pull_request` in the subthread: the coordinator watches the PR, wakes this subthread via `t3_thread_send` if CI fails or a review arrives, and sends `merged <PR> <merge sha>` once the merge lands so this subthread runs step 6 from Deploy.
6. **Roll out.** Merge and roll out with `rollout`, and watch the module's errors and latency through the deploy. When the rollout needs later stages, schedule them on the coordinator's machine before you end, because the lane's worktree goes away.
7. **End.** Put the lane's record line for `runs.jsonl` in the final reply, in the format of `ledger.md`, with a ❌ line for each thing that did not work. The last line is `PR <url>, head <sha>, outcome <outcome>`.

A normal lane is done when its PR is merged and deployed, or when it stops with a recorded outcome. A critical lane is done the same way after the user's word, or after the merge card's merge in the quality loop. Until then, it rests at outcome `ready`.
