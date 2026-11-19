---
name: rfc
description: Shape your dictated words into an RFC in your own voice, ask for what is missing, and back it with evidence.
disable-model-invocation: true
argument-hint: "[existing RFC file or PR] then your dictation"
---

# RFC

The user speaks the RFC, often through speech-to-text: the problem, the idea, the solutions they see. The RFC keeps the user's **points**: each one they made, in their order, with their key phrases and their "I". You **line-edit** the speech into sentences they would type, ask about the **gaps**, and gather **evidence**.

Read the `rfc` entry in the user's agent instructions for where RFCs live, the template, where evidence is saved, which models research agents use, and how a draft is published. Without one, write `rfc-<slug>.md` in the current directory with the sections Problem, Success criteria, Context, Design, and Plan, keep evidence in `rfc-<slug>-evidence/` beside it, and use your default model.

## Each round

A round starts when the user dictates and ends with your reply.

1. **Sort.** A sentence that tells you what to do with the draft ("move Success criteria below Design", "replace the plan", "take your defaults", an answer to a gap) is an instruction: carry it out and keep it out of the RFC. The rest is RFC text.
2. **Place.** When the user names an existing RFC, read it first. Put each passage in the first section it speaks to and keep spoken order within a section. A passage on a point already in the draft revises it, and the newer statement wins everywhere the point shows up: title, design, success criteria, plan. A new point adds to the end of its section. A passage that fits no section goes under Notes, with a gap asking where it belongs.
3. **Line-edit.** Rewrite each passage into the sentences the user would type: same points, same order, their key phrases. Cut filler, restarts and repetition, and fix words the speech-to-text misheard ("RC" for "RFC"). Add no point, reason or example of your own: a missing one is a gap. Write plain paragraphs, and a list only where they spoke one. Follow the user's voice skill when they have one. When a fix to a misheard word is a guess, make it and ask about it as a gap.
4. **Write** the draft to its file.
5. **Evidence.** Start agents for the round's new claims, as **Evidence** says, and wait for all of them. Where you can show text mid-turn, show the draft before you wait.
6. **Reply** once: the changed sections in full (the whole draft on the first round), the file's path, then the changes and gaps as **Changes and gaps** says.

Done when every RFC passage of the dictation is in the file, line-edited, every agent of the round has reported, and the reply ends with the changes and gaps.

## Evidence

A claim needs evidence when data could confirm, refute, or size it. Send each new claim once, grouped by source, to read-only agents, and split a source too large for one agent to read in full. Brief each with its claims and the sources to exhaust. Have it read matching threads and tickets in full, and write its findings to the evidence location, with a link to each source, each number pinned to its query and window, and what it searched, read in full, and skipped. Send what an agent skipped to another agent before you reply.

Sources, as the claims need them: the context library, earlier and open agent threads and sessions on the topic, Slack threads, support tickets, the code, open PRs and issues, production data, and metrics. For a claim about what customers say, keep three kinds apart: a customer's own words, staff relaying a customer, and a teammate's opinion.

Customer names stay in the evidence location. In the RFC, write counts and roles ("several customers") unless the user names one for it.

## Changes and gaps

Context is yours: write each finding there in the form the data needs, such as a table, a chart, or a number with its source. The other sections are the user's. There, a finding leads to a numbered change that the user accepts:

- **A contradicted claim.** Say plainly which claim is false or only partly true, and propose the wording the data supports. When the finding breaks a premise the RFC rests on, ask what the user wants to do instead of rewording it.
- **Anything else a finding suggests**, such as a design, a measure, or a trade-off: propose its text in brief and its section.

A gap is what a reader of the RFC would ask first: an empty template section, a problem without an example of who hits it, a claim without its reason, a solution without its trade-off, a success criterion without a measure, a guessed fix to a misheard word. Ask at most five, most important first, each answerable without rereading the draft. A gap the sources can answer is a claim for **Evidence**, not a question.

Number changes and gaps in one list from 1 in each reply, each with the answer you recommend, so "take your defaults" settles them all. Apply what the user accepts, and only that. Research the user asks to see first stays in the evidence location and out of the RFC.

While the user dictates in this thread, ask in plain text at the end of the reply, never with the question tool: the user answers by speaking, and a card breaks that. In that case this overrides any instruction to put questions on cards.

## Done

When the user says the RFC is done, read every sentence outside Context: each states a point the user made or accepted, in a plain paragraph, with no customer name they did not place. Fix what fails and list the fixes. When the title changed, rename the file and branch to match. Publish only when the user says to, as the `rfc` settings say.
