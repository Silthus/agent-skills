---
name: rfc
description: Shape your dictated words into an RFC in your own voice, ask for what is missing, and gather evidence in the background.
disable-model-invocation: true
argument-hint: "[existing RFC file or PR] then your dictation"
---

# RFC

The user speaks the RFC, often through speech-to-text: the problem, the idea, the solutions they see. Their words go into the RFC **verbatim**: their words, their order, their emphasis, their "I". You **copyedit** them into the RFC's sections, ask about the **gaps**, and gather **evidence** in the background.

Read the `rfc` entry in the user's agent instructions for where RFCs live, the template, where evidence is saved, which models research agents use, and how a draft is published. Without one, write `rfc-<slug>.md` in the current directory with the sections Problem, Success criteria, Context, Design, and Plan, keep evidence in `rfc-<slug>-evidence/` beside it, and use your default model.

## Each round

A round starts when the user dictates and ends with your reply.

1. **Sort.** A sentence that tells you what to do with the draft ("put F3 under Design", "replace the plan", an answer to Q2) is an instruction: carry it out and keep it out of the RFC. The rest is RFC text.
2. **Place.** When the user names an existing RFC, read it first. Put each passage in the first section it speaks to and keep spoken order within a section. A passage adds to the end of its section unless the user says it replaces one. A passage that fits no section goes under Notes, with a gap asking where it belongs.
3. **Copyedit.** Change only grammar, punctuation, filler words ("um", "like", a restarted sentence), words the speech-to-text misheard ("RC" for "RFC"), paragraph breaks, and spoken lists into bullets. Every other word stays verbatim. When a fix to a misheard word is a guess, make it and ask about it as a gap.
4. **Write** the draft to its file.
5. **Evidence.** Start agents for the round's new claims, as **Evidence** says, and reply without waiting for them.
6. **Reply.** The whole draft on the first round, then the changed sections in full and the file's path. Then the findings that landed since the last reply, then the gaps.

Done when every RFC passage of the dictation is in the file, copyedited, and the reply ends with the gaps.

When agents finish between rounds, reply with their findings alone.

## Gaps

A gap is what a reader of the RFC would ask first: an empty template section, a problem without an example of who hits it, a claim without its reason, a solution without its trade-off, a success criterion without a measure, a guessed fix to a misheard word. Ask at most five, most important first, each answerable without rereading the draft. Number them Q1, Q2, and so on, from Q1 in each reply.

Ask them in plain text at the end of the reply, never with the question tool: the user answers by speaking, and a card breaks that. This overrides any instruction to put questions on cards.

## Evidence

A claim needs evidence when data could confirm, refute, or size it. Send each new claim once, grouped by source, to at most five read-only agents a round. Brief each with its claims and sources, and have it write its findings to the evidence location, with a link to each source and each number pinned to its query and window.

Sources, as the claims need them: the context library, earlier and open agent threads and sessions on the topic, Slack threads and requests from users and teammates, the code, open PRs and issues, production data, and metrics.

Number findings F1, F2, and so on, continuing across the session. Report each in one line: what it shows, and the path to its saved file. Mark a finding that contradicts the draft. Customer names and internal numbers stay in the evidence location until the user places them.

## Inserts

A finding enters the RFC only when the user names it and where it goes; when they name it without a place, ask where. Then write it yourself, in the form the data needs: a table, a chart, a number with its source, or an explainer. Inserts are the only text in the RFC that is not the user's.

## Done

When the user says the RFC is done, compare each sentence with the dictation and restore the user's wording where it drifted. Publish only when the user says to, as the `rfc` settings say.
