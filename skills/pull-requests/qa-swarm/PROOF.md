# Proof

A **proof** is behavior you ran and watched where users and callers meet the
change. A test suite proves the code its tests reach; a proof shows the change
working in the running system, on the data it will meet. A PR owes each proof
whose condition below holds, and each owed proof ends in saved evidence or a
gap.

## Kinds

### Live run

Owed by every PR that changes runtime behavior.

Start the app or service stack and trigger the changed path the way a user or
caller does: a click, an API request, an event, a scheduled job. Call a sandbox
of each real third party the path reaches: one that the user's agent
instructions list, or a private scratch account you create and name. Run the
path twice: once with data the base code already wrote, such as an existing
destination or a stored config, and once with data HEAD creates.

Done when the run's output (requests and responses, log lines, captures) is
saved for HEAD's behavior.

### UI walk

Owed by every PR that changes a browser UI: a screen, a component, or its
copy.

Serve HEAD as a production build on seeded demo data, on a remote workspace
with the `share-preview` skill. A Storybook story or a single rendered state
shows appearance only. In a browser signed in to the preview, walk every stage of the changed
journey from entry to result and take a screenshot of each stage. Walk copy
or controls that depend on state twice: on data that has the state and on
data that lacks it, such as a project with a verified sender and one
without. When the ticket carries an element checklist from an accepted
prototype, put each screen beside the prototype's screenshot of it and tick
every `build` row the walk shows. A `build` row the walk lacks is a finding
until the user's words re-mark it `later` or `cut`.

Done when every stage, both sides of every state-dependent stage, and every
`build` row have a screenshot of HEAD.

### Prod shape

Owed when the changed path reads persisted inputs: stored rows,
customer-written code or config, queued jobs, cached values.

List each persisted input. For each one, measure in production which share of
the stored records takes each branch the change touches, through read-only
access such as PostHog's `querying-production-databases-via-metabase` skill.
The measurements stay in the private proof storage. The PR carries only the
conclusion, such as "every stored config takes the new branch", unless the
numbers are already public. Write test fixtures from the list of properties
the shape needs, with invented values.

Done when every persisted input has its measured branch shares, or a gap.

### Cross-version

Owed when a value crosses a process or deploy boundary in a format the change
alters: queue payloads, cache entries, signed or encoded values, rows another
service reads.

Produce the value with the base code and consume it with HEAD, then the
reverse. Keep the base-built value as a test fixture, so the check stays
automated after the merge.

Done when both directions ran and their results are saved, including a failure
the PR accepts.

### Shadow diff

Owed when the merge risk is high, or when the goal keeps behavior unchanged:
a refactor, a hardening, an upgrade.

Run the base code and HEAD over the same inputs, prod-shaped ones when a Prod
shape proof exists, and diff their outputs. Each difference is either named by
the goal or a finding.

Done when the diff is saved and every difference is classified.

### Post-deploy watch

Owed by every merged PR that changes runtime behavior, the condition of Live
run. The `rollout` skill runs it after the deploy.

Compare the touched area's error tracking, logs, and metrics with the flag
on against off, or after the deploy against before it, in the project the
user's agent instructions name, at the checks `rollout` schedules. A finding
follows the thresholds and steps in `rollout`.

Done when the checks `rollout` schedules ran and their results are saved.

## Gaps

A **gap** is an owed proof that could not run. It names the proof, the reason,
and what stays unknown. Who accepts it follows the PR's tier, from the `Tier:`
line of its `merge-risk` callout:

- **Non-critical**: accept the gap yourself, with your reason and the option
  you rejected, except a `panel` gap.
- **Critical**: accept only `judge` and `post-deploy-watch` gaps yourself.
- **Ungraded**: grade the PR with `merge-risk` first.

Every other gap is a Decision for the user, and the handoff stays Blocked
until the user accepts it in answer to that gap. Fix a failing required CI
check; a gap never covers it. A proof the user named stays owed at any tier:
record their words with `--keep-owed`. Before you ask, look the gap up with
`fleet decision list --pr <owner/repo#n> --live`: a live decision in scope
answers it. When a head turns the PR critical, your own acceptances on it
lapse; decide or ask again. The user's agent instructions may hold a standing
rule that accepts every gap of one kind; that rule is the acceptance,
recorded as a standing rule, never as the user's words.

## Record

When the `fleet` CLI is available (on `PATH` or at `~/dev/fleet/fleet`), the
proof storage enforces this file:

