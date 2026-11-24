---
name: pr-description
description: >-
  Write a PR description a cold teammate can review from, in the
  repository's own sections, and add the merge-risk callout, the Impact
  section, owed proofs, and decision lines. Use alongside a repository's own
  description skill, such as `writing-pr-descriptions`, before
  `gh pr create` or `gh pr edit --body`, and when work continues on a PR: a
  follow-up request, review fixes, or a rebase.
metadata:
  credits:
    - skill: pr
      author: Matt Pocock
      license: MIT
      url: "https://github.com/mattpocock/skills"
    - skill: show-me
      author: Dex Horthy
      organisation: Humanlayer
      url: "https://github.com/humanlayer/skills/blob/main/plugins/show-me/skills/show-me/SKILL.md"
---

This skill writes a PR body a **cold teammate** can review from: a person
with no thread context, who decides from the description and reads code only
where it says so. The repository's own description skill and PR template
keep their headings, media rules, and length rules. This skill sets what the
problem, changes, test, and known-issues sections answer, and adds four
**inserts**: merge risk, Impact, proof, and decisions.

## Steps

1. Read the diff, the live body (`gh pr view <n> --json body --jq .body`),
   the repository instructions, and its PR template. When it has neither a
   description skill nor a template, use the headings in
   [full body](references/full-body.md).
2. Collect every **author fact** below.
3. Write the reviewer sections below into the repository's own headings,
   with its description skill when it has one. Edit the live body, and keep
   every image, link, and ticked box it already holds, and the fact of each
   note, shortened as the word budget says.
4. Add each insert in the place it names.
5. Push the body. With the `fleet` CLI, once `fleet proof gate` has run on
   HEAD, run `fleet proof receipt` as Proof says. Read the body back. Done
   when the live body answers each reviewer section and holds the
   merge-risk block, the Impact section unless `impact` leaves it out, the
   proof receipt of HEAD when the gate has run on HEAD (or, without the
   `fleet` CLI, a line for each owed proof), and the latest decision line
   for every decided question, within the word budget.

Each time work continues on the PR, refresh the sections and the inserts in
the same edit as the rest of the body.

## Author facts

A reviewer reads every sentence of the body as a checked fact. Supply each
fact below from the thread, the ticket, the map, or the receipt. When they
do not hold it, ask the person who drove the work. When nobody knows it,
write `unknown` where the fact belongs, such as
`Blocks: the enforcement PR, number unknown.` `unknown` is for these facts,
which a reviewer needs. Leave out a line that would hold only `unknown` and
that no reviewer needs, such as a Decisions row with no record or an
Involvement count.

- **Who met the problem** and what they saw, or that nobody has met it yet.
- **The PRs it depends on, and the PRs that wait on it**, by number.
- **The lines a person must read**, and the question each one settles.
- **What the driver checked**: the design, the code, or neither.
- **The rejected option** and its reason. A config or copy change has one
  only when someone weighed another value or wording.
- **Whether the receipt covers HEAD**, and whether the proof judge ran there.
- **A judge or risk grade that disagrees** with the description.
- **Whether each owed check ran**, such as a dev send before production.
- **CI at HEAD**: each run that failed, was cancelled, was skipped, or still
  runs, read with the commit and the time.
- **Why each chosen number is that number**, such as a cap or a batch size.

## Reviewer sections

Map each section to the repository's own heading, such as "Motivation and
Context" for Problem, and keep the body inside the word budget below.

- **Problem**: one or two bullets on who met the problem and what they saw
  or could not do. The mechanism belongs in Changes. When nobody has met it
  yet, say so and why it matters now.
- **Changes**: the new behavior from the person's side in two to four
  sentences, then the shape of the change and one
  `Rejected: <option>, because <reason>.` line. A config or copy change
  has the line only when another value or wording was weighed, such as a
  staged list of teams in place of all of them; otherwise leave the line
  out, and never write `Rejected: unknown`. Then the **picture slot**,
  filled as [picture](references/picture.md) says. Then one bullet per
  other change a person can notice; mark the rest `(mechanical)`. Then a
  `Depends on:` line and a `Blocks:` line naming the PRs by number, when
  there are any.
