# Agent skills

Michael's public agent skills. `README.md` explains the layout and the install routes.

- Write commit messages and PR titles as Conventional Commits. release-please reads them to propose the next version:
  - `fix:` for a corrected or clarified skill: patch.
  - `feat:` for a new skill or new behavior: minor.
  - `feat!:` or a `BREAKING CHANGE:` footer when a skill is removed or renamed, or a setting changes incompatibly: major.
  - `docs:` and `chore:` do not release.
- Never tag or publish a release by hand. release-please keeps a release PR open; Michael merges it when `main` is stable.
- This repository is public. Never commit private data: Slack IDs, hostnames, vault references, internal metrics, or private repository names. Personal values belong in the user's agent instructions.
- Run `bun run check` before you push.
