---
name: leaving-pr-comments
description: >-
  Draft and format every GitHub comment, review reply, or issue comment an
  agent posts on the user's behalf. A person's comment gets a 👍 reaction for
  a fix, or a draft the user posts in their own voice. Replies to review bots
  and decision records go out without approval. Use before posting any
  comment or reaction from the user's account.
---

# Leaving PR comments

## People hear from the user

A person who wrote a comment put thought into it. They hear back from the
user, or see one silent signal, never a reply from an agent. A thread or
comment counts as a person's when a person wrote any comment in it, or when
you cannot tell.

- **Fixed as suggested**: push the fix, then add a 👍 reaction to their
  latest comment. Post no reply. Leave the thread open; the person resolves
  it. For a review comment, run
  `gh api repos/<owner>/<repo>/pulls/comments/<id>/reactions -f content=+1`;
  for a top-level PR comment, use `issues/comments/<id>/reactions`. The id is
  the number after `#discussion_r` or `#issuecomment-` in the comment's URL.
  The 👍 is the only reaction, and it means fixed.
- **Everything else**: pushback, a question, a partial fix, or an answer
  that waits on a decision. Draft the reply in the user's voice, without the
  callout, and give the user the draft with the comment's URL. The user posts
  it themselves. Post it for them only when they ask you to; then post their
  approved text, unchanged or with their edits, under the callout. An earlier
  request does not cover a new reply.

A subagent or a loop cannot ask the user. It adds the 👍 for a fix and
returns each draft with its URL in its summary, and the main agent hands the
drafts to the user.

## Records and commands

These go out without approval:

- The PR comment that holds the decision lines on the user's own PR, per the
  `pr-description` skill, and each edit to it.
- A bare command that a repo's bot reads, such as `/trunk merge`, when a
  skill's grant covers it. Post the command alone, without the callout.

## Replies to review bots

A review bot, such as CodeRabbit, Greptile, Copilot, Cursor Bugbot, PostHog
Review, or Macroscope, wrote every comment in the thread. Any agent, a
subagent or a loop too, acts without approval when you are confident the
finding is fixed or the reason is correct:

- **Fixed finding**: push the fix, then resolve the thread with no reply.
  The push and the resolved thread say it. When the `fleet` CLI is available
  (on `PATH` or at `~/dev/fleet/fleet`), run
  `fleet pr bot-threads --repo <owner/repo> --pr <number> --fixed <thread URL>`,
  one `--fixed` per thread, with the URL the command lists. It refuses a
  person's thread. Otherwise use the GitHub GraphQL `resolveReviewThread`
  mutation through `gh api graphql`.
- **Rejected finding or follow-up**: reply with the concrete reason and the
  evidence, such as the file and line that prevents the bug, or the pattern
  the fix waits for. The reason stops the bot from raising it again. Then run
  the command with `--resolve`, which resolves only bot threads whose last
  comment is yours.

A bot finding that sits in a review body has no thread. A fix needs no
answer. Answer the rejected findings in one PR comment that mentions the bot,
such as `@coderabbitai`, in the format below. Report each reply you posted
and each thread you resolved.

Hand the user a draft, as for a person, when the reply depends on a decision
that is still open, or when you are not confident in the reason. Any other
top-level PR comment also waits for the user's approval.

## Before you post

Check the text for secrets, tokens, internal hostnames, customer names or
data, and internal numbers. Many repos are public. Remove what you find and
never post it.

## Format

Start every comment an agent posts with this callout. Put in the exact name
of the model that writes the comment, for example `Claude Opus 5.5` or `GPT-5.6 Sol`:

```md
> [!NOTE]
> 🤖 **<model name> responding on behalf of <user's first name>**

No change: `parseRows` in `src/csv.ts:42` already skips empty rows, and
`csv.test.ts` covers it.
```

Write the body in the user's short-form voice from the `writing-voice` skill,
when it is installed. Never use em dashes.

- Lead with the outcome: the commit that fixes it, or the reason for no change.
- Name the commit, file, or test that proves the claim.
- Keep it to one to three sentences. A dismissal gives the concrete reason the
  finding does not apply.
