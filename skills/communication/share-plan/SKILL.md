---
name: share-plan
description: Publish an HTML or Markdown plan, report, or page to an unlisted link through a secret GitHub gist. Use when asked to share, publish, or host a document for other people, or to update or delete a shared one.
---

# Share a plan

A secret gist holds the file. For HTML, [gistpreview](https://gistpreview.github.io/) renders it: the page fetches the gist from the GitHub API in the viewer's browser and writes the file into itself. The link stays up until the gist is deleted, and no server runs on the user's machines.

The gist lives under the user's GitHub account. It is unlisted, not private: anyone with the link can read it.

## Publish

1. **Make the file self-contained.** gistpreview writes the page into its own origin, so relative `src` and `href` paths break. Inline images as `data:` URIs and CSS and scripts as `<style>` and `<script>` blocks, or point them at absolute `https://` URLs. Keep the file under 1 MB: the GitHub API truncates larger files and the page renders cut off. Done when this prints nothing:

   ```sh
   grep -oE '(^|[[:space:]])(src|href)="[^"#:]+"' plan.html
   ```

   The check skips anchor links (`href="#section"`), `data:` URIs, and absolute URLs.

2. **Check the content for secrets.** Search the file for tokens, keys, passwords, and customer data. Prose about keys is fine; a real value is not. If a real credential or data that must not reach everyone with the link is in the file, stop and ask the user.

3. **Name the file** for its topic, such as `onboarding-redesign-plan.html`. The file name is part of the link.

4. **Create the gist:**

   ```sh
   gh gist create -d "<title>" onboarding-redesign-plan.html
   ```

   `gh gist create` makes a secret gist by default and has no `--secret` flag. `--public` lists it on the user's profile, so leave it out. Done when it prints `https://gist.github.com/<user>/<id>`.

5. **Build the link:**
   - HTML: `https://gistpreview.github.io/?<id>/<file-name>`
   - Markdown: the gist URL itself. GitHub renders Markdown there, and gistpreview would show the raw text.

6. **Verify.** Run `gh api gists/<id> --jq '[.public, (.files[] | .truncated)]'`. Done when every value is `false`. For HTML, open the link in a browser and confirm that the title, body text, and images render.

7. Report the link to the user, with the gist id for later updates.

## Update

```sh
gh gist edit <id> --filename <file-name> <local-file>
```

The gistpreview link always shows the latest version, so it stays the same. Verify again as in step 6.

## Delete

Delete a gist only when the user asks: `gh gist delete <id>`. `gh gist list` shows the user's gists with their descriptions.

## Limits

- gistpreview calls the GitHub API without authentication, so each viewer's IP gets 60 page loads per hour. That suits a plan shared in a thread, not a page for a large audience.
- gistpreview is a community project on GitHub Pages, with no uptime promise. The gist stays readable on gist.github.com if gistpreview goes away.
- raw.githack.com also renders gists, but shows a warning page before the content. Share the gistpreview link instead.
