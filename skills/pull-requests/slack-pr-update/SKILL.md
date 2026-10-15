---
name: slack-pr-update
description: >-
  Format Slack PR updates, PR lists, and review or merge handoffs. Use when
  the user asks to write an update, says "give me an update" about development
  work, asks for their open PRs, or needs a PR ready-for-review message.
---

# Slack PR update

1. **Inventory.** Limit it to upstream repositories. Exclude PRs whose target repository is a fork.
   A PR from the user's fork into an upstream repository is an upstream PR and stays in scope.
   Collect the open PRs, and the PRs merged in the update window: the window the user names, else the time since their last update, else the last 7 days. State the window you used.
   Check each open PR's draft status, reviews, conflicts, dependencies, stack parents, and required CI runs.
   When the repository uses the Trunk merge queue, read the Trunk merge comment and verify every merge check it lists.
   Separate passing checks from CI that needs maintainer approval.
   If a check is unavailable, state what is unknown.
   Done when every PR has exactly one section from the table below.
2. **Sort** each PR into one section. A PR sits in the first section whose rule it meets.

   | Section | Rule |
   | --- | --- |
   | Shipped | Merged in the update window. |
   | Ready to merge | Not a draft, current required approval, green required CI, every merge-queue check satisfied, no conflict, dependency, or other blocker. Unknown checks do not qualify. An approved PR that waits only for CI authorization qualifies, with a CI ack note. |
   | Ready for review | Not a draft, no conflict or failing check that needs work, still needs review approval. Note pending CI authorization in the section header. |
   | Work in progress | Every GitHub draft, and any other PR with unresolved findings, conflicts, a running rebase, or failing checks that need work. |

   An approval on a closed predecessor or a dismissed approval does not count as current approval.
   A stack moves as one unit and sits in the section of its least ready PR: it reaches Ready for review only when every PR in it is out of draft, and Ready to merge only when every PR qualifies.
   **Next** is not a PR section. Fill it with what the user names, else the open follow-ups from active threads and maps, and ask the user when neither exists.
3. **Group** inside each section, by theme first, then by stack.
   - A theme is the area a colleague recognizes, such as Billing, Onboarding, Search, or Developer tooling.
   - A stack, or a set of PRs that build one feature together, becomes one line: what the set delivers, then its PR links in merge order.
   - A theme with one line folds onto its theme bullet: `Theme: <what changed> ([#n](<link>))`.
   - Small unrelated fixes in one theme collapse into one line: `Smaller fixes, e.g. <fix>, <fix>, <fix> (<links>)`.
   Done when no theme repeats within a section and no stack is split across lines.
4. **Write** each line as what a person can now do or see, in plain words, then the linked PR numbers in parentheses.
   Keep the link text as the PR number: `[#1234](<link>)`. Name the repository only when the number is ambiguous: `[sdk-js#56](<link>)`.
   Add a short dependency or next action only when a colleague needs it.
5. **Route** lines to copy-ready channel blocks.
   Use one independent message block per destination and put the linked channel above it.
   A block carries only its own sections and enough context for that team.
   Route PRs to the team channels the user names: in the request, in their agent instructions, or in `~/.config/slack-pr-update/channels.md` when that file exists.
   Each line of that file names the areas and the channel with its link, for example `Search, parsing: [#team-search](<channel link>)`.
   Keep other PRs in the channel the user named or linked in the request.
   A cross-team PR can appear in more than one block, once per block.
6. **The user's list.** After the message blocks, list what needs the user: drafts to validate or mark ready, other work in progress, and PRs with a next action.
   Start each entry with the linked PR number and state the exact next action, including validation steps when known.
   Briefly check related local Claude Code and Codex session logs for this work.
   Match the owning session by PR, branch, and working directory. Ignore incidental mentions in inventory sessions.
   Report whether work is active, idle and resumable, completed, or unknown, with a session ID or verified resume command when available.
   Recent log activity alone does not prove a session is active. Use process or session state when available and state uncertainty.
   Keep session details in the user's list. Inspect logs without resuming sessions or changing PRs.
7. **Edit** the draft with the `unslop` skill when it is installed, preserving this format and these emoji names.
   Return the message inline as rendered Markdown, outside a code block. The user copies the rendered text, so Slack keeps the bold headers, nested bullets, and links.
   Omit empty sections unless the user asks for the full legend.

## Format

Bold section headers, two-level bullets (the theme on top, its lines nested under it), and a spacer after every section.
The spacer is a line holding only `&nbsp;`. A plain blank line disappears when the user copies the rendered text, and the spacer keeps one empty line between sections in Slack.

For [#channel](<channel-link>):

**Shipped** :white_check_mark:

- <Theme>:
  - <What a stack delivers> ([#n](<link>), [#n](<link>), [#n](<link>))
  - <What one PR does> ([#n](<link>))
  - Smaller fixes, e.g. <fix>, <fix>, <fix> ([#n](<link>), [#n](<link>), [#n](<link>))
- <Theme>: <what one PR does> ([#n](<link>))

&nbsp;

**Ready to merge** :pr-open:

- <Theme>: <what one PR does> ([#n](<link>)), needs a CI ack

&nbsp;

**Ready for review** :review: *(please ack CI runs as well)*

- <Theme>:
  - <What one PR does> ([#n](<link>))
  - <What a stack delivers> ([#n](<link>), [#n](<link>))

&nbsp;

**Work in progress** :pr-draft: *(not ready yet, just fyi)*

- <Theme>:
  - <What a stack delivers> ([#n](<link>), [#n](<link>), [#n](<link>))
  - <What one PR does> ([#n](<link>)), <what is left>

&nbsp;

**Next** :arrow_right:

- <Theme>: <the next piece of work> ([draft](<link>))

&nbsp;

Keep the update concise and use no em dashes.
Draft the message in the conversation; sending it or changing PR state requires a separate instruction.
