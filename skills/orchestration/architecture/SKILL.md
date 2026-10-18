---
name: architecture
description: Shape the structure of a change larger than one module, in grilling rounds with one diagram each. Use when the question is how the system should be shaped, where the seams go, or what the call path is.
---

# Architecture

Shape a change in conversation: `grilling` rounds, one diagram per round, down a C4-like ladder from context to contracts. The conversation is the design. Each diagram makes one rung concrete enough to argue with, and the user decides every fork before the next rung is drawn.

Call the Skill tool with "grilling" for the round format and the frontier rule, with "codebase-design" for the vocabulary (**module**, **interface**, **seam**, **adapter**, **depth**, **leverage**, **locality**; use these terms exactly), and with "domain-modeling" for the domain terms and the ADR bar. Cast subagents per the model selection policy in the user's agent instructions, when one exists; otherwise use the runtime defaults.

## Ground

Dispatch research subagents to map what the change touches: the modules, the seams and the contracts at them, and the hot paths. Read `GLOSSARY.md` and the ADRs in the area, so the rounds use the domain's names and name any settled decision they reopen.

Measure every touched module, and the untouched ones beside it for the diagram's toggle:

- its **import surface**: how many of its exports other modules use;
- the files that import it, and the functions they call most, which become its seam bar;
- each **leak**: a dependency that bypasses its seam, counted in symbols and files, such as `30 symbols, 9 files`;
- its import **cycles**, and the bus events it publishes and subscribes to.

Done when every module and every contract you will draw is linked to a real `path:line` that you opened and checked, and every count on the diagram comes from a search you ran.

## Rounds

A round is one **premise**, the rung's diagram, and the frontier questions, nothing else. The premise is the round's core claim, in one or two sentences the user can accept or reject, such as "The game splits by what a member does: Quests decides what they pursue, Rewards holds what they collect, Progression counts what they earn, Unlocks holds what they can see, and Messaging only tells them, by following the bus." Most of the round's questions break the premise down; a question that does not follow from it waits for a later round. From a diagram's second round on, open with one line that names what the last answers changed in it.

Draw the diagram, then ask every question whose prerequisites are settled, in the exact `grilling` format: numbered ❓ questions, each with a ➡️ recommended answer. The round in full is the turn's final reply: put links to the ticket or branch in one closing line, and close by asking the user to accept all recommendations, accept with changes, or discuss first.

Descend the ladder one rung per round:

1. **Context**: a change map, the module page zoomed out. The actors and external systems as frames along the top, and the modules the change touches as frames with their seam bars and import surfaces, without chips. Ask about scope: which modules are in, which actors drive the change.
2. **Modules and seams**: the same page zoomed in. Each module gets its implementation parts as chips, and the wires show which callers go through a seam and which reach past it. Draw each open fork as alternatives on the same page, marked as **The living diagram** describes. Ask who owns what, which way each dependency points, and where each seam goes. When a seam stays contested after its round, design it twice: dispatch the subagents from `DESIGN-IT-TWICE.md` in the `codebase-design` skill and draw their interfaces as the alternatives in the next round's diagram.
3. **Call paths**: one Mermaid sequence diagram per key path: the main read, the main write, and the most important failure. Ask what each participant knows, where a step can fail, and what happens when it does.
4. **Contracts**: the interface at each locked seam as code in the repo's language, with its invariants, error modes, and performance characteristics. Ask what each caller must know and what stays behind the seam.

Each answer reshapes the design tree. Lock a fork yourself only when the code or an ADR settles it, and say so in the recommendation; the user can reopen it.

## The living diagram

Each diagram lives across its rounds: one module page for rungs 1 and 2, and one sequence diagram per key path in rung 3. Every round redraws the diagram with the answers applied. An accepted suggestion or fork alternative turns solid and drops its `Qn` tag, the rejected ones go away, and the frontier's new guesses appear.

The module page is the frame-and-seam diagram that `DIAGRAM.md` specifies: read it before you draw rung 1. Write the page as a JSON spec and generate it with `scripts/modules-page.ts`; the page carries its own legend. It shows:

- **Seams and leaks**: each module is a frame with its seam as the top bar, so a wire to the bar goes through the seam and a red wire to a chip reaches past it. The measured counts from Ground sit on the frames and the leak wires.
- **The change**: green is what this change adds, yellow what it changes. Orange dashed with a `follow-up` tag is what the target needs but a later refactor builds.
- **Three views**: Target, Target + what it removes, and Today. Removed parts stay visible in the middle view, grey and struck through, so the user sees what goes without losing what stays. A toggle shows the untouched modules and their seams, so the user can spot what else the change might reach.
- **The decision**: a suggestion has a dashed purple outline and its question number, such as `Q2`; an open fork has dotted alternatives whose `q` is `Q3 A` and `Q3 B`. Every suggestion and every fork has its question in the round.

