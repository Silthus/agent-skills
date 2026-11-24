# Full body

Write the whole PR body this way when the repository has neither its own
description skill nor a PR template. Then add the inserts from the
`pr-description` skill.

## Steps

1. Write the prose with the `writing-voice` skill when it is installed. Use
   the domain terms from `GLOSSARY.md` when it exists.
2. Fill the headings below as the reviewer sections of the `pr-description`
   skill say.
3. Put each proof beside the behavior it demonstrates: for a change without
   a UI, the observed command or API output; for a larger UI feature with
   several steps, a short video of the main journey, or a gap when the
   runtime cannot record. Capture UI media as
   [UI evidence](ui-evidence.md) says.
4. Add a verification command and its expected result when it helps a
   reviewer reproduce the behavior. Put long output and process history in
   a collapsed block or in proof storage.

## Default structure

```markdown
## Problem

- <who met it and what they saw, and the issue it closes>

## Impact

<the impact line, per the `impact` skill; drop the section when it says so>

## Changes

<the new behavior, the shape, and its Rejected: line>

<the picture slot>

- <other changes a person can notice>

**Read yourself:** <one to three links with their questions, or No code reading needed: <reason>.>

## Merge Danger

<merge-risk block, and its Rollout section>

## How did you test this code?

**What was proven, and what not**

- ✅ <a run beyond CI and what it showed>
- ❌ <what no run showed>

<test rationale, then the receipt, or the owed proofs with their evidence links or gaps>

## Known issues

- <one bullet each>

## Decisions

| Question | Answer | Who | Where |
| --- | --- | --- | --- |
| <the question> | <the answer, and the recommendation it replaced> | 👤 Human | <link to the comment> |
| <the question> | <the answer> | 👍 Accepted default | <link to the comment> |
| <the question> | <the call and its alternative> | 🤖 Agent | <link to the comment> |

Open: <each unanswered question, with its recommendation and link>, when any

Involvement: <grilling rounds answered, prototypes iterated with their round counts, reviews run, proof captured>
```

## Preserve evidence

When you edit an existing body, keep its uploaded images, recordings, useful
links, checked boxes, and reviewer notes. Put current evidence first. Move
older evidence that still gives context into a collapsed history block
labeled with its original scope. Upload images and videos with
`gh --attach`, as [Upload media](ui-evidence.md#upload-media) describes.
