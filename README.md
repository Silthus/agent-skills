# Agent skills

These are the agent skills I use every day with Claude Code, Codex, and T3 Code.
The core is [`orchestration-wayfinder`](skills/orchestration/orchestration-wayfinder/SKILL.md).
It drives a whole planning map, from the first open question to reviewed pull requests, with one agent per ticket.
The other skills take the pull requests from there to merged, and help me share and explain the work.

The skills build on [Matt Pocock's skills](https://github.com/mattpocock/skills), which you install separately and unchanged.

## Skills

| Theme | Skills |
| --- | --- |
| [Orchestration](skills/orchestration/README.md) | `orchestration-wayfinder`, `t3-kickoff`, `architecture-brief` |
| [Pull requests](skills/pull-requests/README.md) | `pr-description`, `merge-risk`, `qa-swarm`, `babysit-pr`, `modernize-pr`, `leaving-pr-comments`, `review-pr`, `review-pr-setup`, `audit-prs`, `slack-pr-update` |
| [Communication](skills/communication/README.md) | `explain-diff`, `share-plan`, `share-preview`, `writing-voice` |

Each theme README says what a skill does and what it needs.

## Install

First install [Matt Pocock's skills](https://github.com/mattpocock/skills#installation-30-second-setup). Then pick one route per agent. If you use two routes for the same agent, it sees every skill twice.

<details>
<summary><strong>Claude Code</strong></summary>

```text
/plugin marketplace add Silthus/agent-skills
/plugin install orchestration@silthus
/plugin install pull-requests@silthus
/plugin install communication@silthus
```

Each theme is a plugin, so install only the themes you want. Claude Code does not update third-party marketplaces by default. Turn on auto-update for the `silthus` marketplace in `/plugin`, or run `claude plugin marketplace update silthus`.

</details>

<details>
<summary><strong>Codex</strong></summary>

```bash
codex plugin marketplace add Silthus/agent-skills
codex plugin add orchestration@silthus
codex plugin add pull-requests@silthus
codex plugin add communication@silthus
```

</details>

<details>
<summary><strong>Cursor and other agents</strong></summary>

```bash
bunx skills add Silthus/agent-skills
```

`pnpm dlx skills add Silthus/agent-skills` works too. Add `-a cursor` (or another agent) to skip the agent prompt. To update, run `bunx skills update`.

</details>

<details>
<summary><strong>Follow <code>main</code> with a clone</strong></summary>

```bash
git clone https://github.com/Silthus/agent-skills.git ~/dev/agent-skills
sh ~/dev/agent-skills/scripts/link-skills.sh
```

The script links each skill into `~/.claude/skills` and `~/.agents/skills`, which Codex and Cursor also read. It keeps files and links that are already there. Run `git pull` to update, and run the script again to link new skills. This is how I install them.

</details>

## Pick a version

Releases are version tags, such as `v1.2.3`. See the [releases](https://github.com/Silthus/agent-skills/releases) and `CHANGELOG.md` for what changed. `main` can be ahead of the latest release. To stay on one version:

| Route | Command |
| --- | --- |
| Claude Code | `/plugin marketplace add Silthus/agent-skills#v1.2.3` |
| Codex | `codex plugin marketplace add Silthus/agent-skills --ref v1.2.3` |
| `skills` CLI | `bunx skills add Silthus/agent-skills#v1.2.3` |
| Clone | `git -C ~/dev/agent-skills checkout v1.2.3` |

## Personal settings

Some skills need a value that is personal to you, such as your Slack channels or your Coder host. The skill names each value it needs. Put the values in your agent instructions (`AGENTS.md` or `CLAUDE.md`), and the skills read them from there. A skill asks you when a value is missing.

Some steps say "when the `fleet` CLI is available". Fleet is my private machine setup. Without it, those steps use their documented fallback.

## Develop

Skills live in `skills/<theme>/<skill>/`, and each needs a `SKILL.md` whose `name` matches its directory. A skill refers to a skill in another theme by name, never by a relative link, because plugin installs copy one theme at a time. A new theme also needs an entry in [`.claude-plugin/marketplace.json`](.claude-plugin/marketplace.json).

```bash
bun install
bun run check
```

`bun run check` validates the layout and links, runs the tests, and typechecks the scripts.

Commit messages follow [Conventional Commits](https://www.conventionalcommits.org): `fix:` releases a patch, `feat:` a minor version, and `feat!:` a major version. [release-please](https://github.com/googleapis/release-please) keeps a release PR open with the next version and its changelog. Merging that PR tags the release.

## License

[MIT](LICENSE). `pr-description` is based on Matt Pocock's `pr` skill, also MIT. Its credits are in its front matter.