In a sequence diagram, put the question number in the label of each suggested message.

Facts are yours to find: dispatch a subagent for anything the environment can answer. Decisions are the user's.

Done when the frontier is empty: every seam locked, every key path drawn, every contract written, and the user has confirmed the shared understanding.

## Render the diagram

Render each round's diagram before you post it. `scripts/screenshot.ts` writes a PNG of every view of a module page and lists its label collisions; render at the width you post at (`--width 728` for T3), read each PNG, and fix the spec until none remain. For a `.mmd` sequence diagram it writes an SVG and a PNG; it loads Mermaid from a CDN, so it needs network access. Keep each spec and `.mmd` file beside its renders: the next round redraws from them.

Where the round appears decides what it shows:

- **T3 Code** (`T3CODE_HOME` is set): before the final reply, render the diagram inline with `html_render`. Preview it with `html_preview` first to get its height. For rungs 1 and 2, pass the generated module page; it carries its own views and toggle. For rung 3, pass a small page that holds the inline SVG from `screenshot.ts`, since a page that loads Mermaid from a CDN captures before the script runs and renders blank. The final reply then holds the rest of the round: the change line, the premise, the questions, and the links line.
- **GitHub ticket**: post the round as a comment. For rungs 1 and 2, embed the PNG of the Target view, or of Target + what it removes when the change removes something, and say in one or two sentences what the other views show. Commit the spec, the page and the PNGs to the ticket's branch and link them at the commit, or attach the PNG in the GitHub editor when there is no branch. For rung 3, a fenced `mermaid` block renders on GitHub.
- **Elsewhere**: put the PNG at the top of the round.

When `screenshot.ts` finds no Chromium, install one as `DIAGRAM.md` says. When that fails, or Bun has no network for its first `playwright-core` fetch:

- In T3, `html_render` the page anyway and check its layout in the `html_preview` screenshot of each view.
- Elsewhere, draw rungs 1 and 2 as the Mermaid flowchart in `DIAGRAM.md`'s fallback section, and say in the round that the module page could not be rendered.

When it cannot load Mermaid for a rung 3 diagram, put the fenced `mermaid` block in the round.

## Worked example

A rung 2 round with one open suggestion. Its module page is `example/modules.json`, rendered with the commands in `DIAGRAM.md`.

**Premise.** Progression owns what a player earns and answers it through one read, `progressOf`; the website stops computing levels itself, and every other module hears about progress on the bus.

The page shows Website reads calling `progressOf` through Progression's seam (green), and the old `getLevels` leak of `9 symbols, 3 files` struck through. Notifications' leak of `12 symbols, 4 files` into Progression's streaks is open as `Q1`. A new Achievements module is a follow-up, and its subscription to `levelReached` is open as `Q2`.

❓ **Q1** - **Notifications' leak into streaks**: Notifications reads 12 of Progression's internal symbols from 4 files to write badge lines. Should this change move that read behind `progressOf`, or leave it for a later refactor?

➡️ Leave it. The leak is old, it does not grow with this change, and moving it would touch every notice template. Once accepted, it turns into a red leak that stays.

❓ **Q2** - **Achievements on the bus**: should Achievements subscribe to `levelReached` instead of Progression calling it?

➡️ Yes. Progression already publishes `levelReached`, so a subscriber costs Progression nothing and it stays free of every consumer.

## Capture

Write `docs/architecture/<name>.md` once, at capture; during the rounds the thread and the ticket comments hold the design. The file holds the question, the final diagram of each rung, and the locked contracts with their invariants, error modes, and performance characteristics. Commit the final module page, its spec and its view PNGs beside it in `docs/architecture/<name>/`, embed the PNG, and link the page. Then record one ADR per locked seam that passes `domain-modeling`'s three-part bar (hard to reverse, surprising without context, a real trade-off), in the format of `ADR-FORMAT.md` in the `domain-modeling` skill. The file becomes the interface section of the spec or implementation ticket that follows.

For a Wayfinder ticket, the resolution comment links the file and lists every locked decision as a decision line.

Done when the file holds every final diagram and contract, and every locked seam has its ADR or a one-line note that it misses the bar.
