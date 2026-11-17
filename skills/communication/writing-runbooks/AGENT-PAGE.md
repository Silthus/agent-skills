# The agent page

`AGENT.md` is optional, and lives only in the folder layout. Write it when an agent needs something the page lacks, such as the alert's labels or what its credentials reach. Queries live on the page, in their checks. The shared rules for every alert live in the `responding-to-alerts` skill. Copy only the sections you need into `runbooks/<alert-name>/AGENT.md`:

````markdown
# <Alert title>: agent instructions

Follow the `responding-to-alerts` skill. The checks and mitigations are in [README.md](README.md).

## Alert data

<The labels and values the alert sends, and which check each one feeds.>

## Your access

<What the agent's credentials can do: read-only, plus any production action the page allows an agent.
One line per check the agent cannot reach, such as an admin page: who runs it.>

## Hand over to a person

- How you page: <the exact way an agent can use, such as mentioning a group in the alert's thread>.
  A command only a person can run, such as a paging slash command, is not a way.
- <Alert-specific stop conditions, such as customer data or a second region.>
````

## Rules

- Link to the checks and mitigations in `README.md` by number. Never copy one: a copy drifts, and on the night it is wrong the agent follows the copy.
- Give the agent read-only credentials. When its credentials can change production, list that under "Your access" and tell the user to remove the access.
