# Orchestration

Skills that plan and drive a large piece of work across many agent sessions.
`orchestration-wayfinder` is the core: it runs a whole [Wayfinder](https://github.com/mattpocock/skills/tree/main/skills/engineering/wayfinder) map from one session and dispatches one worker per ticket.

- **[orchestration-wayfinder](./orchestration-wayfinder/SKILL.md)**: Drive a Wayfinder map from planning through implementation. Workers resolve research, grilling, prototype, and implementation tickets. Each spec ships as one reviewed draft pull request. Has addenda for Claude Code, Codex, and T3 Code. Invoke it yourself with `/orchestration-wayfinder`.
- **[t3-kickoff](./t3-kickoff/SKILL.md)**: Start, watch, archive, or delete [T3 Code](https://github.com/pingdotgg/t3code) threads from the command line, and hand the current work to another machine as a new T3 thread. Needs Bun and a running T3 server.
- **[architecture](./architecture/SKILL.md)**: Shape a change larger than one module in `grilling` rounds, one premise and one diagram per round, from the change map down to the contract at each seam. Draws modules as frames with their seams and measured leaks, generated from a JSON spec, and captures the locked design as Markdown and ADRs. Rendering the diagram needs Bun and a Chromium.

These skills build on Matt Pocock's skills: `wayfinder`, `grilling`, `domain-modeling`, `prototype`, `to-spec`, `to-tickets`, `research`, `tdd`, `handoff`, `retro`, and `codebase-design`. They also use `qa-swarm`, `merge-risk`, `babysit-pr`, and `pr-description` from [pull-requests](../pull-requests/README.md).
