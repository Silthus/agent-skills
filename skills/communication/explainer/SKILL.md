---
name: explainer
description: >-
  Draw a short visual explainer of a code change: one picture shaped to its
  mechanism and a few bullets on where it acts, how it works, and why it
  works. Use when asked for an explainer, or for a picture of what a PR or a
  set of PRs does.
---

# Explainer

An explainer lets a reader who knows the system, but not the change, say
what the change does and why it works, in under a minute and without the
diff. It is one picture and four to six bullets. The picture shows the
mechanism; the bullets carry the words.

## Steps

1. **Find the mechanism.** Read the PR's own change and the code around it,
   callers and callees, until you can write three sentences: where the
   change acts in the running system, what happened before and what happens
   now, and why the new behavior is correct or safe. A stacked PR's own
   change is its diff against its base branch; a merged PR's is its merge
   commit against the first parent. Done when the "why" sentence names the
   fact it rests on: a timing, a limit, a lock, an ordering, a cache, stored
   state, or another service's behavior.
2. **Pick the form** from the mechanism, in the table below. Done when you
   can name the form and the one thing a reader sees in it that the bullets
   cannot show as fast. When nothing qualifies, write the bullets alone.
3. **Draw it.** Draw the data the change moves: the polls, the rows a query
   reads, the calls, the states, the time a caller waits. When the change
   alters that data, draw before and now in the same form, one above the
   other, so the difference is the picture. Name parts with the code's own
   names.

   The picture is sparse: a title of two to four words, labels of a few
   words, and at most two lines of note under it. Every sentence goes in the
   bullets. Arrows and messages carry the labels; a Mermaid note holds a few
   words. Draw the one path or state the "why" rests on, and leave
   error codes, guard lists, and every other branch to the bullets and the
   diff. Give a Mermaid diagram its title in frontmatter
   (`---` / `title: <title>` / `---`), and shade a span with
   `rect rgba(<r>, <g>, <b>, 0.15)` so it reads in dark mode too.

   Render with `bun <this skill's directory>/scripts/render.ts <file>`. It
   takes a Mermaid `.mmd` or an `.html` copied from
   [canvas.html](canvas.html), writes a PNG beside it at 2x, and fails when
   text overflows its box. Read the PNG. GitHub draws a Mermaid block in its
   own theme, so for Mermaid the PNG checks layout only. Done when no text
   is clipped or overlaps, and a reader who skips the note still sees what
   changed.
4. **Write the bullets** in the template below: one fact per bullet, under
   25 words, in the code's own names. The explainer owns the mechanism. When
   the PR's description already explains it, move those facts into the
   bullets, and leave the rest of the description with the visible effect,
   the switch, and the risks. Done when every slot of the template is filled.
5. **Unslop.** Read the `unslop` skill (`~/.agents/skills/unslop/SKILL.md`)
   and apply every rule to the bullets and to every label in the picture.
   Where another writing skill disagrees, `unslop` wins. Then hide the
   picture and read the bullets alone, as the reader above. Done when that
   reader can say what the change does and why it works.
6. **Place it.**
   - **PR description:** add it as `### How it works` at the end of the
     section that describes the change. Edit the live body, keep everything
     else in it, and read it back after the push. A Mermaid picture goes in
     as a `mermaid` code block, which GitHub renders. Upload a PNG by the
     repository's own route when its description skill names one.
     Otherwise run `gh pr edit --body-file <body> --attach <png>`, with the
     body referencing the PNG by the same path. The alt text is the title.
     A picture from a private repository never goes to a public asset
     repository.
   - **Chat reply:** show the PNG, or the Mermaid block, and the bullets.

   In a public repository, the picture and the bullets carry config values
   and local benchmark numbers only. Production numbers, pod counts,
   hostnames, account and customer names, credentials, and internal metrics
   stay out.

## Forms

| The mechanism | The form | Drawn with |
| --- | --- | --- |
| Calls between services or workers, in order | Sequence diagram | Mermaid `sequenceDiagram`; `alt` for a switch |
| A path that branches on conditions | Flowchart: an exit for each outcome the "why" rests on, the rest folded into one exit | Mermaid `flowchart` |
| A record or object that moves between states | State diagram | Mermaid `stateDiagram-v2`; the canvas when its loops tangle |
| How often something runs, or who waits how long | Timeline: ticks, or bars on one time axis | Canvas |
| Which rows, keys, or items a query or loop touches | The items as small squares, the touched ones outlined | Canvas |
| A quantity that builds up and drops | A line over time, before and now | Canvas |
| Stored values or fields, before and now | A small Markdown table | The bullets' own Markdown, no picture |
| New tables, fields, or a kind that nothing uses yet | A field table, or no picture; the PR that uses them gets the picture | Markdown, or bullets alone |
| A rename, a config value, a one-line guard | No picture | Bullets alone |

When the parts and their order are the point, draw a sequence diagram or a
flowchart, and keep it sparse.

## Template

```markdown
### How it works

<picture>

- This PR acts on <the function, step, or query it changes, or its place in the shared picture>.
- Before, <what happened, and what it cost>.
- Now, <what happens with this change>.
- <why it works: the fact it rests on, then one bullet per guard, up to three>
```

A set of PRs that act on one loop or path can share one picture of it, in
the form the loop needs, with each PR's number on its place: a shaded span
of a sequence, an outlined state. Each PR's first bullet then names its
place, such as "the upload span (#1234) of the flow below". Add the block
once per set, the same text in every PR of the set, merged PRs included:

```markdown
<details><summary><The loop>, and where each PR acts</summary>

<picture>

- <three to six bullets on how the loop runs>

| PR | Marked as | Where it acts |
| --- | --- | --- |

</details>
```

## Example

SES holds one MAIL FROM per domain, so stored values are the mechanism: a
small table, no image.

```markdown
### How it works

| | SES identity | Project A row | Project B row |
| --- | --- | --- | --- |
| Before | `mail` | `mail` | `bounce` (stale) |
| Now | `mail` | read from SES | read from SES |

- This PR acts on `EmailIntegration.verify`, which runs when a project verifies a sender on a domain another project also uses.
- Before, verify sent the sender's stored `mail_from_subdomain` to SES, so one stale row broke the DNS records other projects published.
- Now, verify reads the MAIL FROM that SES holds, and builds the DNS records it shows from that value.
- SES holds one MAIL FROM per domain identity, so SES is the source of truth and each row is a copy.
- A sender row only feeds the DNS records PostHog shows, so a stale copy changes no mail that SES sends.
```
