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

Teammates review larger changes so the team keeps sharing what changes. Stamp
only a PR that is all of these:

- `merge-risk` grades it low, and it is a two-way door.
- At most 400 changed production lines.
- Standalone: not a layer of a stack, and not from a map.
- No change in product behavior that the team should see.
- Outside the paths that the user's agent instructions keep for teammates.
- No hunk in authentication, permissions, secrets or crypto, billing, CI or
  deploy configuration, release workflows, or installers, whatever its grade.
  A person approves the code that controls who gets in, what is charged, and
  what ships.

Check before you start, and again on the final diff. If the PR does not
qualify, do not stamp it. Ask the user, naming the rule that failed, with
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
