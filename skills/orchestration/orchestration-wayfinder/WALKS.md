# Orchestration Wayfinder — walks experiment

This is an experiment. A spec states each changed user journey as a **walk**: an [`e2e`](https://e2e.tester.army) test file in plain-language steps that the human approves with the spec. The stack thread that builds the journey runs the walk as its `ui-walk` proof. The goal is a proof contract that the human approves before the build starts, so the screenshots show a walk that someone agreed to.

The experiment is on for a map when its **Notes** carry `Experiment: walks`. To remove it, delete this file and the **Walks experiment** line in [`SKILL.md`](SKILL.md).

## Walk

A walk is one `*.e2e.ts` test for one journey, from entry to result. Each stage has three parts:

1. An `agent.act` goal that states what the user does, in the words of the spec.
2. A check that the stage worked: `agent.assert` in the spec, firmed up into a locator `expect` during the build.
3. `app.screenshot("<stage label>")`, where the label states the result as a product sentence, such as "The GM picked the next Session".

The goals and the stage labels are the contract. The locators are the implementation.

- Give each goal one action. Name the route in the goal when the route is the feature, such as "schedule it from Best nights". Otherwise the agent can reach the result another way.
- After a navigation, use `agent.waitFor`, because `agent.assert` judges one snapshot.
- When the UI updates optimistically, reload before the check, so that only saved data can pass it.
- Make a check prove its sentence. A label that a check does not prove is a finding.

## Spec

The `spec` worker writes one walk for each journey that the spec adds or changes in a browser UI. A spec with no browser UI change has no walks.

- Put the walks in a **Walks** section of the draft, one fenced `ts` block each, with `agent.act` and `agent.assert` only. No UI exists yet, so the spec has no locators.
- The spec pass reads the walks as part of the draft.
- The park presents the walks in full in the final reply, before the question. The human approves the walks with the draft.
- `to-tickets` gives each walk to the stack that completes its journey. The stack's ticket links the walk's section of the spec. An earlier slice of the journey proves its own stages with a `ui-walk` by hand.

## Build

The stack thread commits the walk with the pull request that completes the journey.

- When the code repo has no `e2e.config.ts`, the walk stays in the spec. Follow its stages by hand for the `ui-walk` proof and name each screenshot with its stage label. Do not install e2e in the code repo unless the human asks for it.
- When the code repo has an `e2e.config.ts`, add the walk under the path that the config's `tests` globs name. Firm up each `agent.assert` into a locator `expect` where the UI allows, and keep the goals and the labels.
- A wording fix that keeps a goal's meaning is allowed. A change that adds, removes, or changes the meaning of a stage or a label is a park: show the approved walk beside the new one and ask the human.
- Put the difference from the approved walk in the pull request description, or write "Walk as approved."

## Proof

Run the walk locally, as the repo's agent docs and its e2e config name. A subscription login does not work in CI, so the walk is not a CI check.

- Save the stage screenshots with `fleet proof save --kind ui-walk`. Fleet does not accept `trace.md`, so post the trace of the passing run as a ticket comment. In a public map tracker, put it in a private note that the comment names.
- The model can share its plan limits with the review provider. Run the walk before the review, and record a 429 as a review outage per the **Dispatch contract** in [`SKILL.md`](SKILL.md).

## Walk notes

The experiment is judged on these notes. Each stack thread that runs a walk adds a **Walk notes** section to its handoff comment:

- The number of goals and labels that changed after approval, and the reason for each.
- Runs, passes, and wall time.
- Each check that passed while its sentence was false, and how it was found.
- One line on whether the walk was easier to review than the screenshots alone.