- **Read yourself**: the last line of Changes. One to three links to
  `https://github.com/<owner>/<repo>/blob/<full HEAD SHA>/<path>#L<a>-L<b>`,
  each with the question to answer while reading:
  `**Read yourself:** [the retry rule, L40–58](<link>): does a timeout retry
  at most twice?` When the diff and the body settle every question, write
  `**Read yourself:** No code reading needed: <reason>.`
- **Test section**: open it with `**What was proven, and what not**`: a ✅
  bullet per run or read beyond CI and what it showed, and a ❌ bullet per
  thing nothing showed. A receipt or judge that is missing, older than
  HEAD, or failed at HEAD gets one ❌ bullet. State CI as CI below says.
  The test rationale and the receipt follow as Proof says. What the driver
  checked goes in the template's agent-context block, or in this list when
  the template has none.
- **Known issues**: their own heading, after the test section, one bullet
  each, outside any collapsed block.

### CI

CI changes within minutes, so a CI fact names its commit and the time it
was read: `CI at <short SHA>, read <YYYY-MM-DD HH:MM> UTC: <state>.` Read it
with `gh pr checks <n>` or the check runs of HEAD right before you push the
body, and read it again on each later push. The state names every run that
failed, was cancelled, or still runs, and the skipped runs: by name when a
required check or a job that this change should run was skipped, else as
one phrase, such as `the rest skipped by path filters`. A cancelled or
skipped run is not a pass: write `all pass` only when no run failed, was
cancelled, or still runs. When the commit is not HEAD, the line says so.
The repository's own CI rule, such as no pass counts, still holds.

### Word budget

Keep the words you write at 400 to 800. A **small change** aims lower: at
most 350 words. A change is small when the diff, without tests and
generated files, changes about 50 lines or fewer, and `merge-risk` grades it
low or medium with a two-way door. Read both from the diff stat and the
callout before you write. A small change gets one or two bullets per
section and may give the new behavior in one sentence, though every ❌
bullet still stays. It says each fact in one place: a dependency in
`Depends on:`, which a Rollout line points at without naming the PRs
again.

Count the words with `bun scripts/word-count.ts <body file>` from this
skill's folder, which exits 1 over 800, or over 350 with `--small`. Every
block counts, the callout, Known issues, tables, and collapsed blocks
included. Only what nobody writes by
hand is left out: the receipt block, fenced code and diagrams, template
checklist and release-status lines, and HTML comments. Without Bun, run
`wc -w` on the body with those parts removed. A template's tighter aim, such as 150 words of
prose, never removes a section or an insert; the 800-word cap, or 350
for a small change, is the one that holds.

Write every block within its cap, and say each fact once: a fact in the
callout or Rollout is not repeated in the ❌ list or Known issues.

| Block | Cap | The rest goes to |
| --- | --- | --- |
| Merge-risk callout | four to six one-sentence bullets, Switch-off and Tier included, plus the floor below; one line per Rollout entry | Known issues |
| Receipt | each "What ran" and "Result" cell one clause of at most twelve words, saved as Proof says | the evidence file |
| What was proven | no ✅ bullet that repeats a receipt row; every ❌ bullet stays | the receipt |
| Test rationale | two sentences | the tests |
| Decisions | the rows Decisions names | the decisions comment |

The callout has a **floor**: a bullet stays in the callout, one sentence
long, when `merge-risk` requires it or a judge verdict at HEAD says the
callout must name its effect. `merge-risk` requires the bullet for each
uncovered row with its residual incident, the Switch-off, and the Tier.
The floor counts toward the six; when it holds more than six bullets, the
callout is longer than six: `merge-risk` wins over the cap. Each Rollout line it writes stays too, one
line each. Shorten the other bullets, or move them to Known issues. A floor
effect stays out of Known issues, since the callout says it.

