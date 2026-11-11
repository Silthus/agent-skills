---
name: explainer
description: >-
  Draw a short visual explainer of a code change: one picture of its
  mechanism and a few bullets on where it acts, how it works, and why it
  works. Use when asked for an explainer, or for a picture of what a PR or a
  set of PRs does.
---

# Explainer

An explainer lets a reader who knows the system, but not the change, say
what the change does and why it works, in under a minute and without the
diff. It is one picture and four to six bullets. A set of PRs also gets one
shared picture of the system, with a numbered badge where each PR acts.

## Steps

1. **Find the mechanism.** Read the PR's own change and the code around it,
   callers and callees, until you can write three sentences: where the
   change acts in the running system, what happened before and what happens
   now, and why the new behavior is correct or safe. A stacked PR's own
   change is its diff against its base branch; a merged PR's is its merge
   commit against the first parent. Done when the "why" sentence names the
   fact it rests on: a timing, a limit, a lock, an ordering, a cache, stored
   state, or another service's behavior.
2. **Draw one picture** that shows the before, the now, and that fact.
   - **A card**, by default. Copy [card.html](card.html) and lay out its
     boxes, grid, or inline SVG. It carries timelines, rows of state, queues,
     and system maps with badges.
   - **Mermaid**, when the picture is only boxes and arrows, or when the
     repository's own rules require Mermaid for it. GitHub renders it
     without an upload.

   Name each part with the code's own names, write each label so a reader
   understands it without the diff, and keep to about ten parts. Render with
   `bun <this skill's directory>/scripts/render.ts <card.html | diagram.mmd>`.
   It writes a PNG beside the file and fails when text overflows its box.
   Read the PNG. Done when no text is clipped or overlaps, and the picture
   alone shows the before, the now, and the fact from step 1.
3. **Write the bullets** in the template below: one fact per bullet, under
   25 words, in the code's own names. The explainer owns the mechanism. When
   the PR's description already explains it, move those facts into the
   bullets, and leave the rest of the description with the visible effect,
   the switch, and the risks. Done when every slot of the template is filled.
4. **Unslop.** Read the `unslop` skill (`~/.agents/skills/unslop/SKILL.md`)
   and apply every rule to the bullets and to every label in the picture.
   Where another writing skill disagrees, `unslop` wins. Then hide the
   picture and read the bullets alone, as the reader above. Done when that
   reader can say what the change does and why it works.
5. **Place it.**
   - **PR description:** add it as `### How it works` at the end of the
     section that describes the change. Edit the live body, keep everything
     else in it, and read it back after the push. Upload a PNG by the
     repository's own route when its description skill names one.
     Otherwise run `gh pr edit --body-file <body> --attach <png>`, with the
     body referencing the PNG by the same path. The alt text is the card's
     title. A picture from a private repository never goes to a public asset
     repository.
   - **Chat reply:** show the PNG, or the Mermaid block, and the bullets.

   In a public repository, the picture and the bullets carry config values
   and local benchmark numbers only. Production numbers, pod counts,
   hostnames, account and customer names, credentials, and internal metrics
   stay out.

## Template

```markdown
### How it works

<picture>

- This PR acts on <the function, step, or query it changes, or "badge N of <system> below">.
- Before, <what happened, and what it cost>.
- Now, <what happens with this change>.
- <why it works: the fact it rests on, then one bullet per guard, up to three>
```

For a set of three or more PRs that act on one system, add the shared block
once per set, the same text in every PR of the set, merged PRs included:

```markdown
<details><summary><System>, and where each PR acts</summary>

<picture of the system with numbered badges>

- <three to six bullets on how the system runs>

| Badge | PR | Where it acts |
| --- | --- | --- |

</details>
```

## Example

The picture is a card with three columns: the SES identity, project A's
sender row, and project B's sender row, each holding its MAIL FROM
subdomain, one row per moment.

```markdown
### How it works

![SES keeps one MAIL FROM per domain, and each sender keeps a copy](<png>)

- This PR acts on `EmailIntegration.verify`, which runs when a project verifies a sender on a domain another project also uses.
- Before, verify sent the sender's stored `mail_from_subdomain` to SES, so one stale row broke the DNS records other projects published.
- Now, verify reads the MAIL FROM that SES holds, and builds the DNS records it shows from that value.
- SES holds one MAIL FROM per domain identity, so SES is the source of truth and each row is a copy.
- A sender row only feeds the DNS records PostHog shows, so a stale copy changes no mail that SES sends.
```
