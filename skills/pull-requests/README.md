# Pull requests

Skills that take a pull request from a draft to merged, and help you review the pull requests of others.

- **[pr-description](./pr-description/SKILL.md)**: Write or refresh a PR description that leads with the problem, carries the merge-risk callout, and puts proof beside each behavior: screenshots, a recording, or a flow diagram. Based on Matt Pocock's `pr`.
- **[merge-risk](./merge-risk/SKILL.md)**: Grade a PR's blast radius as low, medium, or high, call its door one-way or two-way, and post the risk callout.
- **[qa-swarm](./qa-swarm/SKILL.md)**: Bring a PR to review-ready with a cross-model reviewer panel and a fix for every verified finding and bot thread, in at most two rounds.
- **[babysit-pr](./babysit-pr/SKILL.md)**: Take a PR that is ready for review to merged: watch CI and reviews, fix real findings, and merge once it is approved and green.
- **[modernize-pr](./modernize-pr/SKILL.md)**: Bring a stale PR up to date with its base branch and adapt it to what changed.
- **[leaving-pr-comments](./leaving-pr-comments/SKILL.md)**: Draft every GitHub comment an agent posts on your behalf, and get your approval before a person reads it.
- **[review-pr](./review-pr/SKILL.md)**: Get an entry point to someone else's PR or stack: a flow diagram, the change in a few bullets, the merge risk, and a lean. Then ask questions.
- **[review-pr-setup](./review-pr-setup/SKILL.md)**: Tailor `review-pr` to you from your recent reviews and a short interview.
- **[audit-prs](./audit-prs/SKILL.md)**: Triage all your open PRs into readiness groups with next actions, merge confidence, and the changes since the last audit. Needs Bun and `gh`.
- **[review-lens](./review-lens/SKILL.md)**: Distill one teammate's review lens from their review comments and a short interview, and publish it as a PostHog Review perspective that the bot and `qa-swarm` run on every PR. Needs `gh` and the PostHog MCP server.
- **[slack-pr-update](./slack-pr-update/SKILL.md)**: Format Slack PR updates, PR lists, and review or merge handoffs.

These skills use `gh` (2.100.0 or later for `--attach`), and `writing-voice` from [communication](../communication/README.md) when it is installed. `qa-swarm` uses Matt Pocock's `tdd` and `code-review`.
