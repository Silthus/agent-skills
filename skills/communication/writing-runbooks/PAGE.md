# The runbook page

The page has the shape of a proven critical runbook: a short top for the paged person, then an agent body that checks, mitigates, and escalates. Copy this into `runbooks/<alert-name>/README.md` and replace every `<...>`. In a host format, keep the host's headings and fit these rules under them: its first section is the top.

````markdown
# <Alert title, exactly as the notification shows it>

## Symptoms

<What is broken, in the product's words, in one sentence.>
<Who is hit and how: which customers, and whether their data is late or lost.>
See it: [<panel name>](<full URL with the time range>). Firing: above <number> <the axis unit> for <the alert's window>.
Lookalike: [<other alert>](<its runbook>) fires instead when <the difference>.

## Investigation

1. <Graph name>: [US](<full URL>) or [EU](<full URL>).
   Query (<data source>): `<the query behind the link>`.
   Above <number> <unit>: it fires; continue with check 2. Below: it recovered; stop.
2. Deploy check:
   ```sh
   <full command, every flag spelled out>
   ```
   A rollout within <minutes> of the onset: a regression.
3. <One check per known cause: one line per result it can show, and what that result means.>

## Mitigation

Least destructive first.

- If <a result from an Investigation check>, <one action>. <Why it is the right first move.>
- If <a deploy matches the onset>, roll it back:
  ```sh
  <the rollback command>
  ```
  Costs: <what it breaks or loses, with numbers>. Undo: `<the command that reverts it>`.
- If <none of the above>, page <person or rotation> now.
- Confirm recovery with check 1: below <number> <unit> for <the alert's window>.

Fix the cause and keep the thresholds. Change a threshold only in its own PR, with baseline numbers.

## Escalation

Page <person or rotation> when no mitigation has started within 15 minutes.
Include: the region, the value from check 1, the onset time, and the latest deploy.
````

## The top

The top is the first section, here Symptoms. The paged person reads it in under a minute, on a phone, while their agent works the body. It holds four things, in plain words:

- **What is broken**, as a user sees it: "Workflow emails send late", not the metric's name.
- **Who is hit**, and how: which customers, and whether anything is lost or only late.
- **One or two links** to see it: a panel or saved view, each with its firing value. Write that value in the unit the panel's axis shows. When the alert's expression counts in another unit, such as milliseconds behind a panel in minutes, convert the number, or link a view that converts the query. Open each link and read the axis before you write the number.
- **Lookalikes**: the other alerts that look like this one, each with its runbook and how to tell them apart.

Keep queries, metric names, and commands below the top. The top runs 3 to 8 lines.

## The agent body

Investigation, Mitigation, and Escalation are for the agent. Write them precise enough to run without a guess; a person without an agent follows the same lines.

- **Investigation** is numbered checks. Each holds one link or one command, plus the query behind a link, with its data source, so the agent runs it with its own tools. Each result the check can show gets one line: the result, what it means, and where to go next. The first check confirms the alert. Order the rest by how often each cause has been the answer.
- **Mitigation** opens with "Least destructive first", then 3 to 5 bullets. Each is `If <condition>, <action>.` plus its reason, one bullet per decision branch. Every condition is a result an Investigation check shows, so the reader matches and never guesses. A bullet that changes production names its cost and its undo. When nothing reverts it, write `Undo: none.` and say the change is permanent. One bullet says when to stop and page. The last bullet says how to confirm recovery.
- **Escalation** is 2 to 6 lines: who to page, when, and what to put in the page.

Most proven runbooks run 40 to 100 lines. Move background, design notes, and root-cause hunting to a link.

## Wording

- One action per bullet or check: one link to open, or one command to copy. A command sits alone in a fenced code block, so a phone copies it in one tap.
- Write every link as a full URL that opens the view. When it needs a value from an earlier check, such as a workflow id, write the whole URL with that one id in capitals, and name where it comes from: "Swap `FUNCTION_ID` for the `function_id` from check 2." The reader replaces one word and never assembles a URL from parts.
- Start each sentence with a verb or with `If`. Keep sentences near 12 words; a condition and its action may run longer.
- Write exact values: "Wait 5 minutes", "above 2,000", "the `prod-us` context". Give every threshold its unit. Size a wait to the alert's window and the metric's delay. Size a query's lookback to the alert's age: a warning may be read hours after it fired.
- Write every command complete: the cluster, region, namespace, and profile spelled out. When regions differ, give one labeled command per region, or one loop over them for a read-only check.
- Use the words the notification and the dashboard use. Name a thing the same way every time.
- Write the present: what to look at and what to do now. Backtests, past fires, and how the alert came to be go in the PR description or beside the alert's rule.
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
