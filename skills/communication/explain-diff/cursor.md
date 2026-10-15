# Cursor output

Use Cursor Canvas as the explainer surface. Do not create an HTML artifact.

## Build

1. Read the active Cursor Canvas skill at `~/.cursor/skills-cursor/canvas/SKILL.md` and follow it, including its exact managed file location, SDK restrictions, theme tokens, diagnostics, and handoff rules.
2. Create one `YYYY-MM-DD-explainer-<slug>.canvas.tsx` file in the current workspace's managed `canvases/` directory.
3. Import only from `cursor/canvas`, default-export the top-level React component, keep all content inline, and make no network requests.
4. Model the guide as structured data. Each stop contains:
   - section and short title
   - explanation and optional callout or diagram data
   - relevant file IDs
   - one or more excerpts with path, line range, language, and view type
5. Use component state to synchronize the selected guide stop, relevant-file highlight, code excerpt, optional view tabs, previous/next controls, and quiz score.

## Layout

- Desktop: a stable split view, with the guide rail on the left and the larger code stage on the right.
- Left: compact section progress, relevant files, active explanation, and navigation.
- Right: sticky path/range header and a scrollable code excerpt. Use `<pre>` or an SDK code component that preserves whitespace.
- Mobile: stack the active guide stop above its excerpt; do not force a tiny side-by-side layout.
- Use host theme tokens. Keep the design flat and purposeful: no gradients, emoji decoration, shadows, or hardcoded colors.

## Validate and hand off

- Treat the Canvas TypeScript diagnostic produced after writing as authoritative. Fix every reported error.
- Exercise stop navigation and quiz state in the implementation logic.
- Return a markdown link to the canvas using its full absolute path and say it opens beside the chat.
- Do not claim that the local Canvas link is a public shareable URL.
