# Orchestration Wayfinder — stack-runs experiment

This is an experiment. An `implement` ticket runs as a **stack run**: a durable T3 workflow run of [`workflows/wayfinder-stack.ts`](workflows/wayfinder-stack.ts) instead of a `delegate_task` subthread. The run holds the lane's state, survives a T3 restart, waits on checks and merges itself, and asks the human each question in two places at once: on the T3 Workflows page under **Needs you**, and through the conductor's card. The goal is to measure whether durable runs remove the conductor's relay turns and lost lanes, and which of the two places the human answers in.

The experiment is on for a map when its **Notes** carry `Experiment: stack-runs` and the conductor runs in T3 Code. To remove it, delete this file, the `workflows` folder, the **Stack-runs experiment** line in [`SKILL.md`](SKILL.md), and its pointer in [`T3.md`](T3.md).

## Install

Once per machine, before the first stack run:

```sh
ln -sf "<this skill's directory>/workflows/wayfinder-stack.ts" ~/.t3/workflows/wayfinder-stack.ts
t3 workflow list
```

Done when `t3 workflow list` exits 0. When it says workflows are off, the human turns on **Settings → Labs → Workflows**: record an orchestration blocker, cue the human once, and dispatch the map's `implement` tickets as subthreads until it is on.

The link follows this skill's updates. Each change to the workflow body raises its `version` and keeps the old body in the file until no run of that version is open, because T3 refuses a file that drops a version with open runs.

## Start a stack run

1. Render the worker prompt from the map's `lane-implement-thread.md` template per [`LANE.md`](LANE.md): the agent of a stack run is a top-level thread, so it watches its own pull requests. The run adds its report rules to the prompt.
2. Write the run's input to a file and start the run:

   ```sh
   t3 workflow start wayfinder-stack --key "<map URL>/<ticket>/" --input "$(cat <input file>)" --json
   ```

   | Field | Value |
   | --- | --- |
   | `map` | the map URL |
   | `ticket` | the ticket as `<owner/repo#n>` |
   | `stack` | the stack's name on the **Stacks board** |
   | `project` | the code repo's T3 project folder or id |
   | `baseRef` | `origin/<default>`, or the predecessor's pushed branch |
   | `conductor` | this conductor's thread id, from **Conductor address** in [`T3.md`](T3.md) |
   | `brief` | the rendered prompt |
   | `model` | `{ "instanceId", "model", "options": [{ "id", "value" }] }` per **Cast** in [`T3.md`](T3.md) |
   | `runtimeMode` | this conductor's runtime mode |

   Done when it prints the run with its `runId`. The same key returns the same run, so a retried start never doubles a lane.
3. Record the locator on the ticket at once:

   ```md
   <!-- orchestration-wayfinder-dispatch -->

   Runtime: T3 workflow
   Workflow: wayfinder-stack
   Run: <runId>
   ```

   Add the lane to the lane file with runtime `run` and the run id. Set the board row's Thread to the agent thread, `t3-thread://v1/<threadId>`, the `threadId` of step `round/1` in `t3 workflow show <runId> --json`, and its State to `building`.

Hold no `watch_pull_request` and no sweep for a stack run: the agent watches its own pull requests, and the run waits on checks and merges.

## Wake

A stack run wakes the conductor with a message that starts `stack-run <stack> (<ticket>) run <runId>:`. Apply the **Wake law** to the tracker first, then act on its kind:

- **`question <wait>`** → check `t3 workflow questions --json` for that run and wait. Still open: put the question on the conductor's next card per **Human contact** in [`SKILL.md`](SKILL.md), with its choices, recommended first. Already answered: the human answered on the Workflows page, so leave it off the card.
- **`merge word <wait>`** → put the stack's merge rows on the conductor's next card per **Merge** in [`SKILL.md`](SKILL.md), unless the wait is already answered.
- **The human answered a card** → check `t3 workflow questions --json` again. While the wait is open, send the answer with the command the message gave: the listed choice the human's answer means, and the human's words verbatim in `reason` after `via conductor card:`. A merge word the human gave on the card also goes to **Merge** step 3. A wait the human already answered on the Workflows page takes nothing more.
- **`merge word given`** → the human gave the merge word, on the card or on the Workflows page: enqueue it per **Merge** step 3, unless you already did. The run sees the merge itself and sends its agent to `rollout`.
- **`ended <outcome>`** → `completed`: verify the ticket's resolution and drop the lane. `stopped` or `cancelled`: reconcile the ticket per the lane contract in [`SKILL.md`](SKILL.md).

On every wake, also run `t3 workflow list --status paused --json` and read each paused run of this map with `t3 workflow show <runId>`. A paused run waits for a person: resume it once with `t3 workflow resume <runId>` when the cause is gone, such as a provider limit; at its second pause, mark the lane orphaned, reconcile it, and cue the human once.

To stop a lane, run `t3 workflow cancel <runId> --reason "<why>"`. It stops the agent and withdraws the run's questions.

## Measure

When a stack run ends, post one map comment, `stack-runs: <stack>: <n> conductor wakes, <n> answers on the card, <n> on the Workflows page, <n> pauses`, from the run's messages and `t3 workflow show <runId> --json`: an answer from the card carries `via conductor card` in its `reason`. The map's final report sums these lines.
