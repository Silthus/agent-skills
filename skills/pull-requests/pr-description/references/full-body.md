# Full body

Write the whole PR body this way when the repository has neither its own
description skill nor a PR template. Then add the inserts from the
`pr-description` skill.

## Steps

1. Write the prose with the `writing-voice` skill when it is installed.
2. State the user problem and the resulting behavior in one or two
   sentences. Describe the final implementation. Use the domain terms from
   `GLOSSARY.md` when it exists.
3. Prove the change works, and put each proof beside the behavior it
   demonstrates:
   - **Screenshots**: one per changed feature, view, and state. For a change
     without a UI, show the observed command or API output.
   - **Recording**: a short video of the main journey when a larger feature
     has several steps. When the runtime cannot record, name the missing
     video as a gap.
   - **Flow diagram**: only when the change alters how calls or data flow
     between modules.

   For UI changes, read [UI evidence](ui-evidence.md) to capture, caption,
   and refresh media. For a flow diagram, read
   [implementation views](implementation-views.md).
4. Name the test seams, the checks you ran, and the material gaps. Add a
   verification command and its expected result when it helps a reviewer
   reproduce the behavior. Put long output and process history in a
   collapsed block or in proof storage.

## Default structure

```markdown
## Problem

<the user problem and the issue it closes>

## Impact

<the impact line, per the `impact` skill; drop the section when it says so>

## Merge Danger

<merge-risk block>

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
