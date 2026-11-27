---
name: architecture
description: Shape the structure of a change larger than one module, in grilling rounds that each open with a plain explainer. Use when the question is how the system should be shaped, where the seams go, or what the call path is.
---

# Architecture

Shape a change in conversation, in `grilling` rounds that each open with an **explainer**: plain prose that a reader who has followed none of the work can read cold. The conversation is the design. You find the facts, and the human makes every decision. The rounds also weigh **deepening while we're here**: the refactors in the modules the change touches that the change makes cheap now.

Call the Skill tool with "grilling" for the round format and the frontier rule, with "codebase-design" for the vocabulary (**module**, **interface**, **seam**, **adapter**, **depth**, **leverage**, **locality**, and use these terms exactly), and with "domain-modeling" for the domain terms and the ADR bar. Cast subagents per the model selection policy in the user's agent instructions, when one exists. Otherwise use the runtime defaults.

## Ground

Dispatch research subagents to map what the change touches: the modules, the seams and the contracts at them, and the hot paths. Read `GLOSSARY.md` and the ADRs in the area, so the rounds use the domain's names and name any settled decision they reopen.

Collect the **ideas on the table**: every option the human, the ticket and teammates have proposed, each under the name of the person who proposed it. Give each idea a finding: what it changes compared with today, what it costs, and the evidence behind both. Read every research finding the rounds will cite in the original, not in someone's one-line summary of it. Measure what a round's argument rests on, such as a leak a seam question cites, counted in symbols and files.

Then dispatch one subagent to look for deepening while we're here. Give it the change, the map, `GLOSSARY.md` and the ADRs, and limit it to the touched modules and their direct neighbours. Ask it to step back from the feature and answer four questions:

- Where does the change bounce between shallow modules?
- Which leak or cycle makes the change harder than it needs to be?
- Which modules would merge into one deeper module?
- Where would it draw the seams if it designed this area today?

It returns a one-line deletion-test verdict for every touched module, and its **deepening opportunities**. Each opportunity names the modules, the friction, the deeper shape, any ADR it reopens, and a strength: Strong, Worth exploring, or Speculative. One of them is bold, the module map it would choose if there were no feature to ship.

Done when every module, contract and number the rounds will cite links to a `path:line` or a finding you opened and checked, every idea on the table has its finding, and the deepening report has a verdict for each touched module and names one bold opportunity.

## The explainer

Round 1 opens with the full explainer, one short heading per part, in this order:

1. **Why this runs now.** What triggered the work, who asked, and what this session must decide.
2. **How it works today.** The path the change touches, step by step, with the facts that matter: where the time, the memory or the failures go.
3. **The ideas on the table.** Each idea as its author put it, the human's own ideas first.
4. **What the research found.** For each idea, how it differs from today and what that costs. When the ideas compare on the same points, a table of today against each option carries it, the one table in the round.
5. **Where the real problem is.** The cause the evidence points to, and which ideas reach it.
6. **Whether this needs a session.** Whether the work already planned answers the question. When it does, say so and recommend stopping: that is round 1's only question.

Every later round opens with a short paragraph: what the last answers changed, and what this round decides.

Done when a reader who has seen none of the research can say why each question is asked and what each option means without opening a link.

## Rounds

A round is the explainer, then the frontier questions in `grilling`'s format: numbered ❓ questions, each with its ➡️ recommended answer, the whole frontier at once. Post the round as text in the turn's final reply, so the human answers in their own words, by number. Put links to the ticket or branch in one closing line, and close by asking the human to accept all recommendations, accept with changes, or discuss first.

Every fork is the human's. A fact the code or an ADR settles goes into the explainer as a fact, with its `path:line`, and the human can still question it. A finding against the human's own idea goes in as a question with its evidence. A decision is locked when the human has answered it.

Work through these concerns in order, one or more per round, and skip any that has nothing open:

