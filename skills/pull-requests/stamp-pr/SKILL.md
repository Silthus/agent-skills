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

## Other teams' code

A stamp can merge another team's code without that team knowing. Find the
owner of every changed path where the user's agent instructions say ownership
is recorded, else in the repository's `CODEOWNERS`. A path with no recorded
owner needs no check.

When a hunk belongs to a team other than the user's, hold the stamp and ask
the user. Name each such hunk and the team that owns it. Ask again for every
PR, and again when the final diff adds a team. One answer never covers the
next PR. The options:

- **Stamp and inform them:** stamp as below. Before you merge, draft a Slack
  message to that team's channel. Say in one or two sentences what the PR
  changes in their code and why, and link the PR.
- **Ask them to review:** do not stamp. Draft a review request to that team's
  channel with `slack-pr-update`, then continue as full-send and wait for an
  approval from someone on that team.

Write each message as an unsent Slack draft for the user to send. If you
cannot make a draft, put the text in your report. The user's agent
instructions name the user's team and each team's channel. If no channel is
known for a team, ask the user.

## Stamp

Replace full-send's step 6:

1. Mark the PR ready for review. Babysit it until the required checks are
   green and every bot finding is fixed or answered. The approval bot refuses
   a PR with an unresolved concern or a review still running.
2. Add the label.
3. Wait for the verdict with the watcher.
   - **Approved:** continue at full-send's step 7. The bot's approval does
     not clear a **person's comment**: one the user has not answered still
     holds the merge, per full-send's merge gate.
   - **Refused for a concrete issue:** fix it the smallest way, prove the fix,
     push, and request the stamp once more: remove the label and add it again.
   - **Refused again, or without a concrete issue:** stop stamping. Continue
     as full-send with a teammate's review, and say why in the report. When
     the user's PR workflow has a rule for a PR that waits on a person, start
     it now.

For a stack, take the base in one pass right before you ask for the stamps,
per **Base branch** in `babysit-pr`; after that, update only for a conflict,
because each update dismisses the stamps. Merge the **approved bottom** as
soon as it is stamped, per `rollout`: the layers from the base up that are
stamped, green, and safe to deploy without the layers above. The rest merges
the same way once stamped.
