---
name: leaving-pr-comments
description: >-
  Draft, get the user's approval for, and format every GitHub comment, review
  reply, or issue comment an agent posts on their behalf. Use before posting
  any comment from the user's account.
---

# Leaving PR comments

## Approval first

The user approves every comment before it goes out. This covers PR comments,
review replies, issue comments, and resolving a thread with a reply. The only
exception is a fixed review-bot finding, below.

1. Draft the comment in the format below.
2. Show the user the target (URL and thread) and the exact text.
3. Post only after they approve that comment in the conversation. Post it
   unchanged, or with their edits. An earlier approval does not cover a new
   comment.

A subagent or a loop cannot ask the user. It does not post. It returns each
draft with its target in its summary, and the main agent asks the user.

### Fixed review-bot findings

A review bot, such as CodeRabbit, Greptile, or Copilot, opened a thread, and a
pushed commit fixes the finding. Any agent, a subagent or a loop too, replies
without approval:

1. Push the fix first.
2. Check the thread. If the bot already resolved it after the push, post
   nothing.
3. Otherwise, reply in that thread with the fixing commit and one sentence on
   the fix, in the format below. Leave the thread open for the bot or a
   reviewer to resolve.

This exception covers only fixed bot findings on the author's own PR. A
dismissed bot finding, any human thread, and any other comment still need
the user's approval. Report each reply you posted.

## Format

Start every comment with this callout. Put in the exact name of the model that
writes the comment, for example `Claude Opus 5.5` or `GPT-5.6 Sol`:

```md
> [!NOTE]
> 🤖 **<model name> responding on behalf of <your name>**

Fixed in 2c76885. The parser now skips empty rows, and the new test covers it.
```

Write the body in short, plain sentences. Never use em dashes.

- Lead with the outcome: the commit that fixes it, or the reason for no change.
- Name the commit, file, or test that proves the claim.
- Keep it to one to three sentences. A dismissal gives the concrete reason the
  finding does not apply.
