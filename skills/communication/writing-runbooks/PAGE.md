# The runbook page

The page has the shape of a proven critical runbook: what is broken, how to check, what to do, and who to page. Copy this into `runbooks/<alert-name>/README.md` and replace every `<...>`. In a host format, keep the host's headings and fit these rules under them.

````markdown
# <Alert title, exactly as the notification shows it>

## Symptoms

<What is broken for users, in one or two sentences.>
<What else looks like this alert, and which runbook covers it.>

## Investigation

1. Open the <name> graph: <full URL with the time range>.
   A line above <number> confirms it. Below <number>, it recovered.
2. Check whether a deploy matches the onset:
   ```sh
   <full command, every flag spelled out>
   ```
   A rollout within <minutes> of the onset points at a regression.
3. <One check per known cause, with what result points at it.>

## Mitigation

Least destructive first.

- If <a condition from an Investigation check>, <one action>. <Why it is the right first move.>
- If <a deploy matches the onset>, roll it back:
  ```sh
  <the rollback command>
  ```
  Costs: <what it breaks or loses, with numbers>. Undo: `<the command that reverts it>`.
- If <none of the above>, page <person or rotation> now.
- Confirm recovery on the graph from Investigation 1: the line below <number> for <the alert's window>.

Fix the cause and keep the thresholds. Change a threshold only in its own PR, with baseline numbers.

## Escalation

Page <person or rotation> when no mitigation has started within 15 minutes.
Include: the region, the value from Investigation 1, the onset time, and the latest deploy.
````

## The sections

- **Symptoms** says what users cannot do, in plain prose. It names lookalike alerts and their runbooks. Every line serves the reader: test status lives in the PR description.
- **Investigation** is numbered checks. Each holds one link or one command, and says which result means what. The first check confirms the alert. Order the rest by how often each cause has been the answer.
- **Mitigation** opens with "Least destructive first", then 3 to 5 bullets. Each is `If <condition>, <action>.` plus its reason. Every condition is a result an Investigation check shows, so the reader matches and never guesses. A bullet that changes production names its cost and its undo. When nothing reverts it, write `Undo: none.` and say the change is permanent. One bullet says when to stop and page. The last bullet says how to confirm recovery.
- **Escalation** is 2 to 6 lines: who to page, when, and what to put in the page.

Most proven runbooks run 40 to 100 lines. Move background, design notes, and root-cause hunting to a link.

## Wording

- One action per bullet or check: one link to open, or one command to copy. A command sits alone in a fenced code block, so a phone copies it in one tap.
- Start each sentence with a verb or with `If`. Keep sentences near 12 words; a condition and its action may run longer.
- Write exact values: "Wait 5 minutes", "above 2,000", "the `prod-us` context". Size a wait to the alert's window and the metric's delay.
- Write every command complete: the cluster, region, namespace, and profile spelled out. When regions differ, give one labeled command per region, or one loop over them for a read-only check.
- Use the words the notification and the dashboard use. Name a thing the same way every time.
- Match the escalation to the alert's tier. A page: "Page <rotation> when no mitigation has started within 15 minutes." A warning that only posts to a channel: "Post in <channel> and mention <group>."

## The script line

When the folder has a `mitigate.sh`, a Mitigation bullet runs it with one line:

```sh
curl -fsSL https://raw.githubusercontent.com/<owner>/<repo>/<40-character commit SHA>/runbooks/<alert-name>/mitigate.sh | bash
```

- **The commit SHA, not a branch.** The line runs exactly the script you tested. A branch name runs whatever was merged last. After you change the script, commit it, then put the new commit's SHA in the page. The checker compares the script at that SHA with the file in the folder.
- **`-f`** makes `curl` fail on a 404 or 500, so `bash` gets nothing and runs nothing.
- **Private repositories** need a token for `raw.githubusercontent.com`. Use the GitHub CLI there:

  ```sh
  gh api -H 'Accept: application/vnd.github.raw' 'repos/<owner>/<repo>/contents/runbooks/<alert-name>/mitigate.sh?ref=<SHA>' | bash
  ```

- When the script contains a `human` stage, the bullet names its cost and undo, summed from the script's.