1. **Context and scope.** Which ideas stay on the table, which modules and actors are in scope, and which extra modules a deepening opportunity would pull in.
2. **Seams and ownership.** Who owns what, which way each dependency points, and where each seam goes. Ask about each Strong deepening opportunity: this change, a follow-up, or not at all. Recommend this change when the opportunity moves a seam the feature already moves. Ask about the bold opportunity too, even when you recommend against it. When a seam stays contested after its round, design it twice: dispatch the subagents from `DESIGN-IT-TWICE.md` in the `codebase-design` skill, and put their interfaces side by side in the next round.
3. **Call paths and failures.** The main read, the main write, and the most important failure. Ask what each participant knows, where a step can fail, and what happens when it does.
4. **Contracts.** The interface at each locked seam, as code in the repo's language, with its invariants, error modes, and performance characteristics. Ask what each caller must know and what stays behind the seam.

Each answer reshapes the design tree. When the human rejects an opportunity for a reason a later session would need, offer to record it as an ADR, so no one suggests it again.

Done when the frontier is empty and the human has confirmed the shared understanding.

## Diagrams

A round gets a diagram only when the mechanism hides something the prose cannot show as fast: calls in order across services, a path that branches, state that changes over several calls, a wait. Call the Skill tool with "explainer" for the form that fits the mechanism, its drawing rules and its render script, and put the diagram under the explainer part it illustrates. A diagram that returns in a later round is redrawn with the answers applied. In T3 Code, `html_render` a small page that holds the rendered SVG or PNG; on a GitHub ticket, a fenced `mermaid` block renders as it is.

## Worked example

Round 1 for moving a game's badges out of Notifications.

> **Why this runs now.** Notifications breaks whenever Progression changes its streak tables, three times this quarter. The ticket asks where badge rules should live before the streak rewrite lands.
>
> **How it works today.** When a player levels up, Progression writes the level and publishes `levelReached`. Notifications then reads Progression's streak tables directly, through 12 internal symbols in 4 files, to decide which badge line to send.
>
> **The ideas on the table.** Sam: Notifications calls a new `progressOf` read on Progression. The ticket: a new Achievements module owns badge rules and subscribes to `levelReached`.
>
> **What the research found.**
>
> | | Today | `progressOf` | Achievements |
> | --- | --- | --- | --- |
> | Who knows the badge rules | Notifications | Notifications | Achievements |
> | Breaks on a streak rewrite | Yes | No | No |
> | New code | None | One read, 4 call sites | One module, one subscriber |
>
> **Where the real problem is.** The breakage comes from the direct reads, and both ideas remove them. They differ in who owns the badge rules.
>
> **Whether this needs a session.** Yes. The streak rewrite will change Progression's interface, and this decides what that interface is.

❓ **Q1** - **Notifications through the seam**: should Notifications read progress only through `progressOf`, in this change?

➡️ Yes. The streak rewrite changes Progression's interface anyway, and the move costs four call sites.

❓ **Q2** - **Achievements on the bus**: should a new Achievements module own the badge rules as a follow-up, subscribing to `levelReached`?

➡️ Yes, as a follow-up. Progression already publishes the event, and the rewrite does not need the move.

## Capture

Write `docs/architecture/<name>.md` once, at capture. During the rounds, the thread and the ticket comments hold the design. The file holds the question, the explainer as it stood at the last round, the last version of each diagram, and the locked contracts with their invariants, error modes, and performance characteristics. List the follow-ups: each opportunity the human moved to a follow-up, and each one the rounds did not ask about, with its strength. Then record one ADR per locked seam that passes `domain-modeling`'s three-part bar (hard to reverse, surprising without context, a real trade-off), in the format of `ADR-FORMAT.md` in the `domain-modeling` skill. The file becomes the interface section of the spec or implementation ticket that follows.

For a Wayfinder ticket, the resolution comment links the file and lists every locked decision as a decision line.

Done when the file holds the final explainer, every final diagram, contract and follow-up, and every locked seam has its ADR or a one-line note that it misses the bar.
