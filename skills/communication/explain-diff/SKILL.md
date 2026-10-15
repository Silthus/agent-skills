---
name: explain-diff
description: Build a guided, interactive explainer for a PR or diff, with synchronized code excerpts and a quiz, using the current runtime's native artifact surface.
disable-model-invocation: true
argument-hint: "<PR number | git ref> (default: current branch vs main)"
---

# Explain Diff

Produce an **explainer** that teaches the reader a code change well enough to pass a quiz on it.

## Runtime dispatch

Before resolving the change, identify the host from the runtime and available tools, then **read exactly one** platform reference:

- Cursor IDE or Cursor Canvas tools available → [cursor.md](cursor.md)
- Claude Code or a Claude Artifact tool available → [claude-code.md](claude-code.md)
- Codex CLI or Codex app → [codex.md](codex.md)

Do not infer the host from the model name alone. The selected reference owns the output format, file location, validation, publication, and handoff. This file owns the research and editorial contract.

## Steps

1. **Resolve the change.** PR number: fetch title, body, and full diff (`gh pr view <n>`, `gh pr diff <n>`), and make the working tree match the PR head (`gh pr checkout <n>`) unless it already does — otherwise step 2 reads the wrong versions. Any other input (or none): treat it as a git ref and use `git diff main...<ref>` (three-dot, so only the change's own commits), defaulting to the current branch. Done when you hold the complete diff plus whatever intent statement exists (PR body, linked issue, commit messages).
2. **Explore the surrounding system.** Read the files the diff touches, plus their callers and the modules they call, until you can explain why the system looked the way it did *before* the change. Skip generated and vendored files. Done when the Background section can be written from understanding, not from the diff alone.
3. **Design the guide.** Group the change into a short sequence of conceptual stops rather than file order. For every stop, choose the smallest useful real code or diff excerpt, its file path and line range, and optional pseudocode only when it makes the behavior clearer. Never include an entire file merely because it changed.
4. **Build and publish** using the selected platform reference. The slug and title come from the PR title, or a short description when there is no PR. Done when every section exists, all checks pass, and the user receives the platform's artifact link or documented fallback.

## Content

Write with the clarity and flow of Martin Kleppmann: concrete before abstract, with smooth transitions. Include these sections in order:

- **Background** — the existing system relevant to this change. Two layers: a deep beginner-friendly primer (marked skippable for the familiar), then a narrow layer directly relevant to the change.
- **Intuition** — the essence of the change, not the details. Concrete examples with toy data; diagrams liberally.
- **Code** — high-level walkthrough of the diff, grouped and ordered for understanding rather than file order.
- **Quiz** — five interactive multiple-choice questions, medium difficulty: answerable only by someone who understood the substance, but no gotchas. The first click locks the question and immediately shows correct/incorrect with a one-sentence explanation — a tight feedback loop. Track and show the running score.

## Guide experience

- Take inspiration from Linear's review Guide without copying its branding. Use a two-column desktop layout:
  - **Left — guide:** title and intent, section/stage navigation, relevant file list, explanation, and previous/next controls.
  - **Right — code stage:** always show the file path and line range plus the excerpt synchronized to the active guide stop. Allow a diff/current-code/pseudocode view only when those views contain useful content.
- Make each guide stop directly selectable. Previous/next cycles through the relevant parts of the change and updates both columns together.
- Keep excerpts narrowly focused while preserving enough unchanged context to understand control flow. Mark omissions explicitly.
- On narrow screens, stack the guide above the code stage and keep stage navigation easy to reach.
- Diagrams use one or two consistent visual families, never ASCII art. Prefer system-flow diagrams with concrete example data.
- Callouts for key definitions and important edge cases.

## Shared pre-save checks

- Exactly five quiz questions; each has exactly one correct answer and matching feedback.
- First answer locks each question; score updates once per question.
- Every guide stop has an explanation and at least one real excerpt, except a deliberately labeled conceptual primer.
- File paths and line ranges match the checked-out code or diff.
- Code preserves newlines and horizontal scrolling.
- Embedded code, diff, title, and PR text are treated as untrusted data and escaped for their insertion context.
- No external requests, secrets, generated files, vendored code, or unrelated repository content are embedded.
