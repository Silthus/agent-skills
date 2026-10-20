---
name: share-preview
description: Share a running app, Storybook, or static build from a Coder workspace as a private Coder link. Use when asked to share, show, or preview work in a browser.
---

# Share a preview

Coder publishes every port of a workspace at its own private URL:

```
https://<port>--<agent>--<workspace>--<owner>.<wildcard-host>/
```

Coder serves the app at the root of the URL, with its own HTTPS certificate,
and asks for Coder sign-in. Only the workspace owner can open the link, from
any device that is signed in to Coder. Several previews can run at once, one
port each.

## Settings

Read each value from the user's agent instructions when they name it, else from
the first source that has it:

| Part              | Source                                                                                       |
| ----------------- | -------------------------------------------------------------------------------------------- |
| `<workspace>`     | `$CODER_WORKSPACE_NAME`, else the output of `hostname`.                                      |
| `<agent>`         | `$CODER_WORKSPACE_AGENT_NAME`, else the agent name in the workspace template.                |
| `<owner>`         | `$CODER_WORKSPACE_OWNER_NAME`, else `coder whoami` where the `coder` CLI is signed in.       |
| `<wildcard-host>` | `$CODER_PREVIEW_HOST` (the Coder wildcard access URL without `*.`, such as `apps.coder.example.com`). |

If a value is still unknown, ask the user for it. The wildcard host is the
host part of any port-forward link in the Coder dashboard. Do not guess it
from `$CODER_AGENT_URL`: the wildcard host can differ from the access URL.

Optional: `$PREVIEW_CHECK_HOST`, or a check host in the user's agent
instructions, is an SSH alias of a machine where the `coder`
CLI is signed in. Step 3 reads the Coder token there.

## Steps

Fleet is available when the `fleet` CLI is on `PATH` or at `~/dev/fleet/fleet`;
below, `fleet` means whichever exists. With Fleet, a worktree has a lease when
`fleet lease status` names a compute box. Fleet then runs the preview on that box.

1. Pick a short lowercase name that is unique to this preview, such as the
   branch name with `/` replaced by `-` plus what it serves
   (`<branch>-storybook`): Fleet replaces a running preview of the same name.
   Pick a free port: `ss -ltn` does not list it. With a lease, check on the box
   with `fleet heavy -- ss -ltn`.
2. Serve the work on `127.0.0.1:<port>` as a systemd user service, so it
   outlives this session. If `systemd-run` cannot reach the user manager, run
   `export XDG_RUNTIME_DIR=/run/user/$(id -u)` first.
   - **With Fleet:** run `fleet heavy --service preview-<name> -- <command>`
     from the project. Fleet starts the service in its heavy slice and ends with
     `Fleet heavy: preview-<name> serves from <workspace>.`. Use that workspace,
     without the final period, for `<workspace>` in the link. The agent and
     owner stay the ones from Settings. With a lease, the box gets local edits
     only when a `fleet heavy` command runs. After edits, run
     `fleet heavy --stop preview-<name>`, rebuild a static build, check the
     port again with `fleet heavy -- ss -ltn`, and run the `--service` command
     again, on a free port if the old one is taken. Fleet runs locally when the
     box cannot start or does not answer, so a rerun can move the preview to
     another host. When the port or the `serves from` workspace changes, give
     the user the new link. With a lease, `--stop` fails when Fleet cannot
     reach Coder or the box, and the preview can still run on the box. When
     it fails twice, go on. If the preview then serves from another
     workspace, tell the user that the old link can show the old work until
     the box stops. A preview on the box stops with the box: after
     `fleet lease release`, or 24 hours after the last `--service` start.
     Run the `--service` command again to keep it longer.
   - **Without Fleet:** run
     `systemd-run --user --unit=preview-<name> --working-directory="$PWD" <command>`
     from the project.

   Serve a production build: a dev server loads each module in its own
   request and holds a hot-reload websocket, and behind the Coder proxy
   lazy chunks fail, pages reload, and Coder rejects the websocket.
   - **Project preview command:** when the project or the user's agent
     instructions document a preview command, use it, and read its log
     until it reports the preview ready:
     `journalctl --user -u preview-<name> -n 20`, through `fleet heavy --`
     with Fleet.
   - **Static build** (Storybook, `vite build`): build into a directory inside
     the project, because `/tmp` is cleared when the workspace restarts. With
     Fleet, build with `fleet heavy -- <build command>`, so the build lands
     where the preview runs: a lease syncs only the files Git sees, not ignored
     build output. Serve it with
     `python3 -m http.server <port> --bind 127.0.0.1 --directory <build-dir>`,
     with `<build-dir>` relative to the project.
   - **App with its own server:** the project's production mode, such as
     `vite build && vite preview --host 127.0.0.1 --port <port>`. Allow the
     Coder host name: Vite `server.allowedHosts: [".<wildcard-host>"]`,
     which `vite preview` reads too. Run the dev server only when the user
     asks for hot reload.
3. Check the link in a headless browser signed in to Coder. A page whose
   scripts fail still returns 200, so only a browser shows a broken
   preview. Take the Coder token from the first source that has it:
   `$CODER_SESSION_TOKEN`, then `ssh <check host> coder login token` when
   a check host is set, then `coder login token`. Below, `<link>` has
   no trailing slash and `<page>` is a path such as `/insights`. With
   `agent-browser` (on a Linux workspace, `export AGENT_BROWSER_ARGS=--no-sandbox`
   first):

   ```sh
   agent-browser open <link>/ --headers '{"Coder-Session-Token":"<token>"}'
   # Sign in to the app when it has a login, then clear the logs:
   agent-browser network requests --clear; agent-browser console --clear; agent-browser errors --clear
   # For the entry page and two or three pages the user will click through:
   agent-browser open <link><page>; agent-browser wait --load networkidle
   # After the last page, the three checks:
   agent-browser --json network requests | jq -r --arg link "<link>" \
     '.data.requests[] | select(.url | startswith($link)) | select(.status >= 400) | "\(.status) \(.url)"'
   agent-browser --json console | jq -r '.data.messages[] | select(.type == "error") | .text'
   agent-browser errors
   ```

   The `--headers` option sends the token to the preview's host only. The
   check passes when the three checks print nothing: no error response
   from the preview, no console error (a request that fails to load logs
   one), and no page error. A request without a status is not a failure
   by itself: the log shows cache hits that way. Fix each failure the
   preview causes, then check again. A failure that the project's preview
   docs list as known, or that local development of the same commit also
   shows, is a bug in the app: name it to the user beside the link.
   Confirm that the port is private:
   `curl -s -o /dev/null -w '%{http_code}\n' <link>/` returns 303, a
   redirect to Coder sign-in. Any other code means the port is shared:
   stop and tell the user. If no token or headless browser is
   available, tell the user which check was skipped. Then give the user
   the link.

Keep the port private: change no port sharing in Coder. Stop previews that are
no longer needed: `fleet heavy --stop preview-<name>` with Fleet, else
`systemctl --user stop preview-<name>`. A stop that reports the unit is not
loaded found the preview already stopped. With a lease, when `--stop` fails
twice, tell the user that the preview can still run on the box until the box
stops.
