# Pull requests

Skills that take a pull request from a draft to merged, and help you review the pull requests of others.

- **[pr-description](./pr-description/SKILL.md)**: Write or refresh a PR description that leads with the problem and its impact, carries the merge-risk callout, and puts proof beside each behavior: screenshots, a recording, or a flow diagram. Based on Matt Pocock's `pr`.
- **[merge-risk](./merge-risk/SKILL.md)**: Grade a PR's blast radius as low, medium, or high, call its door one-way or two-way, and post the risk callout.
- **[qa-swarm](./qa-swarm/SKILL.md)**: Bring a PR to review-ready with a cross-model reviewer panel, the proofs the change owes, and a fix for every verified finding and bot thread, with panel rounds and final reads until clean, and an arbiter deciding past two of each. Its spec pass checks a draft spec for overengineering before anyone builds it. Based on Paul D'Ambra's `qa-swarm` and `review-triage`, with Daniel Visca's verify-by-observation rules.
- **[full-stop](./full-stop/SKILL.md)**: Build or fix something end to end and stop at a reviewed draft PR with green CI and every bot finding handled. Never marks it ready or merges. Based on Theo Browne's `full-stop`, MIT.
- **[full-send](./full-send/SKILL.md)**: The same work, then mark the PR ready, babysit it through review, merge it, and roll it out. Triggered only by "full send" or "ship it to production". Based on Theo Browne's `full-send`, MIT.
- **[stamp-pr](./stamp-pr/SKILL.md)**: Full send with the repo's approval bot, such as StampHog, in place of a teammate, for small low-risk standalone PRs. Triggered by "stamp it".
- **[babysit-pr](./babysit-pr/SKILL.md)**: Keep a PR green and answered: watch CI and reviews, fix real findings, answer bots, rebase. Never merges. Based on Theo Browne's `babysit-pr`, MIT.
- **[rollout](./rollout/SKILL.md)**: Merge a PR whose gate passed, watch the deploy, and roll its feature flags out in stages with production checks, rollback thresholds, and an investigation before any question.
- **[modernize-pr](./modernize-pr/SKILL.md)**: Decide whether a stale PR still belongs, then rebase it and adapt it to what changed. Based on Theo Browne's `modernize`, MIT.
- **[leaving-pr-comments](./leaving-pr-comments/SKILL.md)**: Draft every GitHub comment an agent posts on your behalf, and get your approval before a person reads it.
- **[review-pr](./review-pr/SKILL.md)**: Get an entry point to someone else's PR or stack: a flow diagram, the change in a few bullets, the merge risk, and a lean. Then ask questions.
- **[review-pr-setup](./review-pr-setup/SKILL.md)**: Tailor `review-pr` to you from your recent reviews and a short interview.
- **[audit-prs](./audit-prs/SKILL.md)**: Triage all your open PRs into readiness groups with next actions, merge confidence, and the changes since the last audit. Needs Bun and `gh`.
- **[review-lens](./review-lens/SKILL.md)**: Distill one teammate's review lens from their review comments and a short interview, and publish it as a PostHog Review perspective that the bot and `qa-swarm` run on every PR. Grew out of Paul D'Ambra's `paul-reviewer`. Needs `gh` and the PostHog MCP server.
- **[slack-pr-update](./slack-pr-update/SKILL.md)**: Format Slack PR updates, PR lists, and review or merge handoffs.

These skills use `gh` (2.100.0 or later for `--attach`), `writing-voice` from [communication](../communication/README.md) when it is installed, and `impact` from [orchestration](../orchestration/README.md) when it is installed. `qa-swarm` uses Matt Pocock's `tdd` and `code-review`.
