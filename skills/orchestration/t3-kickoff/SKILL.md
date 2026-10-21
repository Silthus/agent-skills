---
name: t3-kickoff
description: Start, watch, archive, or delete T3 Code threads from the command line, and move the current work to another machine as a new T3 thread. Use when asked to spawn, kick off, or hand work to a separate T3 thread or session, to wait for a T3 thread's turn to end, to archive or delete a T3 thread, or to hand off or move the current work to another machine, such as "hand this off to box 1".
---

# T3 kickoff

`scripts/kickoff.ts` in this skill's directory does what the T3 web client does on the first message of a new thread: it creates the thread, the worktree, and the first turn in one command against the running T3 server. It reads the server address from `~/.t3/userdata/server-runtime.json`, issues a short bearer session with the server's own binary, and revokes the session when it exits. The token stays in memory. Never print it.

Below, `kickoff` means `bun <this skill's directory>/scripts/kickoff.ts`.

Run it on the machine whose T3 server owns the thread. For a remote box, run it over SSH in a login shell, so `bun` is on `PATH`. Use the path where the skill is installed on that box:

```sh
ssh <host> 'bash -lc "bun <skill directory on host>/scripts/kickoff.ts --dry-run ..."'
```

## Settings

Settings live in `~/.config/t3-kickoff/settings.json`, a JSON object of strings. An environment variable overrides each key. Agents that the T3 server starts do not always inherit the shell environment, so prefer the file.

| Key | Environment variable | Meaning |
| --- | --- | --- |
| `availabilityFile` | `T3_KICKOFF_AVAILABILITY_FILE` | A local provider availability report. |
| `remoteScript` | `T3_KICKOFF_REMOTE_SCRIPT` | The absolute path to `kickoff.ts` on a handoff target. |

`kickoff` reads only these files, and only when they exist:

- `~/.config/t3-kickoff/settings.json`: the settings above.
- `~/.config/t3-kickoff/workspace-safety.json`, else `~/.config/fleet/workspace-safety.json`: the workspace safety policy.
- The `availabilityFile` report, or, without that setting, the output of `fleet availability` when the `fleet` CLI is available (on `PATH` or at `~/dev/fleet/fleet`; the one on `PATH` wins).

Without any of them, `kickoff` makes no workspace or quota check.

- **Workspace safety policy.** The file is `{"protectedRoots": ["<path relative to home>"]}`. `kickoff` refuses to launch in a protected root. The check follows symlinks and verifies the Git common directory, so a linked worktree outside the root is also refused if its Git metadata lives there. Use this for a checkout that a workspace template owns: the refusal preserves the checkout, and the agent uses an independent clone instead.
- **Provider availability.** Before a launch, `kickoff` refuses a model whose provider has a fresh `exhausted` status in the report. The report is JSON: `{"checkedAt": "<ISO time>", "providers": {"claude": "available|exhausted|unknown", "codex": "..."}}`. A report older than 11 minutes counts as `unknown`, and `unknown` never blocks.
- **Free disk.** `kickoff` refuses a new worktree, and a `--clone` that has to clone, while the machine it runs on has less than 10 GB free, because one PostHog worktree takes 5 to 8 GB and one more worktree or clone can fill the disk and crash T3 with every thread on it. It checks right before each, so a clone that uses the room also stops the worktree after it. `--worktree none` on a known project still runs, and so does a launch on a machine with room. `--dry-run` skips the check. It needs no file.
- **Remote script.** `kickoff handoff` runs the t3-kickoff skill on the target from `~/.agents/skills`, `~/.claude/skills`, or `~/.codex/skills`, unless `remoteScript` names another path.

## Start a thread

1. Write the prompt to a file. The prompt is the thread's first user message, so it carries the full task, the context, and the report the thread owes back.
2. Pick the flags:
   - `--project <name|id|repo>`: a project the server knows, by title, id, or repository such as `github.com/acme/app`. A wrong name lists the known projects. Add `--clone <git-url>` to clone the repository into `~/dev/<name>` and add it as a project when none matches.
   - `--title "<title>"`: the thread title. Add `--auto-title` to let the server replace it.
   - `--model <slug>`: choose with the model selection policy in the user's agent instructions, when one exists; otherwise the runtime defaults. Pass it explicitly. A wrong slug lists the offered slugs.
   - `--worktree new|none`: `new` checks out `origin/<base>` into a fresh `t3code/<hex>` worktree and runs the project setup script; `none` runs in the project checkout. `--base` sets the base branch (default `master`).
   - `--plan` starts in plan mode. `--help` lists the rest.
3. On a machine that has not run the script before, run the command with `--dry-run` first. Done when it prints `dry run ok: project ... offers <model>`.
4. Run the command without `--dry-run`:

   ```sh
   kickoff --project app --title "Fix the export" \
     --provider <selected-provider> --model <selected-model> --worktree new --prompt-file /tmp/prompt.md
   ```

   Done when it prints the thread id on stdout and `turn started` on stderr. Report the thread id and the worktree path.

Start threads one at a time. Two parallel starts race on `git fetch origin` in the same repository. Wait for `turn started` before the next one.

## Watch a thread

```sh
kickoff status --thread <thread-id>
kickoff wait --thread <thread-id> [--after <turn-id>] [--timeout <sec>]
```

`status` prints one JSON line: the latest `turn` (the run id), its `state` (`preparing`, `queued`, `starting`, `running`, `waiting`, `completed`, `failed`, `interrupted`, or `cancelled`), `startedAt`, `completedAt`, the thread's last `error`, and `gone`. `gone: true` means the thread is archived or deleted: the server no longer serves it.

`wait` returns when a turn newer than `--after` ends or the thread is gone. It prints the status line and exits 0, or exits 2 at `--timeout` (default 5400). Run it as a background command, so that its exit is the wake. To wait for the next turn, pass the last `turn` as `--after`.

## Stop or archive a thread

```sh
kickoff stop --thread <thread-id>
kickoff archive --thread <thread-id>
```

`stop` detaches the provider sessions and keeps the thread in the sidebar. `archive` archives the thread; the server releases its sessions. The worktree and its branch stay. `delete` cannot find an archived thread. `archive --when-idle` first waits for the running turn to end, so a thread can archive itself from a detached process.

## Move the work to another machine

When the user asks to hand off or move the current work to another machine, follow [REMOTE.md](REMOTE.md). It uses `kickoff handoff --to <alias> --prompt-file <doc>`, which moves the calling thread to that machine. The `handoff` skill writes the document.

## Delete a thread

```sh
kickoff delete --thread <thread-id> [--keep-worktree]
```

It deletes the thread and removes the worktree and its `t3code/` branch unless another thread uses them or `--keep-worktree` is set.

## Scripts

- `scripts/kickoff.ts`: the command.
- `scripts/threads.ts`: the status line and the rule for when `wait` returns.
- `scripts/handoff.ts`: the calling thread, project matching by repository, and the remote command for `handoff`.
- `scripts/server.ts`: finds the running server and its binary. On Linux it reads `/proc/<pid>/exe`. On macOS the desktop app runs the server through Electron, so it takes the executable and the server script from `ps` and runs them in Node mode.
- `scripts/settings.ts`: reads the settings file and its environment overrides.
- `scripts/availability.ts`: reads the provider availability report.
- `scripts/disk.ts`: the free disk floor for a new worktree or clone.
- `scripts/workspace-safety.ts`: applies the workspace safety policy.

Run the tests with `bun test` in this directory.
