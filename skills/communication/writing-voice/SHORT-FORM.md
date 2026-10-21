# Short-form voice

For Slack, chat, DMs, GitHub comments, and standups. The tone is warm, upbeat,
and frank: more casual in 1:1 DMs, positive and diplomatic in public channels.

## Shape

- Open anything longer than a quick back-and-forth with a greeting, the name,
  and a wave: "Hey Sam :wave::skin-tone-2:," or "Good morning folks
  :sun_with_face:,". Start with the greeting itself and end without a
  signature.
- Write short lines, one thought per line. Fragments are fine. Break anything
  longer into lines or bullets. Put a blank line between every standalone
  line (the greeting, each thought, the closing): the draft reaches Slack
  through a rendered Markdown reply, and a single newline merges lines into
  one paragraph.
- Soften a direct point with an emoji, a "please", or a reason.
- Close an ask with "Thanks!" or "Thank you so much :purple_heart:", and say
  what the ask unblocks.
- Hedge lightly ("I think", "maybe", "afaik", "tbh") and still land a clear
  recommendation.
- Push back openly and calmly, with facts or a pointed question: "Sorry to
  push back here, but…". Own mistakes and apologize quickly.

## Emoji

Use emoji often, each with a purpose.

- Softener `:slightly_smiling_face:`, acknowledgement `:+1::skin-tone-2:`,
  thanks `:purple_heart:` or `:taco:`, done `:white_check_mark:`,
  self-deprecation `:sweat_smile:` or `:see_no_evil:`.
- Add `:skin-tone-2:` to every hand emoji: `:wave::skin-tone-2:`,
  `:point_right::skin-tone-2:`, `:muscle::skin-tone-2:`.
- Tag the message type with a leading emoji: `:fyi:` for a heads-up, `:new:`
  for an announcement, `:dart:` for a status update, and
  `:point_right::skin-tone-2:` for a call to action.

## Formatting

- Write options and status as Markdown list items (`- item`), with a blank
  line before the list, so they render as a list. Use `->` for a flow, and
  start status items with ✅ ⏳ 🚫: `- ✅ Staging ready`.
- Put config, errors, and prompts in code blocks.
- Write links as Markdown, `[readable text](url)`. Use @mentions, or a trailing
  `cc:` for an FYI.
- A trailing "…" trails off or makes a point. Exclamation marks add warmth. A
  short line often ends without a period. Shorthand is fine: `&`, `w/o`, `+`,
  "btw.", "P.s.:".

## Announcements

Use this order: an `:emoji: Topic title` header, the greeting, the context, `- `
list items, a `:point_right::skin-tone-2:` call to action, and a pointer to the
thread or link.

## Slack message about a PR

When Michael asks for a Slack message about a PR, end the reply with the
message as normal text, not in a code block.

- Lead with the PR number as a Markdown link:
  `[#123](https://github.com/org/repo/pull/123)`.
- Follow with one sentence on the problem the PR solves, told from the user's
  or team's side. Optionally add one short sentence on what it changes.
- Keep it to two lines with no greeting, header, or bullets, and one emoji at
  most.

> [#482](https://github.com/acme/app/pull/482) Fixes signups failing silently when the email provider times out. Adds a retry with a visible error state.

## Examples

> Hey :wave::skin-tone-2:, could you please give those PRs a quick look and ack? They're for a spike on a new deploy pipeline: [links] Thanks!

> :dart: Status Update
>
> - :white_check_mark: Login flow ready
> - :hourglass: CSV export partially working (one bug to iron out)
> - :no_entry_sign: caching idea needs reworking
>
> I'll keep you updated.

> Nice :muscle::skin-tone-2: Had one comment which may lead to a bug. Deploying dev now to preview: [link]
