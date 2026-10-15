# Codex output

Use a native Codex artifact publisher only when the current runtime actually exposes one. Otherwise create a local self-contained HTML explainer.

Codex capabilities vary between the CLI and desktop app. Do not assume that a preview pane, cloud task URL, or internal feature flag is a publishable artifact.

## Capability check

1. Inspect the tools exposed to the current session and the installed Codex help/features.
2. A native publisher qualifies only if it accepts the generated artifact and returns an artifact-specific URL that another person can open.
3. Do not enable experimental or under-development flags merely to obtain artifact support.
4. Do not describe a local preview URL, `file://` URL, Codex Cloud task URL, or conversation URL as a shareable explainer.

## Build

Write `YYYY-MM-DD-explainer-<slug>.html` to the system temporary directory as one self-contained HTML file:

- inline CSS and JavaScript; no packages or external requests
- synchronized guide/excerpt split layout
- direct guide-stop selection and previous/next controls
- path and line range always visible with the active excerpt
- responsive stacked layout on narrow screens
- `<pre>` code blocks with preserved whitespace and horizontal scrolling
- styled HTML/CSS or inline SVG diagrams, never ASCII art
- untrusted repository and PR content inserted with text-safe DOM APIs or safely escaped serialization

## Publish or hand off

- If a qualifying native artifact publisher exists, use it, verify the result, and return its artifact URL.
- Otherwise verify the local HTML and provide exactly one `open "<absolute-path>"` command.
- If the user specifically requires a public URL and no native publisher exists, offer to deploy the static file to a host they approve. Publishing repository-derived content is an external write, so obtain confirmation and warn that the excerpts will become public.

## Validate

- Open the local or published result and click through every guide stop and all five quiz questions.
- Confirm the active file, excerpt, and explanation stay synchronized.
- Confirm the artifact works with networking disabled and remains legible in light and dark color schemes.
