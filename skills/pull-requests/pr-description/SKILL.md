---
name: pr-description
description: >-
  Write or refresh a PR description with the problem first, a merge-risk
  callout, and proof beside each behavior. Use when opening a PR, editing a
  PR body, or updating its evidence after a fix or rebase.
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

## Steps

1. Read the diff, the existing PR body, the repository instructions, and its
   PR template. When the repository requires its own description skill, use
   it. Its section structure, QA, media, and publication rules win.
2. Write the prose with the `writing-voice` skill when it is installed, and
   the risk callout with the `merge-risk` skill. Put the callout after the
   problem and its Impact section, within the repository's section
   structure.
3. State the user problem and the resulting behavior in one or two
   sentences. Describe the final implementation. Use the domain terms from
   `GLOSSARY.md` when it exists.
4. Write the Impact section with the `impact` skill when it is installed,
   right after the problem: the metric this change moves and where we see
   it. A PR from a Wayfinder map copies the map's Impact section, narrowed
   to this change. The map already settled pushback, so ask nothing.
5. Prove the change works, and put each proof beside the behavior it
   demonstrates:
   - **Screenshots**: one per changed feature, view, and state. For a change
     without a UI, show the observed command or API output.
   - **Recording**: a short video of the main journey when a larger feature
     has several steps. When the runtime cannot record, name the missing
     video as a gap.
   - **Flow diagram**: only when the change alters how calls or data flow
     between modules.

   For UI changes, read [UI evidence](references/ui-evidence.md) to
   capture, caption, and refresh media. For a flow diagram, read
   [implementation views](references/implementation-views.md).
6. Name the test seams, the checks you ran, and the material gaps. When the
   work ran proofs per [`PROOF.md`](../qa-swarm/PROOF.md) of the `qa-swarm`
   skill, list each owed proof with its evidence or its gap. Add a
   verification command and its expected result when it helps a reviewer
   reproduce the behavior. Put long output and process history in a
   collapsed block or in proof storage.
7. Add a Decisions block: one row per load-bearing decision or call that
   [qa-swarm triage](../qa-swarm/TRIAGE.md) defines, never one row per
   ticket or slice. Mechanical choices stay out. The table has the columns
   Question, Answer, Who, and Where, sorted 👤, 👍, 🤖:
   - **Question**: the question the decision settled, in a few words.
   - **Answer**: one clause. When the user changed the recommendation, name
     what it replaced.
   - **Who**:
     - 👤 Human: the user chose without a recommendation, picked another
       option, changed the recommendation, accepted a draft only after
       feedback that changed it, or set a standing instruction that decides
       it.
     - 👍 Accepted default: the user read the agent's recommendation and
       accepted it as written.
     - 🤖 Agent: the agent decided without asking.
   - **Where**: a link to the comment that holds the decision and its
     details.

   Record each decision where it is made, in the ticket's handoff comment
   or the map, as a **decision line**:
   `- <mark> **<question>** <answer>`. A later line for the same question
   replaces the earlier one.

   A question put to the user without an answer is open, not a decision:
   list it on an **Open** line under the table with the recommendation. It
   blocks the PR until the user answers. Then one **Involvement** line: the
   grilling rounds answered, the prototypes iterated with their round
   counts, the reviews run (panel lanes and bots), and whether proof was
   captured. It carries no numbers beyond those counts.

   When the `fleet` CLI is available (on `PATH` or at
   `~/dev/fleet/fleet`), `fleet decisions <map URL>` collects a Wayfinder
   map's decision lines into the table. Classify a decision without a line
   from its transcript. A PR without such a decision keeps one line:
   `No load-bearing decisions.`
   When the repository template has an agent-context section, put the block
   under its autonomy line. Otherwise, make it its own section after
   Evidence.

Done when the problem and resulting behavior are clear without the diff,
the Impact section names its metric, unless `impact` is missing or exempts
the work,
each consequential claim has supporting evidence or an explicit gap, every
load-bearing decision names who made it, every unanswered question is on
the Open line, and the description follows the
repository's template.

## Default structure

Use this structure when the repository has no required template:

```markdown
## Problem

<the user problem and the issue it closes>

## Impact

<the impact line, per the `impact` skill>

## Merge Danger

<merge-risk callout>

## Summary

<the resulting behavior, with captioned media for UI changes>

## Evidence

- <what was exercised and the observed result>
- Test seams: <the public behavior the tests drive>
- Verify: <command and expected result, when useful>
- Gaps: <material behavior not verified, when any>

## Decisions

| Question | Answer | Who | Where |
| --- | --- | --- | --- |
| <the question> | <the answer, and the recommendation it replaced> | 👤 Human | <link to the comment> |
| <the question> | <the answer> | 👍 Accepted default | <link to the comment> |
| <the question> | <the call and its alternative> | 🤖 Agent | <link to the comment or ledger entry> |

Open: <each unanswered question, with its recommendation and link>, when any

Involvement: <grilling rounds answered, prototypes iterated with their round counts, reviews run, proof captured>
```

## Preserve evidence

When you edit an existing body, keep its uploaded images, recordings, useful
links, checked boxes, and reviewer notes. Put current evidence first. Move
older evidence that still gives context into a collapsed history block
labeled with its original scope.

Upload images and videos with `gh --attach`, as
[Upload media](references/ui-evidence.md#upload-media) describes. Store the
proof files outside the checkout, so they outlive the worktree. When the
`fleet` CLI is available, save them with
`fleet proof save --repo <owner/repo> --pr <number> --commit <full SHA> <files>`.
Otherwise, group them by PR and commit in a directory outside the
repository.