- `fleet proof require --repo <owner/repo> --pr <number> --commit <full SHA> --kinds <kinds>`
  records the owed kinds: `live-run`, `ui-walk`, `prod-shape`,
  `cross-version`, `shadow-diff`, `post-deploy-watch`. A PR whose conditions
  above all fail records `--none --reason "<why>"` instead.
- `fleet proof run [--repo <owner/repo> --pr <number>] --kind <kind> -- <command> [argument...]`
  runs a shell proof on the local HEAD and saves its output as evidence. It
  takes no `--commit`, and `ui-walk` takes no runs. The judge marks its files
  as captured by the Fleet runner, so use it for every proof a command can
  show. Commit first: it refuses modified files and untracked files that Git
  does not ignore. It saves only a run that exits 0 with text output while
  HEAD and the tree stay unchanged.
  The runner uses no shell, but your shell still splits the line at an
  unquoted `|`, `&&`, `;` or `>`, and expands an unquoted `~`, `$VAR` or glob
  first. Put anything that needs a shell in one quoted argument:
  `sh -c '<commands>'`. When the proof expects the command to fail, print its
  status so the run exits 0 and saves: `sh -c '<command>; echo "exit=$?"'`.
  On a worktree with a worktree box, such as a PostHog worktree, run the
  command on the box, so its mirror check lands in the evidence. Use the same
  `fleet` path for both calls:
  `~/dev/fleet/fleet proof run --kind live-run -- ~/dev/fleet/fleet worktree-box run -- '<command>'`.
- `fleet proof save ... --kind <kind> <files>` saves what the runner cannot
  capture, such as screenshots, binary output, MCP results, and notes, as
  evidence for HEAD, and takes only screenshots for `ui-walk`. Evidence proves
  its own commit; after a new commit, run or save new evidence, or record
  `--reuse-from <sha> --reason "<why it still proves HEAD>"`.
- For the proof receipt, give each kind one line of what ran and one of what
  it showed: `fleet proof save ... --kind <kind> --ran '<what ran>' --result '<what it showed>'`,
  with its files or, after `fleet proof run`, without files. Save each
  screenshot with its own caption:
  `fleet proof save ... --kind ui-walk --caption '<what it shows>' <screenshot>`.
  The receipt lists screenshots in the order of their first caption. The body
  is public: the receipt refuses a number of four or more digits, a
  percentage, a thousands separator, an email address, or an HTML entity in
  these lines, in gap reasons, and in not-checked items. Put such detail in
  notes saved as Markdown evidence, which show only in the team-visible full
  receipt.
- `fleet proof respond ... --round <number> <responses.md>` saves your answers
  to a review round. Write one numbered item per finding, in the findings'
  order, that starts with `fixed` or `rejected`: `1. fixed in <sha>: <how>`,
  `2. rejected: <why>`. The receipt counts only that format; any other answer
  shows as written and counts as unknown.
- `fleet proof gap ... --kind <kind> --reason "<reason>"` records a gap's
  reason; run it again to change the reason. Record your own acceptance with
  `fleet decision record --mark 🤖 --class proof-gap --kind <kind> --pr <owner/repo#n> --question '<q>' --answer '<a>' --rejected '<option>' --reason '<why>'`,
  and the user's with
  `fleet decision record --mark 👤 --words '<date> "<their words>"' --thread <T3 thread id> --class proof-gap --kind <kind> --pr <owner/repo#n>`,
  with `--mark 👍` when they picked your recommendation, one `--pr` for each
  PR the answer covers, and `--keep-owed` for a proof they named.
  The quoted words must be in a message the user typed in that thread, or in
  their answer to a question tool, and that question names every PR the
  answer covers. A standing rule of the agent instructions is recorded once
  with
  `fleet proof standing --kind <kind> --until <date> --rule "<the rule, word for word>"`.
- `fleet proof gate ...` exits 0 when the owed proofs are recorded, each has
  evidence or an accepted gap, HEAD is reviewed, CI on HEAD is green or has an
  accepted `ci` gap, and then the **judge** passes HEAD. The judge is the
  other model family: it weighs the evidence, the owed kinds, the review and
  its responses, and the code against the user's coding preferences. A failed
  question or a high quality finding fails the gate. Add `--landed` after the
  merge. A handoff reports the lane gate and CI first.

Otherwise, keep the owed kinds, evidence paths, and gaps in the ledger.