When the body still passes its cap, fold in this order until it fits:

1. **Decisions**: replace the table with one line,
   `**Decisions:** <n> lines in [<target>](<link>).` The target is the
   first that holds every row: the PR's decisions comment, posted first
   as Decisions says when you may post it; the full receipt, when its
   decision ledger holds the rows; the map's or the ticket's decision
   lines. Count `<n>` at the target. With no target, the table stays.
2. **Known issues**: one sentence each, without a file and line prefix.
3. **Changes**: the `(mechanical)` bullets merge into one line.

Never cut an element to fit: the picture, Read yourself, a ❌ bullet, a
callout bullet on the floor, and the receipt block stay. When every block
is folded and the body still passes 800, the PR is too large to review from
its description: say so in the handoff and propose a stack. A small change
over 350 has a block that repeats a fact or the diff: cut it.

## Merge risk

Grade the PR with the `merge-risk` skill. It writes the callout, and its
Rollout section when the grade calls for one, in the place it names. The
block stays when the repository's skill sets a word budget: a reviewer reads
it first. Where this skill and `merge-risk` disagree on what the callout
holds, `merge-risk` wins: the word budget never moves a bullet it requires
out of the callout. Its `<!-- merge-risk -->` markers are not
template comments; keep them.

## Impact

Write the Impact section right after the problem, with the `impact` skill
when it is installed. It links the insight that shows, 14 days after
deploy, whether this change worked. Leave the section out when the skill
says so, as it does for most fixes.

A PR from a Wayfinder map copies the map's Impact section and narrows it to
this change. Pushback happened while the map was charted, so ask nothing.
When the map is private and this repository is public, everything copied
from the map, its Impact section and its decision lines alike, keeps only
public context: the numbers, customer data, and internal findings stay on
the map.

## Proof

When the work ran proofs per [`PROOF.md`](../qa-swarm/PROOF.md) of the
`qa-swarm` skill and the `fleet` CLI is available, do not list the proofs by
hand. After `fleet proof gate` on a new head, run
`fleet proof receipt --repo <owner/repo> --pr <number> --commit <full SHA>`.
It writes the receipt into the template's testing section, between its
`fleet-proof-receipt` (or `hedge-proof-receipt`) markers: a row per owed proof, the review and judge
rows, what was not checked, the gaps, and the link to the full receipt.
Above the markers, write only the "What was proven, and what not" list and
your own reason for this test approach (the template's rationale line when it
has one). Never edit between the markers, and never remove the block, an
older one included: run the receipt again at HEAD. The receipt prints each
kind's `--ran` and `--result` in its cells as they were saved, so save each
as one clause. When a cell is longer, save the kind again with
`fleet proof save --kind <kind> --ran '<clause>' --result '<clause>'`: it
replaces both lines, which the gate and the judge never read. Then run the
receipt again. The receipt goes under a "How did you test this code?" heading, and
adds that heading at the end of the body when the body has none. Name what the proofs did not check with
`--not-checked '<item>'`, once per item; a later run without the flag keeps
the list. The command edits the live body itself, so run it after your own
body edit, never before.

- A warning names a kind without its two lines or a screenshot without a
  caption or a published URL, with the command that fixes it. Run that
  command, then the receipt again.
- Exit 2: the body guard refused a field and names it. It refuses a number
  of four or more digits, a percentage, a thousands separator, an email
  address, or an HTML entity. Rewrite that field without it: save the kind's
  `--ran` and `--result` again, or pass the whole `--not-checked` list
  again, and put the detail in an evidence note. For a gap reason, record
  the gap again with `fleet proof gap`. Then run the receipt again.
- Exit 1: publishing, GitHub, or the body failed, and the message names the
  fix: repair broken markers by hand, connect a gateway with
  `./fleet mcphub connect <machine>`, or shorten the evidence notes and lens
  answers of a page over the budget. Apply it and run the receipt again; a
  rerun repairs a half-written receipt. When the same message comes back,
  stop and report it.
