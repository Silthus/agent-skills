# Learn

The weekly **ritual** of both loops. It turns the week's ledger into lessons, re-ranks the work, and changes the limits by rule, so the loops improve without the user tuning them. The quality loop's coordinator runs it on the ritual day for both loops.

1. **Read the week.** Read every `runs.jsonl` line since the last ritual, each lane PR's review findings and CI history, each deploy watch, and each 14-day `impact` retro of a `fix` PR that came due.
2. **Grade each PR** as one of these:
   - `clean`: merged with no real review finding, no failed CI run caused by the change, and a quiet deploy;
   - `rough`: merged after real findings or a failed run;
   - `bad`: reverted, refused twice, abandoned, or followed by a bad signal after deploy.

   A critical lane still at `ready` gets its grade after the user's word.
3. **Learn.** For each `rough` or `bad` PR, write a lesson with the `lessons` skill from its ❌ lines and evidence. When a lesson repeats, route it as `lessons` says, to a check, a `REVIEW.md` line in the code repository through its own lane, or an edit to this skill. Run the `retro` categories over the session of the worst lane.
4. **Tune `limits.md`.** Write one dated line per change:
   - after ten `clean` PRs in a row since the last change, raise WIP by one, up to 4, or raise the line limits by half, up to 400 changed production lines, and never both at once;
   - after any `bad` PR, set WIP back to 2 and halve the line limits;
   - after a revert, or a bad production signal from a lane, set `Paused: yes` and ask the user.
5. **Re-rank the hot paths.** Recompute each module's score inputs: churn and bug-fix share from Git, error and latency weights from the signal sources, and the test gap. Write them to `hotpaths.md` and reorder `backlog.md`. Reopen a `done` module whose errors, latency, or churn rose.
6. **Report** in the final reply. List the PRs and their grades, the limit changes, the lessons, the signals that need a product decision, the critical lanes waiting for the user, and the top five of each backlog. Keep production numbers in the ledger and link to it.

Done when every PR of the week has a grade, every `rough` or `bad` PR has a lesson, and `limits.md`, `backlog.md`, and `hotpaths.md` carry this week's date.
