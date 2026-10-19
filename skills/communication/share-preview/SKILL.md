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
CLI is signed in. Step 3 runs its check there.

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
     another host. When its `serves from` line names another workspace, give
     the user the new link. A leased preview stops with its box: after
     `fleet lease release`, or when Coder stops the idle box.
   - **Without Fleet:** run
     `systemd-run --user --unit=preview-<name> --working-directory="$PWD" <command>`
     from the project.

   The command:
   - **Static build** (Storybook, `vite build`): build into a directory inside
     the project, because `/tmp` is cleared when the workspace restarts. With
     Fleet, build with `fleet heavy -- <build command>`, so the build lands
     where the preview runs: a lease syncs only the files Git sees, not ignored
     build output. Serve it with
     `python3 -m http.server <port> --bind 127.0.0.1 --directory <build-dir>`,
     with `<build-dir>` relative to the project.
   - **Dev server:** the project's dev command. Coder forwards its own host
     name, so allow it: Vite `server.allowedHosts: [".<wildcard-host>"]`.
3. Check the link. The page and one of its scripts or stylesheets return 200
   with a Coder session token:
   `curl -s -o /dev/null -w "%{http_code}\n" -H "Coder-Session-Token: $(coder login token)" <url>`.
   Use `$CODER_SESSION_TOKEN` instead of `$(coder login token)` when it is
   set. When `$PREVIEW_CHECK_HOST` is set, run the same command there:
   `ssh "$PREVIEW_CHECK_HOST" '<command>'`.
   A request without the token returns 303 to Coder sign-in, which shows the
   port is private. If no signed-in `coder` CLI or token is available, run
   only the request without the token, and tell the user that the 200 check
   was skipped. Then give the user the link.

Keep the port private: change no port sharing in Coder. Stop previews that are
no longer needed: `fleet heavy --stop preview-<name>` with Fleet, else
`systemctl --user stop preview-<name>`. With a lease, a failed `--stop` could
not reach Coder or the box, so the preview can still run there. Run it once
more. If it fails again, go on, and tell the user that the old link can show
the old work until the box stops.
