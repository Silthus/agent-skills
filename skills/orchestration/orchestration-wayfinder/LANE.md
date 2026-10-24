# Orchestration Wayfinder — lane prompts

Read this before the first dispatch. Every worker prompt, a successor's included, is rendered from the map's one **template**, never copied from another lane's prompt, whose ticket number survives in every command the edit misses.

## Template

Write the template once per map, at `$(git rev-parse --git-common-dir)/wayfinder/<map>/lane-template.md` in the conductor's checkout. Put `{{ticket}}` wherever the ticket number goes: the title, every `gh issue` command and issue URL, the branch, and the lease name. Each other per-ticket value, such as the prescribed skill or a successor's park context, gets a `{{name}}` placeholder of its own. The template carries:

- the map URL, the code repo, and the ticket, as context pointers per **Shared notes** in [`SHIP.md`](SHIP.md);
- the wall-time cap, the ticket claim, the durable park and resolution protocol, and the report before idle;
- the prescribed skill, and, for when the Skill tool refuses it as it does `to-spec` and `to-tickets`, the order to read its `SKILL.md` and follow it directly;
- that downstream dispatch belongs to the conductor;
- **Casting** from [`SKILL.md`](SKILL.md);
- for an `implement` or `ship` ticket, its section of [`SHIP.md`](SHIP.md), the spec's integration branch, and its `Base`;
- for a ticket that runs code, the lease line from **Compute lease** in [`SKILL.md`](SKILL.md) while the map's **Notes** record it;
- the **lane rules** below, verbatim.

When two tickets add numbered rules to the same spec, give each its own range in a `{{rules}}` value, such as `LP93–LP97` and `LP98–LP102`, so neither renumbers late.

## Render

```sh
bun <this skill's directory>/scripts/lane-prompt.ts <template> <ticket> --allow <map>,<n>,... [--set <name>=<value>]... > <prompt file>
```

`--allow` lists every other ticket the prompt names on purpose: the map, the spec, and siblings. Done when it exits 0. On a refusal, a stray ticket number or an empty placeholder, fix the template and render again.

## Lane rules

```md
- Leave nothing running. Wait on a condition with `Monitor` and an `until` loop, or with a background command and its completion notice; a single foreground call stops at 600 s. End every turn, a park included, with nothing you started still live: no background command, watcher, monitor, subagent, or child task. In T3 Code, anything left live keeps your thread, and the conductor's, on the Working shelf, so your park never reaches the human's inbox.
- Run the gate the repo's agent docs name for a lane; CI runs the full gate. The repo's docs own its commands and settings, such as worker counts.
- Run every gate and check unpiped, or under `set -o pipefail`, and read its exit code before you push or merge.
- `rm` takes literal paths.
- Before a production action that fans out and cannot be undone, such as a job over every channel or every user: run it on one unit, give the job a kill switch it checks before each unit, and park until the human has looked at that unit's visible effect.
- Before you merge, post a ticket comment `Merged, still owed: <steps>` that lists every step left after the merge, such as a flag rollout, a log watch, and the resolution, so any thread can finish the lane.
- To save a memory, update the topic note that covers it, so the memory index stays small.
```
