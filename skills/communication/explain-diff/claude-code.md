# Claude Code output

Use a Claude Artifact as the explainer surface.

## Build

1. Write a single self-contained HTML artifact named `YYYY-MM-DD-explainer-<slug>.html` in the scratchpad, or the system temporary directory when no scratchpad exists.
2. Include all CSS and JavaScript inline. Make no external requests and use no external packages, fonts, images, or scripts.
3. Implement the synchronized two-column guide with semantic HTML and plain JavaScript:
   - guide stops and relevant files on the left
   - the active path, line range, and focused code excerpt on the right
   - direct stop selection plus previous/next controls
   - responsive stacked layout on narrow screens
4. Use `<pre>` for code, with `white-space: pre` or `pre-wrap` and horizontal scrolling. Use styled HTML/CSS or inline SVG for diagrams, never ASCII art.
5. Keep content data separate from rendering logic. Insert untrusted repository and PR content with text-safe DOM APIs. If data must be serialized into a script, escape `<`, `&`, `</script>`, and Unicode line separators before insertion.

## Publish

- Publish the completed HTML with the Claude Artifact tool, using the page title and an appropriate emoji favicon.
- Open or render the artifact once if the tool supports previewing, then provide the returned artifact URL.
- If the Artifact tool is genuinely unavailable, keep the local HTML, report that publication was unavailable, and provide exactly one `open "<absolute-path>"` command. Do not pretend a local file path is shareable.

## Validate

- Confirm the document works with networking disabled.
- Click through every guide stop and all five quiz questions.
- Confirm the active file, excerpt, and explanation stay synchronized.
- Verify both light and dark color schemes remain legible.
