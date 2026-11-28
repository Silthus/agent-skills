# Merge-risk rules

Grade the PR with the `merge-risk` skill and with these rules. Where a rule
here is stricter than `merge-risk`, the rule here sets the verdict or the
grade. The proof judge of `hedge proof gate` grades with both files.

## Evidence

Grade what HEAD does that the base does not, for the PR's own increment: in
a stack, against its parent PR. Grade again from the diff on every run. An
earlier grade, from a panel, a lens, an old body, or a thread, is a claim to
check. Harm the base already caused is no gap.

For Impact, look where a symbol search stops: a stored or wire format, a
database column, an API's JSON, another language that reads the same bytes,
a feature flag, a consumer in another repository, the source of a pinned
library. A **flag-off hunk** is changed code that runs with the flag off,
such as an else branch or shared code the flagged work changed. It is live on
deploy for everyone the flag excludes.

Impact small ✅ and Verification good ✅ each need the **safety fact**: the one
fact the change is safe because of. Say how far you proved it:

1. You said so.
2. You pointed at the line.
3. You walked the failure, and it does not reach.
4. You ran real code that fails when the fact is wrong.
5. You reproduced it in the running app.

Impact small ✅ needs step 3 or higher. When the diff changes behavior,
Verification good ✅ needs step 4 or higher, from a run whose output is
saved, such as a proof the receipt holds. A test that mocks the changed code
proves nothing. To claim that behavior or cost is unchanged, run the same
input on the base and at HEAD. Write the fact as the first Verification
bullet, `Safe because: <fact> (step <n>)`. It is not a gap bullet. When the
fact stays below its step, the verdict is 👀 at best, and the bullet reads
`Unproven: <fact>; check: <cheapest check>`. Each gap names a path that real
input reaches. Leave cleared risks out.

## Grade floors

Apply these after the weighted score of `merge-risk`. They only raise the
grade:

- Any ⚠️ verdict makes the grade at least medium.
- Impact large ⚠️ with Verification poor ⚠️ makes it high.

## Door

Judge Rollback cost by the cost to undo after the switch-off, never against
`git revert`. A **one-way door** leaves something that no later PR can take
back without harm: lost or rewritten data, a message sent to people, a
contract that callers outside the repository already use, or a stored format
the base cannot read. Rollback cost high ⚠️ means a one-way door, and only
that: a change that is costly but reversible is medium 👀. Name what we commit
to in the Rollback cost bullet `one-way door: <what we commit to>`. An
additive schema change is two-way: name what stays and the follow-up that
removes it. A door that is two-way at merge and turns one-way on a later
event, such as an SDK release, names that event in a Rollback cost bullet.

## Tier

The **tier** says who decides the PR's asks, under the user's agent
instructions. A PR is **critical** when any criterion holds:

- (a) the diff touches a critical path that the user's agent instructions
  list for the repo. A diff whose every file is a test or fixture that no
  production code imports does not touch one by its path alone;
- (b) the grade is high;
- (c) the door is one-way;
- (d) it adds a migration;
- (e) it changes auth, permissions, or infra;
- (f) it makes an irreversible public release, such as an SDK publish;
- (g) it sends something to people outside the team.

A repo with no critical-path list uses (b) to (g). Every other PR is
**non-critical**. Set the tier again on every run, with the grade. Write it
as `**Tier:** critical (a: <path>; d)` or `**Tier:** non-critical`.

## Danger areas

Hunks that touch authentication, permissions, secrets or crypto, billing or
real sends to customers, PII, migrations or schema, destructive writes, data
ingestion, locking or concurrency, public API contracts, dependencies, or
deploy, infra, and CI configuration. Read each danger hunk first, with its
callers. A danger area marks where to look and what a person approves; it
sets no grade of its own.
