---
name: audit-prs
description: Triage the author's open PRs into readiness groups with next actions, merge confidence, Jev hints, and changes since the last audit.
---

# Audit PRs

The author is the person whose open PRs the audit covers: the `gh` login. The
audit script does the fetch and the triage. You judge the merge confidence and
the questions that the script cannot answer, report to the author, and act only
when the author asks.

The scripts are in `scripts/` in this skill's directory:

```sh
bun scripts/audit.ts            # full report
bun scripts/audit.ts --changes  # only what changed
bun scripts/score.ts            # PRs that wait for your confidence judgement
```

`--json` prints the same data as JSON. `--no-jev` skips Jev.

## Read the output

- **Groups** come from deterministic GitHub facts: conflicts, CI, review
  decision, Trunk, and threads where the last reply is not the author's. PRs
  into forks are hidden.
- **Confidence** is your judgement of how safe the merge is. No gateway model
  makes it. You read the change: the diff (a bounded excerpt for a large PR),
  the changed files, the title, and the description. You judge the blast
  radius, whether users see the change, and how likely and how bad a breakage
  is. The line gives the level (high, medium, or low), the concrete risk, and
  the areas. The judgement is cached per head SHA, so only a new push needs a
  new judgement. `unscored` means that nobody judged the current head yet.
  Drafts stay unscored until they are ready for review. Low confidence on a PR
  in "Ready to merge" is news.
- **Jev hints** are probabilities from a small judgement model. They are
  input, not verdicts. Overrule a hint when the thread text says otherwise.
- **Judge** lines are questions that no rule or model answered. They appear
  when Jev was unavailable for that PR.
- **Signals** flag drift: "Modernize candidate" means no push for 14 days.
- **Changes** compares with the previous run of the script, from any session.

Jev is the only model that the script calls, through the Vercel AI Gateway.
It needs an AI Gateway key. The script reads `AI_GATEWAY_API_KEY`, else the
key file, else the macOS Keychain cache. When `AUDIT_PRS_OP_REF` holds a
1Password secret reference, such as `op://<vault>/<item>/<field>`, and the
`op` CLI is installed, the script asks 1Password once for it and caches the
key in the macOS Keychain for 12 hours. If nobody approves within 45 seconds,
the audit continues without Jev. `AUDIT_PRS_OP_REF` has no default. Without a
key, the audit runs without Jev.

The key file is `~/.config/audit-prs/ai-gateway-key`, or the path in
`AUDIT_PRS_KEY_FILE`. The script ignores it unless only its owner can read it.
Use it on machines without a Keychain or 1Password. The author stores the key;
never write it yourself or print it:

```sh
mkdir -p -m 700 ~/.config/audit-prs
(umask 077; read -rs k && printf '%s' "$k" > ~/.config/audit-prs/ai-gateway-key)
```

## Steps

1. **Run.** Run the full report on the first audit in a session, also in a
   watch. Use `--changes` on each later watch run in the same session. Done
   when the script exits 0. On an error, report the error line. In a watch,
   continue at step 8, else stop.
2. **Quiet check.** On a `--changes` run, if the output says "No changes
   since" and the header says that 0 PRs wait for your judgement, link the
   PRs as step 5 says and reply with the "No changes" line. In a watch,
   continue at step 8, else stop.
3. **Score.** Run `score.ts` without arguments. It lists the PRs that wait
   for your merge confidence judgement. Judge "Ready to merge" first. Brief a
   few PRs at a time, because one brief holds up to 40k characters of diff:
   `score.ts <id> <id> <id>`. The output starts with the rubric. Follow it,
   then record one JSON judgement per PR with `score.ts --record <id>` and the
   JSON on stdin, as the rubric shows. Judge the change yourself. Do not send
   it to another model or service. When many PRs wait, you can give batches to
   subagents that use your own model. Done when `score.ts` prints "No PR waits
   for a judgement". Use your recorded levels and risks in the report.
4. **Judge.** For each `Judge:` line on a PR in "Blocked", "Changes
   requested", or "Ready to merge", read the threads with
   `gh pr view <url> --comments` and answer the question. Done when every such
   line has an answer. Leave the other groups to the hints.
5. **Link.** When a tool attaches PRs to this thread or session, such as
   `link_pull_request`, call it for every open PR in the audit, not only the
   changed ones. A `--changes` run prints only the changed PRs. Read the full
   list from the snapshot of the last run, which the script writes to
   `~/.cache/audit-prs/last.json` (or `$AUDIT_PRS_CACHE/last.json`):
   `jq -r '.. | objects | .url? // empty' <file> | grep /pull/ | sort -u`.
   Do not run the script again to get the list, because each run moves the
   change baseline. Linking a PR that is already linked is safe. Done when
   each PR is linked. Name each PR that failed to link in the report.
6. **Report.** Start with the PRs that need the author, then modernize
   candidates, then PRs that wait for others. Put a PR in "Ready to merge"
   with low confidence first, with its risk. One line per PR: the PR number,
   the next action, and the confidence with its risk when it is not high. On
   a `--changes` run, report only the changed PRs. Write each PR number as an
   embedded Markdown link, `[#<number>](<url>)`. Take the URL from the audit
   output. Never write a bare `#<number>`. This rule also applies to PR
   numbers in risk and reason text, for example "merge it before
   [#123](https://github.com/acme/app/pull/123)".
7. **Act.** Do this step only when the author asked you to act, in this prompt
   or in the prompt that started the watch. Otherwise offer it in one line. Dispatch one subagent
   per PR, each in its own worktree:
   - Failing CI, review threads, or bot findings: the `babysit-pr` skill.
   - Conflicts or a modernize candidate: the `modernize-pr` skill.
   Give each subagent the PR's confidence line. When the confidence is low,
   the subagent checks the named risk first, for example with a test that
   covers it. A PR in "Ready to merge" with low or unscored confidence waits
   for the author: give the risk and ask before a merge. Subagents reply to
   the bot findings they fixed. They return every other comment as a draft,
   and you ask the author to approve each one before it goes out, as the
   `leaving-pr-comments` skill says. Collect one
   summary per PR. Done when each dispatched PR has a summary.
8. **Wait.** Do this step only in a watch. As your last action, start the
   timer: a Monitor task that runs `sleep <interval in seconds>`, with
   `timeout_ms` set to the interval. Done when the timer runs.

## Watch

Start a watch with `/audit-prs watch [interval]`, for example
`/audit-prs watch 15m`. The default interval is 30 minutes, which is also the
longest interval a Monitor task can run. A watch runs the steps, then waits
for the interval in a Monitor task. When the task ends, the harness wakes you.
Then run the steps again. The notification that the timer ended is your
signal for the next run. It is not input from the author.

- Use a Monitor task as the timer. Do not use a Bash command with
  `run_in_background`, `/loop`, cron jobs, or scheduled wakeups. T3 Code
  keeps the thread on the Working shelf while a Monitor task runs. It returns
  the thread to the inbox for a background shell and does not track cron
  jobs.
- Keep one timer. Before you start a timer, stop the earlier timer of this
  watch with TaskStop if it still runs.
- When the author tells you to stop the watch, stop the timer with TaskStop
  and do not start a new one.
- The first run in the session gives the full report. Later runs give only
  the changes. Every run of the script moves the change baseline, so an audit
  in another session hides those changes from the watch.

## Related skills

- For a Slack update about these PRs, use the `slack-pr-update` skill.
