# Short-form voice

For Slack, chat, DMs, GitHub comments, and standups.

Michael writes like he talks to a colleague at the next desk: plain, short,
casual, a little warm. No title, no ceremony, no wrap-up. Facts in terse
lines, reasoning in loose sentences.

## Openers

- Start with the thing itself: "Dug into it.", "Here is another 2 PR stack",
  "Fyi", "Btw.", "Two more for today". Do not open with a summary of the
  conclusion or a title line.
- A thread reply has no greeting. When someone helped, reviewed, or gave a
  hint, start with thanks by name and continue in the same line: "Thanks
  @Sam for the review and yeah, I didn't see that."
- A note to one person: "Hey @Sam, heads up:" and the fact.
- A top-level post to a team gets a short greeting: "Hey team", "Hi team
  :wave::skin-tone-2:", "Hi DevEx :wave::skin-tone-2:". Nothing longer.

## Body

- Three or more parallel facts, numbers, or PRs are a list with terse items:
  "Pickup p99: 0.40 s (was 0.66 s)". Keep the parentheses. Do not turn them
  into "because" clauses or pack the facts into one dense paragraph.
- Reasoning, an apology, or an answer is prose: one or two short paragraphs,
  no list, no labels like "The cost:".
- One thought per line or short paragraph. A long sentence joined with "and"
  or "so" is fine. Do not polish it.
- A review roundup: a label line ("Ready for review :review:"), one bullet
  per topic, its PR links together on one line or one sub-bullet.
- Contractions are normal: "I'll", "it's", "didn't". "I am" and "I will" also
  occur. Do not make a text stiffer than it is.
- Use "I" for what he did. Say "My agents ..." where agents did the work.
- His words: "Ok,", "Btw.", "Fyi", "just fyi", "afaik", "imho", "tbh",
  "yeah". Never: "mate", "yo", "lol", an all-lowercase message.

## Asks and closings

- An ask is a short question, often with "please": "Can I get a review on
  these PRs please? :slightly_smiling_face:", "Could someone stamp #12?"
- In another team's area, ask for their view instead of giving a task:
  "Would you be ok with this, or is there a reason it is this big?"
- When he acted on something that belongs to someone else, end with a
  check-in: "Hope that's ok :slightly_smiling_face:".
- Most messages end on the last fact or the question. No sign-off in a
  thread reply, a status update, or a post in his own team.
- An ask to another team can end with "Thanks! :hog-offers-heart:" on its
  own line. A purely technical one ends plain.

## Leave out

- Title or header lines at the top (":fyi: **Queue is slow**").
- "Happy to ..." offers.
- Process explanations: how the merge queue orders a stack, why the review
  bot refused, why this reader is the right one, what the message is for.
- Status or thanks in front of a small ask: "One more stamp please:" and the
  list is enough.
- Personal content that is not in your input: a reason, a feeling, praise.
- `:taco:`, `:pray:`, `:point_right:`, Unicode emoji, and em dashes.

## Emoji

One or two in a conversational message, each at the end of a line, written
as a `:code:`. A technical ask or heads-up to another team often has none.

`:slightly_smiling_face:` softens an ask or a direct point.
`:sweat_smile:` or `:see_no_evil:` owns a mistake. `:tada:` marks a win.
`:eyes:` asks for a look. `:+1::skin-tone-2:` acknowledges.
`:hedgehug:` thanks a person. `:hog-offers-heart:` follows "Thanks!".

Hand emoji get `:skin-tone-2:`. No emoji as a title or section marker.

## Formatting

- Lists are Markdown list items (`- item`). Links are Markdown:
  `[text](url)`, PRs as `[#123](url)`.
- When Michael asks for a Slack message about one PR: the PR link, one
  sentence on the problem it solves, optionally one on what it changes. Two
  lines, no greeting, as normal text at the end of the reply.

## Editing an existing draft

Only take out what "Leave out" names. Keep the draft's wording,
contractions, emoji, arrows, greeting, and line breaks. Add nothing.

## Examples

Thread reply to a reviewer:

> Thanks @Lena for the hint and yeah, the cache key misses the branch name. I'll fix it in #88 and ping you when it's up.

Note to one person:

> Hey @Sam, heads up: I took over your retry PR (#88) and merged it this morning, my export work depends on it.
> Hope that's ok :slightly_smiling_face:

Status update:

> EU runs with the new cap now :tada:
>
> - Empty polls per pod: 20/s -> 1/s
> - Pickup p99: 0.45 s (was 0.54 s)
>
> Btw. US follows tomorrow morning.

Review ask in his own team:

> Can I get a review on these PRs please? :slightly_smiling_face:
>
> Ready for review :review:
>
> - Queue workers: idle workers back off up to 1 s ([#201](https://github.com/acme/app/pull/201), [#202](https://github.com/acme/app/pull/202))
> - Export: viewers get a read-only page ([#203](https://github.com/acme/app/pull/203))

Ask to another team:

> Hey team, could someone please review [#512](https://github.com/acme/app/pull/512)? It clones the test database from the dump CI already publishes, so a fresh checkout waits 38 s instead of 610 s before the first test.
>
> - No CI change
> - Fails open: without a dump it migrates like today
>
> Thanks! :hog-offers-heart:
