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
run. The `babysit-pr` skill runs it after the deploy.

Compare the touched area's error tracking, logs, and metrics after the deploy
with the same window before it, at one hour and at 24 hours, in the project
the user's agent instructions name. A new error group, or a rate that moves
past the baseline's noise, is a finding: report it with a drafted revert.

Done when both checks ran and their results are saved.

## Gaps

A **gap** is an owed proof that could not run. It names the proof, the reason,
and what stays unknown. A gap is a decision for the user, so the handoff stays
Blocked until the user accepts it. The user's agent instructions may already
name a gap, such as a proof that waits for access.

## Record

When the `fleet` CLI is available (on `PATH` or at `~/dev/fleet/fleet`), the
proof storage enforces this file:

- `fleet proof require --repo <owner/repo> --pr <number> --commit <full SHA> --kinds <kinds>`
  records the owed kinds: `live-run`, `prod-shape`, `cross-version`,
  `shadow-diff`, `post-deploy-watch`.
- `fleet proof save ... --kind <kind> <files>` saves a proof's evidence.
- `fleet proof gap ... --kind <kind> --reason "<reason>"` records a gap, and
  `--accept "<the user's words>"` records the user's acceptance.
- `fleet proof gate ...` exits 0 when every owed proof has evidence or an
  accepted gap and HEAD is reviewed. Add `--landed` after the merge.

Otherwise, keep the owed kinds, evidence paths, and gaps in the ledger.
