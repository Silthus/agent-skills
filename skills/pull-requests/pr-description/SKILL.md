---
name: pr-description
description: >-
  Add the merge-risk callout, the Impact section, owed proofs, and decision
  lines to a PR description. Use alongside a repository's own description
  skill, such as `writing-pr-descriptions`, before `gh pr create` or
  `gh pr edit --body`, and when work continues on a PR: a follow-up
  request, review fixes, or a rebase.
metadata:
  credits:
    - skill: pr
      author: Matt Pocock
      license: MIT
      url: "https://github.com/mattpocock/skills"
    - skill: show-me
      author: Dex Horthy
      organisation: Humanlayer
      url: "https://github.com/humanlayer/skills/blob/main/plugins/show-me/skills/show-me/SKILL.md"
---

This skill adds four **inserts** to a PR body. The repository's own
description skill and PR template shape everything else: sections, prose,
media, and length. The inserts go in on top of that body, never in place of
it.

## Steps

1. Read the diff, the live body (`gh pr view <n> --json body --jq .body`),
   the repository instructions, and its PR template. Write the body with the
   repository's description skill when it has one. When it has neither a
   description skill nor a template, write it as
   [full body](references/full-body.md) says.
2. Add each insert below in the place it names. Edit the live body, and keep
   every image, link, ticked box, and note it already holds.
3. Push the body and read it back. Done when the live body holds the
   merge-risk block, the Impact section unless `impact` leaves it out, a
   line for each owed proof, and the latest decision line for every decided
   question.

Each time work continues on the PR, refresh the inserts in the same edit as
the rest of the body.

## Merge risk

Grade the PR with the `merge-risk` skill. It writes the callout, and its
Rollout section when the grade calls for one, after the problem and its
Impact section. The block stays when the repository's skill sets a word
budget: a reviewer reads it first. Its `<!-- merge-risk -->` markers are not
template comments; keep them.

## Impact

Write the Impact section right after the problem, with the `impact` skill
when it is installed. It links the insight that shows, 14 days after
deploy, whether this change worked. Leave the section out when the skill
says so, as it does for most fixes.

A PR from a Wayfinder map copies the map's Impact section and narrows it to
this change. Pushback happened while the map was charted, so ask nothing.
When the map is private and this repository is public, everything copied
from the map, its Impact section and its decision lines alike, keeps only
public context: the numbers, customer data, and internal findings stay on
the map.

## Proof

When the work ran proofs per [`PROOF.md`](../qa-swarm/PROOF.md) of the
`qa-swarm` skill, list each owed proof with its evidence link or its gap,
in the template's testing section. Link the evidence beside each line that
`fleet proof gate` passes. Report CI the way the repository's skill says.

Store proof files outside the checkout, so they outlive the worktree. When
the `fleet` CLI is available (on `PATH` or at `~/dev/fleet/fleet`), save
them with
`fleet proof save --repo <owner/repo> --pr <number> --commit <full SHA> <files>`.
When the repository's skill names no upload route for images and videos,
use [Upload media](references/ui-evidence.md#upload-media).

## Decisions

Add a Decisions table: one row per decision a reviewer or a future reader
needs. That is each load-bearing decision or call that
[qa-swarm triage](../qa-swarm/TRIAGE.md) defines, and each decision that
changes an earlier decision line. Mechanical choices and rows per ticket or
slice stay out. The table has the columns Question, Answer, Who, and Where,
sorted 👤, 👍, 🤖:

- **Question**: the question the decision settled, in a few words.
- **Answer**: one clause. When the user changed the recommendation, name
  what it replaced.
- **Who**:
  - 👤 Human: the user asked for new scope, chose without a recommendation,
    picked another option, changed the recommendation, accepted a draft
    only after feedback that changed it, or set a standing instruction that
    decides it.
  - 👍 Accepted default: the user read the agent's recommendation and
    accepted it as written. When the user asks for new scope and accepts
    the agent's scoping of it as written, record two questions: the ask as
    👤 and the scoping as 👍.
  - 🤖 Agent: the agent decided without asking.
- **Where**: a link to the comment that holds the decision and its details.

Record each decision where it is made, in the ticket's handoff comment or
the map, as a **decision line**: `- <mark> **<question>** <answer>`.
Decisions made in the agent session or a review round, with no ticket
comment or map to hold them, go into one PR comment: the
`leaving-pr-comments` callout, then the decision lines. On the user's own
PR, post it, and each edit that adds or replaces a line, without asking; on
anyone else's PR, after the user approves it. The row's Where links to the
comment, or reads `pending approval` until it is posted. A later line for
the same question replaces the earlier one, and its row replaces the
earlier row.

When the `fleet` CLI is available, `fleet decisions <map URL>` collects a
Wayfinder map's decision lines into the table; add the rows for the PR
comment's lines. A decision without a line gets one in the PR comment,
classified from its transcript. A PR with no row keeps one line instead:
`No load-bearing decisions.`

Put the table and one **Involvement** line under it inside the template's
collapsed agent-context block when it has one; otherwise in a Decisions
section after the evidence. The Involvement line names the grilling rounds
answered, the prototypes iterated with their round counts, the reviews run
(panel lanes and bots), and whether proof was captured. It carries no
numbers beyond those counts.

A question put to the user without an answer is open, not a decision. List
it on an **Open** line with the recommendation, outside any collapsed
block, at the end of the changes. It blocks the PR until the user answers.
