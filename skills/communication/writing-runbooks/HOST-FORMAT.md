# A repository with its own runbook format

Many repositories already hold runbooks in a fixed format, often checked in CI: one file per alert, a set of required headings, no extra files in the folder. Keep that format. Read its rules and its checker first, such as a README or a parser, and fit this skill inside them:

| This skill | Where it goes in the host format |
| --- | --- |
| The stop-the-bleeding steps | First under the section that holds the fix, such as `## Mitigation`, before any sub-heading. Longer daytime material follows under its own `###` heading. |
| The stamp and the "Stuck? Page" line | The first lines of the first section, such as `## Symptoms`. |
| `AGENT.md` | A `### For agents` section in the same file, in the section where diagnosis lives, such as `## Investigation`. It names the `responding-to-alerts` skill and links steps by number, as [AGENT-PAGE.md](AGENT-PAGE.md) describes. |
| `mitigate.sh` | A script next to the runbook with the same name and `.sh`, such as `ConsumerLagHigh.sh`, when the host's checker only reads `.md` files. Otherwise link it from where the host keeps scripts. |
| The title and "Morning" | Leave them out when the host forbids them. The host's own sections hold the background. |

The step rules, the tests, and the drills stay the same. Check the file with the host's checker and with this skill's, naming the section that holds the steps:

```sh
bun <this skill>/scripts/check-runbook.ts alerts/runbooks/ConsumerLagHigh.md --section Mitigation
```

On a file, the checker applies its wording rules to the stamp lines and the steps only, and looks for the `For agents` section instead of `AGENT.md`.

When the host format cannot hold a rule at all, keep the host's rule and tell the user which of this skill's rules you dropped.
