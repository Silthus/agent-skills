---
name: stamp-pr
description: Trigger this if the user says 'stamp it'.
---

# Stamp PR

"Stamp it" is `full-send` with the repo's approval bot in place of a
teammate's review. Read [full-send](../full-send/SKILL.md) and follow it. A
"stamp it" request grants everything full-send grants. The rules below take
precedence.

The user's agent instructions name the approval bot and the label that asks
for it, such as StampHog and the `stamphog` label. If they name none, tell the
user and continue as full-send.

## Qualify

The user's "stamp it" is their risk call, and the approval bot makes its own.
Grade the PR with `merge-risk` for its description as full-send does, but do
not hold the stamp for its grade, its door, its size, or its shape. Under
"stamp it", full-send's question before merging a high or one-way PR does not
apply.

Refuse a stamp only for a hunk in a danger area: the
[danger areas of merge-risk](../merge-risk/SKILL.md#danger-areas), with the
areas the user's agent instructions add to them or keep for teammates. A
person approves those.

Check before you start, and again on the final diff. When a hunk falls in a
danger area, do not stamp. Ask the user, naming the hunk and its area, with
full-send as the recommended option.

## Stamp

Replace full-send's step 6:

1. Mark the PR ready for review. Babysit it until the required checks are
   green and every bot finding is fixed or answered. The approval bot refuses
   a PR with an unresolved concern or a review still running.
2. Add the label.
3. Wait for the verdict with the watcher.
   - **Approved:** continue at full-send's step 7.
   - **Refused for a concrete issue:** fix it the smallest way, prove the fix,
     push, and request the stamp once more: remove the label and add it again.
   - **Refused again, or without a concrete issue:** stop stamping. Continue
     as full-send with a teammate's review, and say why in the report.
