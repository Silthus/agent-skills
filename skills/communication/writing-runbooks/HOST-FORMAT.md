# A repository with its own runbook format

Many repositories already hold runbooks in a fixed format, often checked in CI: one file per alert, a set of required headings, no extra files in the folder. Keep that format. Read its rules and its checker first, such as a README or a parser, and fit this skill inside them:

| This skill | Where it goes in the host format |
| --- | --- |
| The stop-the-bleeding steps | First under the section that holds the fix, such as `## Mitigation`. Nothing else goes in that section when the host copies it into the notification; otherwise daytime material follows the last step under its own `###` heading. |
| The banner, the stamp, the "Stuck?" line, and the role line | The first lines of the first section, such as `## Symptoms`, in that order. |
| `AGENT.md` | A `### For agents` section in the same file, in the section where diagnosis lives, such as `## Investigation`. Its first line is "Only agents read this section. People skip it." It names the `responding-to-alerts` skill and links steps by number, as [AGENT-PAGE.md](AGENT-PAGE.md) describes. |
| `mitigate.sh` | A script next to the runbook with the same name and `.sh`, such as `ConsumerLagHigh.sh`, when the host's checker only reads `.md` files. Otherwise link it from where the host keeps scripts. |
| The title and "Morning" | Leave them out when the host forbids them. The host's own sections hold the background. |
| Step 8, wiring the alert | Keep what the host generates, such as the runbook URL or a notification that already carries the fix section. |

The person drill reads the whole file, agent section included, so the role line and the "You, the on-call person, run this step" wording carry more weight here. The step rules, the tests, and the drills stay the same. Check the file with the host's checker and with this skill's, naming the section that holds the steps:

```sh
bun <this skill>/scripts/check-runbook.ts alerts/runbooks/ConsumerLagHigh.md --section Mitigation
```

On a file, the checker applies its wording rules to the stamp lines and the steps only, and looks for the `For agents` section instead of `AGENT.md`.

When the host format cannot hold a rule at all, keep the host's rule and tell the user which of this skill's rules you dropped.