- Exit 3: the hub ledger cannot be reached, and nothing was written. Run the
  receipt again once the hub answers.

Without the `fleet` CLI, put each owed proof in the "What was proven, and
what not" list: a ✅ bullet with its evidence link, or a ❌ bullet with its
gap. A receipt block already in the body stays as it is; the word count
leaves it out. State CI as CI says.

Store proof files outside the checkout, so they outlive the worktree. When
the `fleet` CLI is available (on `PATH` or at `~/dev/fleet/fleet`), save
them with
`fleet proof save --repo <owner/repo> --pr <number> --commit <full SHA> <files>`.
When the repository's skill names no upload route for images and videos,
use [Upload media](references/ui-evidence.md#upload-media).

## Decisions

Add a Decisions table: one row per decision a reviewer or a future reader
needs. That is each load-bearing decision or call that
[qa-swarm triage](../qa-swarm/TRIAGE.md) defines, and each decision that
changes an earlier decision line. Each row is a decision on record: a
decision line, a ledger entry, or a comment. Never restate the change as a
decision. Mechanical choices, rows per ticket or slice, and process calls,
such as another review round or how a gate ran, stay out; the decisions
comment and the receipt hold them. The table has the columns Question, Answer, Who, and Where,
sorted 👤, 👍, 🤖:

- **Question**: the question the decision settled, in a few words.
- **Answer**: one clause. When the user changed the recommendation, name
  what it replaced.
- **Who**:
  - 👤 Human: the user asked for new scope, chose without a recommendation,
    picked another option, changed the recommendation, accepted a draft
    only after feedback that changed it, or set a standing instruction that
    decides it.
  - 👍 Accepted default: the user read the agent's recommendation and
    accepted it as written. When the user asks for new scope and accepts
    the agent's scoping of it as written, record two questions: the ask as
    👤 and the scoping as 👍.
  - 🤖 Agent: the agent decided without asking.
- **Where**: a link to the comment that holds the decision and its details.

Record each decision where it is made, in the ticket's handoff comment or
the map, as a **decision line**:
`- <mark> **<question>** <answer> (<who>, <class>, <where>)`. The mark is 👤,
👍, or 🤖, as in Who. The class is the ask class: `proof-gap`, `review`,
`merge`, `deploy`, `secret`, `design`, `scope`, or `status`. A 🤖 line adds
`Rejected: <option>.` to its answer.
Decisions made in the agent session or a review round, with no ticket
comment or map to hold them, go into one PR comment: the
`leaving-pr-comments` callout, then the decision lines. On the user's own
PR, post it, and each edit that adds or replaces a line, without asking; on
anyone else's PR, after the user approves it. The row's Where links to the
comment, or reads `pending approval` until it is posted. A later line for
the same question replaces the earlier one, and its row replaces the
earlier row.

When the `fleet` CLI is available, `fleet decisions <map URL>` collects a
Wayfinder map's decision lines into the table, and
`fleet decision list --pr <owner/repo#n>` prints the PR's decisions from the
decision ledger as decision lines; add the rows for the PR comment's lines. A decision without a line gets one in the PR comment,
classified from its transcript. With no row, leave the table out, and the
`No load-bearing decisions.` line that `fleet decisions` prints for it.

Put the table and one **Involvement** line under it inside the template's
collapsed agent-context block when it has one; otherwise in a Decisions
section after the evidence. The Involvement line names the grilling rounds
answered, the prototypes iterated with their round counts, the reviews run
(panel lanes and bots), and whether proof was captured. It carries no
numbers beyond those counts. Name only what happened: leave out each part
with nothing on record, and the whole line when nothing is.

A question put to the user without an answer is open, not a decision. List
it on an **Open** line with the recommendation, outside any collapsed
block, at the end of the changes. It blocks the PR until the user answers.
