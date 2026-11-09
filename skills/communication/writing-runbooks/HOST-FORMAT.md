# A repository with its own runbook format

Many repositories already hold runbooks in a fixed format, often checked in CI: one file per alert, a set of required headings, no extra files in the folder. Their mature runbooks are the proven shape: on-call engineers have used them through real incidents. Write to that shape.

## Read the house shape

1. Read the format's rules and its checker, such as a README or a parser.
2. Find the 2 or 3 most edited runbooks for critical alerts:

   ```sh
   git log --format= --name-only -- <runbooks dir> | sort | uniq -c | sort -rn | head -20
   ```

   Keep the ones whose alert pages someone, by its severity or tier label.
3. Read them whole, with their alerts' descriptions. Note their length in lines, how Mitigation reads, how Escalation reads, and how the descriptions read.

Done when you can state the typical length and the Mitigation style in one line each. Your page lands within that length range and reads like those pages. A page longer than the house's longest critical runbook needs cuts, not more headings.

## Where this skill's parts go

| This skill | In the host format |
| --- | --- |
| The page sections in [PAGE.md](PAGE.md) | The host's own headings, in the host's order. Its mitigation section holds the conditional bullets, least destructive first. |
| Test status, the test log, and drill results | The PR description. |
| Notes for agents | Nothing, by default: the `responding-to-alerts` skill reads a normal runbook. When an agent truly needs one fact the page lacks, such as the query for a graph link, add it as one line beside that check. |
| `mitigate.sh` | A script next to the runbook with the same name and `.sh`, such as `ConsumerLagHigh.sh`, when the host's checker only reads `.md` files. Otherwise link it from where the host keeps scripts. |
| The alert description | The fact, the value, and the user impact, worded like the mature runbooks' alerts. |
| The runbook URL | Keep what the host generates. |

Check the file with the host's checker and with this skill's, naming the section that holds the fix:

```sh
bun <this skill>/scripts/check-runbook.ts alerts/runbooks/ConsumerLagHigh.md --section Mitigation
```

When the host format cannot hold one of this skill's rules, keep the host's rule and tell the user which rule you dropped.
