# The agent page

`AGENT.md` holds only what an agent needs for this alert beyond the person's page. The shared rules for every alert live in the `responding-to-alerts` skill. Copy this into `runbooks/<alert-name>/AGENT.md`:

````markdown
# <Alert title>: agent instructions

Follow the `responding-to-alerts` skill. The steps are in [README.md](README.md).
Run `[safe]` steps yourself. Stop at every `[human]` step and page a person.

## Alert data

<The labels and values the alert sends, and which step each one feeds.>

## Confirm it is real

```<query language>
<the query that shows the problem now>
```

Firing means <the result and threshold>. A result under the threshold means it recovered.

## Diagnose

<The queries, log searches, or dashboards that tell which mitigation fits.
One heading per mitigation in README.md, each naming the step it leads to.>

## Your access

<What the agent's credentials can do: read-only, plus the [safe] actions it may run.
One line per step the agent cannot reach, [safe] ones too, such as an admin page:
who runs it, and whether that needs a page.
For each step that opens a graph, the same query for the agent's tools, with its range.>

## Hand over to a person

- Any `[human]` step, or a step listed under "Your access" as out of reach.
- How you page: <the exact way an agent can use, such as mentioning a group in the alert's thread>.
  A command only a person can run, such as a paging slash command, is not a way.
- A `You see:` line that does not match after one retry.
- <Alert-specific stop conditions, such as customer data or a second region.>
````

## Rules

- Link to the steps in `README.md` by number. Never copy a step: a copy drifts, and on the night it is wrong the agent follows the copy.
- Write queries the agent can run as is, with the data source named.
- Give the agent read-only credentials, plus an allowlist for the `[safe]` actions it runs. The page's `[human]` tag is advice; missing credentials make it a fact. When the agent's credentials can run a `[human]` step, list that under "Your access" and tell the user to remove the access.
