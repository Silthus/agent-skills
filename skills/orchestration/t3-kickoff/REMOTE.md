# Hand off to another machine

A remote handoff moves the work from this T3 Code thread to a new thread on another machine. The new thread appears in the user's T3 sidebar under that machine. This thread is archived when the current turn ends. Git carries the code; the handoff document carries everything else.

Below, `kickoff` means `bun <this skill's directory>/scripts/kickoff.ts`, as in [SKILL.md](SKILL.md).

1. **Name the target.** Map the user's words to a host alias in the user's SSH configuration: list the aliases with `grep -iE '^[[:space:]]*Host[[:space:]]' ~/.ssh/config ~/.ssh/config.d/* 2>/dev/null`, including files that `Include` lines name. A Coder workspace that has no alias is reached as `coder.<workspace>`. Done when the alias exists and differs from `hostname`. When the words match no alias, or match more than one, ask.
2. **Push everything.** Commit every change in the worktree, unfinished work included, with a message that says what is unfinished. Push the branch to `origin`. In a repository whose rules push to the default branch, push there; elsewhere, work on a feature branch. Done when `git status` is clean and `origin/<branch>` is at `HEAD`. Name what Git does not carry in the handoff document: ignored files such as `.env`, local databases, running servers, and files outside the worktree.
3. **Write the handoff document** with the `handoff` skill. The new thread receives it as its first message, so write it to the next agent and end it with the next action.
4. **Start the new thread:**

   ```sh
   kickoff handoff --to <alias> --prompt-file <doc>
   ```

   It checks that the branch is pushed. It starts a thread on the target with this thread's title and model, in a new worktree at `origin/<branch>`, and clones the repository there when the target does not have it. Then it archives this thread in the background once this turn ends. The target needs T3 Code running, `bun` on the login shell's `PATH`, and the t3-kickoff skill installed (see **Settings** in [SKILL.md](SKILL.md)). Add `--dry-run` to check the target without starting anything. Done when it prints `<alias> <thread-id>`.
5. **Report and stop.** Tell the user the target and the new thread's title, then end the turn. Archiving waits for the turn to end; work done after the handoff stays behind in an archived thread.

When `kickoff handoff` fails, this thread stays as it is. Fix the cause it names and run it again.
