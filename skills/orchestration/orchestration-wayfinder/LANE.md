# Orchestration Wayfinder — lane prompts

Read this before the first dispatch. Every ticket worker's prompt, a successor's included, is rendered from the map's **template** for its ticket type, never copied from another lane's prompt.

## Template

Write one template per ticket type at `$(git rev-parse --git-common-dir)/wayfinder/<map>/lane-<type>.md` in the conductor's checkout, and one for its successors at `lane-<type>-successor.md`, which adds `{{transcript}}`, the predecessor's transcript path or thread id, and in T3 Code also `{{branch}}`. In T3 Code, split the first by runtime instead: `lane-<type>-<child|thread>.md`. Put `{{ticket}}` wherever the ticket number goes: the title, every `gh issue` command and issue URL, the branch, and the lease name. Each other per-ticket value gets a one-line `{{name}}` placeholder; longer context stays on the ticket, behind a pointer. The template carries:

- the map URL, the code repo, and the ticket, as context pointers per **Shared notes** in [`SHIP.md`](SHIP.md);
- the wall-time cap, the ticket claim, the durable park and resolution protocol, the report before idle, and that downstream dispatch belongs to the conductor;
- the prescribed skill, and the order to read its `SKILL.md` directly when the Skill tool refuses it, as it does `to-spec`;
- **Casting** from [`SKILL.md`](SKILL.md), and the `fleet` CLI's resolved path;
- for an `implement` or `ship` ticket, its section of [`SHIP.md`](SHIP.md), and the spec's integration branch and its `Base` when it has one;
- for a ticket that runs code, the lease line from **Compute lease** in [`SKILL.md`](SKILL.md) while the map's **Notes** record it;
- each line the **Dispatch contract** in [`SKILL.md`](SKILL.md) adds for the ticket's type, and the review outage while the map's **Notes** record one;
- the **lane rules** below, verbatim.

Give each ticket that adds numbered rules to a spec its own range, such as `LP93–LP97` and `LP98–LP102`, so two tickets never claim the same numbers. Record the ranges in the map's **Notes** and pass each with `--set rules=<range>`, so a re-rendered prompt gets the same one; a ticket that adds none passes `--set rules=none`.

## Render

```sh
bun <this skill's directory>/scripts/lane-prompt.ts <template> <ticket> --allow <map>,<n>,... [--set <name>=<value>]... > <prompt file>
```

`--allow` lists every other ticket the prompt names on purpose: the map, the spec, and siblings. Done when it exits 0. On a refusal, a stray ticket number or an empty placeholder, fix the template and render again.

## Lane rules

```md
- Wait on a condition with `Monitor` and an `until` loop, or, outside T3 Code, with a background command whose completion notice wakes you; a single foreground call stops at 600 s. In Claude Code, load `Monitor` with `ToolSearch` first. Never repeat `sleep N; <check>` across turns: each turn reads your whole context again.
- Leave nothing running: before any turn that ends waiting on the human, a park included, and before your last turn, stop everything you started, such as a background `kickoff wait`, a watcher, a monitor, a subagent, or a child task. Anything left live keeps your thread, and the conductor's, off the human's inbox.
- Run the lane gate the repo's agent docs name, or its full local gate when they name none; CI runs the full gate on the pull request. The repo's docs own its commands and settings, such as worker counts.
- Run every gate and check unpiped, or start the same command with `set -o pipefail;`, and read its exit code before you push or merge.
- `rm` takes literal paths.
- Before a production action that fans out and cannot be undone, such as a job over every channel or every user: give the job a kill switch it checks before each unit, run it on one unit, and park until the human has looked at that unit's visible effect.
- Before you merge a pull request, post a ticket comment `Still owed after merge: <steps>` that lists every step left, such as a flag rollout, a log watch, and the resolution. After the merge, edit it to start with `Merged <sha>.` Any thread can finish the lane from it.
- To save a memory, update the topic note that covers it, or add one topic note when none does.
```
