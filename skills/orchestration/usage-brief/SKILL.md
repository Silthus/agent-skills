---
name: usage-brief
description: Gather how users and agents use a product surface before work changes it. Use when a map or a prototype changes an existing scene, view, interaction, MCP tool, or API.
---

# Usage brief

A **usage brief** is the evidence of how people and agents use a product surface today, gathered before the work changes it. It shows who the change touches, how often, through which channel, and what already hurts there.

## Scope

The caller names the scope, the surface, and the analytics project. When no project is named, take it from the user's agent instructions. When they name none either, report `not available: no analytics project named` for every source.

- **Map scope**: the feature, its scenes, and the data under them. `orchestration-wayfinder` runs it while charting.
- **Element scope**: the controls and flows that a prototype moves, hides, renames, or removes. Start from the map's brief and its confirmed bars when they exist. Refresh Interactions, Paths, Errors, and Replays for the elements; another row may read `see map brief`.

For a new surface, brief the host surface it lands in and the flows next to it.

## Sources

Count over the last 30 days and show the trend over 90. Prefer an approved metric from the data catalog when one matches. Work the sources in parallel when you can dispatch workers.

The PostHog names after each source are skills and tools of the PostHog MCP server that serve it.

1. **Reach**: active users of the product, users of the surface, their share, the trend, and the split by plan or organization size when the data has it. `query-trends`, `query-lifecycle`.
2. **Channels**: use of the surface and its data through the UI, through MCP tools and agents, and through the API. Name each MCP tool and endpoint that reads or writes the data the change touches, with its calls, users, and error rate. `exploring-mcp-tool-usage`, `query-mcp-tool-stats`, `query-mcp-harness-breakdown`, `query-mcp-tool-top-users`, and for API calls `query-logs` and `exploring-apm-traces`.
3. **Interactions**: for each control the change touches, its clicks, the share of the surface's users who use it, uses per user per week, and how much of its use comes from power users. `exploring-autocapture-events`, `elements-stats-retrieve`, `assessing-heatmaps`, `query-stickiness`.
4. **Paths**: how users reach and leave the surface and the common flows through it, then the call path behind it: the endpoints, queries, and jobs the surface calls, with their traffic and latency. `query-paths`, `query-funnel`, `exploring-apm-traces`, `query-logs`.
5. **Feedback**: survey responses, feedback, and feature requests that mention the surface. `surveys-responses-list`, `surveys-summarize-responses-create`, `field-notes-list`.
6. **Support**: support tickets and conversations about the surface, with their count, themes, and two or three representative tickets. `conversations-tickets-list`, and a helpdesk synced into the data warehouse, such as Zendesk.
7. **Errors**: exceptions on the surface, error rates of the endpoints and MCP tools behind it, and rage clicks and dead clicks. `triaging-error-issues`, `query-error-tracking-issues-list`, `query-mcp-tool-failures`.
8. **Replays**: replay vision observations about the surface, and three to five sessions that show typical and struggling use. `exploring-replay-vision-observations`, `finding-sessions-to-watch`.

Link every number to the insight, notebook, or recording it came from. Save the queries you link as insights or in one notebook in the analytics project; that is the only thing the brief writes there. When a source has no data, write `not available: <reason>`, and when the reason is missing instrumentation, name the instrumentation.

## Flags

Check each flag against the sources together. Raise it with the numbers behind it, or rule it out in one line.

- **Muscle memory**: the change moves, hides, or renames a control that many users use often.
- **Agent contract**: MCP tools, agents, or API callers depend on data or behavior the change alters, so they break or drift with no UI change in sight.
- **Low use**: few users touch a control, so it is a candidate to demote or remove.
- **Known pain**: errors, rage clicks, support tickets, or negative feedback gather on the surface, and the change can ease or worsen them.
- **Channel shift**: most use comes through a different channel than the one the work changes, such as agents rather than the UI.

The human sets the bar for each flag. Use a confirmed bar when the caller gives one. Otherwise, propose a bar as a share, such as "low use: under 5% of the surface's weekly users", and mark it `proposed`.

## Write the brief

```markdown
## Usage brief: <surface> (<map or element> scope, <window>)

Flags:
- <flag>: <raised with its numbers and links, or ruled out and why> (bar: <bar>, <confirmed or proposed>)

| Source | Finding | Link |
| --- | --- | --- |
| Reach | <one or two lines> | <link> |
```

One row per source, all eight. The calling skill decides where the brief goes.

The brief holds usage numbers and customer data, so it goes only to private places, such as a private map tracker or private note. Pull requests, commits, branches, and public issues carry the decision it supports and a note that a usage brief informed it.

Done when every source has a finding, `not available`, or at element scope `see map brief`; every finding links its source; and each of the five flags is raised with its numbers or ruled out.
