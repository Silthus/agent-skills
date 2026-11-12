# Learn

The weekly **ritual** of both loops. It turns the week's ledger into lessons, re-ranks the work, and changes the limits by rule, so the loops improve without the user tuning them. The quality loop's coordinator runs it on the ritual day for both loops.

1. **Read the week.** Read every `runs.jsonl` line since the last ritual, each lane PR's review findings and CI history, each deploy watch, and each 14-day `impact` retro of a `fix` PR that came due.
2. **Grade each PR** as one of these:
   - `clean`: merged with no real review finding, no failed CI run caused by the change, and a quiet deploy;
   - `rough`: merged after real findings or a failed run;
   - `bad`: reverted, refused twice, abandoned, or followed by a bad signal after deploy.

   A critical lane still at `ready` gets its grade after the user's word.

   Grade each `fix` PR's **worth** too, 14 days after deploy, from the reach its worth line named:
   - `mattered`: the failure was observed before the deploy and stopped after it, or the exposure it handled was real;
   - `silent`: nothing shows the failure ever happened, before or after;
   - `unknowable`: no source can see the failure. Name the counter that would have shown it.
3. **Check the tripwires.** Run the tripwire of each `parked` row in `signals.md` and in the worth log. A tripwire that fired sets the row to `reopened`, so the next signal-loop run triages it again. Count the rows that fired.
4. **Learn.** For each `rough` or `bad` PR, write a lesson with the `lessons` skill from its ❌ lines and evidence. When a lesson repeats, route it as `lessons` says, to a check, a `REVIEW.md` line in the code repository through its own lane, or an edit to this skill. Run the `retro` categories over the session of the worst lane.
5. **Tune `limits.md`.** Write one dated line per change:
   - after ten PRs in a row from one loop since that loop's last raise that are `clean` and not `silent`, raise that loop's WIP by one, up to 5;
   - when a loop's WIP is already 5, its next ten such PRs in a row raise the line limits by half instead, up to 400 changed production lines;
   - after any `bad` PR, set that loop's WIP back to 2 and halve the line limits;
   - after a revert, or a bad production signal from a lane, set `Paused: yes` and ask the user.
6. **Re-rank the hot paths.** Recompute each module's score inputs: churn and bug-fix share from Git, error and latency weights from the signal sources, and the test gap. Write them to `hotpaths.md` and reorder `backlog.md`. Reopen a `done` module whose errors, latency, or churn rose.
7. **Send the misses.** Count the week's real signals per source in `signals.md`, and the share of them whose `Report` is `miss` or `filed`. For each source with misses, read `inbox-feedback.md`. When the gap is new, send one `agent-feedback` report with `feedback_type` `product` and the `product_area` the settings name: which source, the kind of finding the Inbox missed, two or three report-free examples, and the fix you suggest. Never include customer names or production numbers. Append the gap and its feedback id to `inbox-feedback.md`. When a source's miss share stays under the settings' switch-over bar for the weeks the bar names, propose to the user to stop that collector.
8. **Report** in the final reply. List the PRs with their grades and worth grades, the share of fixes graded `silent`, the parked rows whose tripwire fired, the limit changes, the lessons, the signals that need a product decision, the critical lanes waiting for the user, the miss share per source, and the top five of each backlog. Keep production numbers in the ledger and link to it.

Done when every PR of the week has a grade, every `fix` 14 days past deploy has a worth grade, every parked tripwire ran, every `rough` or `bad` PR has a lesson, every source with misses has a logged gap, and `limits.md`, `backlog.md`, and `hotpaths.md` carry this week's date.
