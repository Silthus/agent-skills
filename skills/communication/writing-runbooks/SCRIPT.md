# The mitigation script

Copy [template.sh](template.sh) to `runbooks/<alert-name>/mitigate.sh`. Copy the library above the `STAGES` marker as is. Write one `stage` per step below it.

## The library

| Helper | Use it to |
| --- | --- |
| `banner "Title"` | Open the script. Use the alert's name. |
| `stage "Name"` | Start a step. It clears the screen and shows "Step 2 of 4". |
| `say`, `step`, `note`, `warn`, `ok` | Print one line. |
| `open_url URL` | Open a dashboard, or print the link to open by hand. |
| `ready "what" "check" "fix"` | Retry a silent check, such as a login, until it passes. Put it in the first stage. |
| `run "command"` | Run a read-only command and show its output. |
| `confirm "question"` | Ask a yes/no question about what the person sees. |
| `human "does" "costs" "undo" "command"` | Run a production change only after the person types `yes`. |
| `stuck "reason"` | End the script and tell the person to page `$ESCALATE`. |
| `finish` | End the script after the last stage. |

`run`, `human`, and `stuck` log what ran. `finish`, `stuck`, and Ctrl-C print that log as a block to paste in the incident channel.

## Rules

- Set `ESCALATE` to the same person or rotation the page names.
- Check access first. The first stage calls `ready` for each login and tool the script needs, with the exact login command as the fix. Expired logins are the most common failure at night.
- Give every `run` and `human` an `|| stuck "<reason>"`, so a failure always ends in a page, never in a silent next step.
- Put every production change in `human`. Spell out its cost with numbers and its undo as a command. The person types the full word `yes`, so a tired Enter or `y` skips it.
- Ask about what the person can see: "Do you see pods with status CrashLoopBackOff?", not "Is the consumer broken?".
- Keep one stage to one action and its check, so nothing the person needs scrolls away.
- Write the messages like the page: start with a verb, 12 words or fewer, exact values. Run the `unslop` skill over them.
- Leave out commands that read from the keyboard, such as `kubectl exec -it` or editors. `run` gives each command no input.

## Test it

1. Run `bash -n mitigate.sh`, and `shellcheck -S warning mitigate.sh` when it is installed. It reports unused helpers as info, which is fine.
2. Run it with answers from a file and fake tools first. `RUNBOOK_ANSWERS` points the script at a file of answers, one per line:

   ```sh
   printf '\n\ny\nyes\n' > answers.txt
   RUNBOOK_ANSWERS=answers.txt PATH="$PWD/fakes:$PATH" bash mitigate.sh
   ```

3. Run the real script once on dev or staging through the page's `curl` line, at a terminal. Answer every prompt yourself. Note what each `human` stage printed and how long it took.
