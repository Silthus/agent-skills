---
name: pr-description
description: >-
  Write or refresh a PR description that leads with the user problem, carries
  a merge-risk callout, and puts proof (screenshots, recordings, command
  output) beside each behavior it shows. Use when opening a PR, writing or
  refreshing a PR body, or updating its evidence after a fix or rebase.
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

Write a PR description that lets the reviewer understand the problem, the
resulting behavior, and the evidence before opening the diff.

## Steps

1. Read the current diff, existing PR body, repository instructions, and PR
   template. Use the repository's description skill when it requires one.
   Its section structure, QA, media, and publication rules are authoritative.
2. Use the `writing-voice` skill for prose when it is installed, and the
   `merge-risk` skill for the risk callout. Keep the callout after the
   problem, within the repository's section structure.
3. State the user problem and resulting behavior in one or two sentences.
   Describe the final implementation. Use the domain terms from `GLOSSARY.md`
   when it exists.
4. Prove the change works, and put each proof beside the behavior it
   demonstrates:
   - **Screenshots**: one for every changed feature and view, and one for
     each changed state. For a change without a UI, show the observed
     command or API output instead.
   - **Recording**: a short video of the main journey for a larger feature
     with several steps. When the runtime cannot record, name the missing
     video as a gap.
   - **Flow diagram**: only when the change alters how calls or data flow
     between modules. It shows those modules and the seams that connect them.

   For UI changes, read [UI evidence](references/ui-evidence.md) to capture,
   caption, and refresh media. For a flow diagram, read
   [implementation views](references/implementation-views.md).
5. Name the test seams, checks actually run, and material gaps. Include a
   verification command and expected result when they help reproduce the
   behavior. Put lengthy output and process history in a collapsed block or
   durable proof storage.

Done when the problem and resulting behavior are clear without the diff,
each consequential claim has supporting evidence or an explicit gap, and
the description follows the repository's template.

## Default structure

Use this structure only when the repository has no required template:

```markdown
## Problem

<the user problem and the issue it closes>

## Merge Danger

<merge-risk callout>

## Summary

<the resulting behavior, with captioned media for UI changes>

## Evidence

- <what was exercised and the observed result>
- Test seams: <the public behavior the tests drive>
- Verify: <command and expected result, when useful>
- Gaps: <material behavior not verified, when any>
```

## Preserve evidence

When editing an existing body, preserve uploaded images, recordings, useful
links, checked boxes, and reviewer notes. Present current evidence first.
Keep older evidence that still provides context in a collapsed history block,
clearly labeled with its original scope.

Upload images and videos with `gh --attach`, as the
[upload section of UI evidence](references/ui-evidence.md#upload-media)
describes. Keep the proof files outside the checkout, so they outlive the
worktree. When the `fleet` CLI is available (on `PATH` or at `~/dev/fleet/fleet`), save them with
`fleet proof save --repo <owner/repo> --pr <number> --commit <full SHA> <files>`.
Otherwise, keep them in a directory outside the repository, grouped by PR and
commit.
