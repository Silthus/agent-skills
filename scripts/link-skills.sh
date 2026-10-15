#!/bin/sh
# Link every skill in this checkout into the user skill directories of
# Claude Code (~/.claude/skills) and Codex, Cursor, and other agents (~/.agents/skills).
# Each link points into the checkout, so `git pull` updates the skills.
# Existing files and links that point elsewhere stay untouched.
set -eu

repo=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd -P)
linked=0
kept=0

for dir in "$HOME/.claude/skills" "$HOME/.agents/skills"; do
  mkdir -p "$dir"
  # Remove links to skills that left this checkout.
  for path in "$dir"/*; do
    [ -L "$path" ] && [ ! -e "$path" ] || continue
    case "$(readlink "$path")" in
      "$repo"/skills/*) rm "$path" && echo "removed: $path" ;;
    esac
  done
  for skill in "$repo"/skills/*/*/; do
    skill=${skill%/}
    [ -f "$skill/SKILL.md" ] || continue
    target="$dir/$(basename "$skill")"
    if [ -L "$target" ] && [ "$(readlink "$target")" = "$skill" ]; then continue; fi
    if [ -e "$target" ] || [ -L "$target" ]; then
      echo "kept: $target (not managed by this checkout)"
      kept=$((kept + 1))
      continue
    fi
    ln -s "$skill" "$target"
    linked=$((linked + 1))
  done
done

echo "Skills: $linked linked, $kept kept."
