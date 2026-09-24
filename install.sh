#!/bin/sh
# Install the PR babysitting skills into a Claude Code skills directory.
#   curl -fsSL https://raw.githubusercontent.com/Silthus/agent-skills/main/install.sh | sh
# Set SKILLS_DIR to install somewhere else, for example SKILLS_DIR=.claude/skills for one repository.
set -eu

dir="${SKILLS_DIR:-$HOME/.claude/skills}"
here="https://raw.githubusercontent.com/Silthus/agent-skills/main/skills"
posthog="https://raw.githubusercontent.com/PostHog/posthog/master/.agents/skills"

fetch() {
    # fetch <url> <skill> <file>
    target="$dir/$2/$3"
    mkdir -p "$(dirname "$target")"
    tmp="$target.download"
    curl -fsSL "$1" -o "$tmp"
    if [ -f "$target" ] && ! cmp -s "$tmp" "$target"; then
        mv "$target" "$target.bak"
        echo "  kept your old $2/$3 as $3.bak"
    fi
    mv "$tmp" "$target"
}

echo "Installing skills into $dir"
fetch "$here/babysit-pr/SKILL.md" babysit-pr SKILL.md
fetch "$here/leaving-pr-comments/SKILL.md" leaving-pr-comments SKILL.md
fetch "$here/resolving-merge-conflicts/SKILL.md" resolving-merge-conflicts SKILL.md
fetch "$here/resolving-merge-conflicts/agents/openai.yaml" resolving-merge-conflicts agents/openai.yaml
# merging-prs comes straight from PostHog/posthog, so it never drifts from the repository's merge queue rules.
fetch "$posthog/merging-prs/SKILL.md" merging-prs SKILL.md
echo "Done: babysit-pr, leaving-pr-comments, resolving-merge-conflicts, merging-prs"
echo "Start a new agent session so it picks the skills up."
