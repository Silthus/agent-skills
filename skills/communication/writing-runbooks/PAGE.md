# The runbook page

Copy this into `runbooks/<alert-name>/README.md` and replace every `<...>`.

````markdown
# <Alert title, exactly as the notification shows it>

Tested <YYYY-MM-DD> on <environment> by <name>.
Stuck for 15 minutes? Page <person or rotation>. Do not wait.
Agents: read [AGENT.md](AGENT.md).

Users see: <what is broken for them, in one sentence>.

## Stop the bleeding

1. [safe] Open the <name> graph: <full URL with the time range>
   You see: a line above <number>.
   Line below <number>? It recovered by itself. Go to step 5.

2. [safe] Copy and run:
   ```sh
   <full command, every flag spelled out>
   ```
   You see: `<the line that proves the cause>`
   Not that? Go to step 4.

3. [human] Copy and run:
   ```sh
   <the fix>
   ```
   You see: `<what the fix prints>`
   Costs: <what it breaks or loses, with numbers>.
   Undo: `<the command that reverts it>`

4. [safe] Wait 5 minutes. Look at the graph from step 1 again.
   You see: the line below <number>.
   Still above? Page <person or rotation> now.

5. [safe] Post this in <incident channel>:
   ```text
   <alert> mitigated at <time>. Ran steps <n>. Details tomorrow.
   ```
   You see: your message in the channel. Go back to sleep.

## Morning

<Links to dashboards, the design doc, and how to find the root cause.>
````

## A step

Every step has these parts, in this order:

- **The number and a tag.** `[safe]` means read-only, or reverts on its own, like a scale-up. An agent may run it. `[human]` means it changes production in a way that is hard to undo, or touches customer data. Only a person runs it, and the step adds `Costs:` and `Undo:` lines.
- **One action.** One link to open or one command to copy, never both. A command sits alone in a fenced code block so a phone copies it in one tap.
- **`You see:`** The exact text, number, or shape that proves the step worked. Copy it from your test run.
- **A way out.** When the result differs, the step says where to go: another step number, or "Page <rotation>". A reader never has to decide what a result means.

## Wording

- Start each sentence with a verb: "Open", "Copy and run", "Wait", "Page".
- Keep sentences to 12 words or fewer. Split anything longer.
- Write exact values: "Wait 5 minutes", "above 2,000", "the `prod-us` context". Say a number, never "a few" or "some".
- Write every command complete: the cluster, region, namespace, and profile spelled out. When regions differ, give one labeled command block per region, or one page per region.
- Use the words the notification and the dashboard use. Name a thing the same way every time.
- Put at most five steps under "Stop the bleeding". Move diagnosis that can wait to "Morning".
- Leave out why the system works the way it does. Link it under "Morning".

## The script line

When the folder has a `mitigate.sh`, a step runs it with one line:

```sh
curl -fsSL https://raw.githubusercontent.com/<owner>/<repo>/<40-character commit SHA>/runbooks/<alert-name>/mitigate.sh | bash
```

- **The commit SHA, not a branch.** The line runs exactly the script you tested. A branch name runs whatever was merged last. After you change the script, commit it, then put the new commit's SHA in the page. The checker compares the script at that SHA with the file in the folder.
- **`-f`** makes `curl` fail on a 404 or 500, so `bash` gets nothing and runs nothing.
- **Private repositories** need a token for `raw.githubusercontent.com`. Use the GitHub CLI there:

  ```sh
  gh api -H 'Accept: application/vnd.github.raw' 'repos/<owner>/<repo>/contents/runbooks/<alert-name>/mitigate.sh?ref=<SHA>' | bash
  ```

- Tag the step `[human]` when the script contains a `human` stage. Its `Costs:` and `Undo:` lines sum up the script's.
