# Agent skills for babysitting PRs

These skills let a coding agent watch a pull request until it merges.
The agent fixes CI failures and review-bot findings on the way, drafts replies for your approval, and merges once you say so.

## Install

```sh
curl -fsSL https://raw.githubusercontent.com/Silthus/agent-skills/main/install.sh | sh
```

This installs into `~/.claude/skills/`. Set `SKILLS_DIR` to install somewhere else.
When a skill file already exists with different content, the script keeps a `.bak` copy.
Start a new agent session afterwards so the agent picks the skills up.

| Skill | What it does |
| --- | --- |
| [`babysit-pr`](skills/babysit-pr/SKILL.md) | Monitors a PR until it merges and fixes real findings. |
| [`leaving-pr-comments`](skills/leaving-pr-comments/SKILL.md) | Drafts every comment for your approval. It replies without approval only when a pushed commit fixed a bot finding. |
| [`resolving-merge-conflicts`](skills/resolving-merge-conflicts/SKILL.md) | Resolves a rebase or merge conflict and keeps the intent of both sides. |
| [`merging-prs`](https://github.com/PostHog/posthog/blob/master/.agents/skills/merging-prs/SKILL.md) | PostHog's Trunk merge queue rules. The installer fetches this one from PostHog/posthog. |

## Use

Ask your agent to babysit a PR, for example:

```text
Babysit https://github.com/OWNER/REPO/pull/123 until it merges.
```

The agent merges only when you ask it to in that session.
