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

1. Pick a short lowercase name, such as the prototype or branch name, and a
   free port: `ss -ltn` does not list it.
2. Serve the work on `127.0.0.1:<port>` as a systemd user service, so it
   outlives this session.
   - **With Fleet** (`~/dev/fleet/fleet` exists): run
     `~/dev/fleet/fleet heavy --service preview-<name> -- <command>` from the
     project. Fleet starts the service in its heavy slice, on the worktree's
     compute box when the worktree has a lease, and prints
     `serves from <workspace>`. Use that workspace for `<workspace>` in the
     link; with a lease, `~/dev/fleet/fleet lease status --json` also gives the
     `agent` and `owner`. Take the preview down with
     `~/dev/fleet/fleet heavy --stop preview-<name>`.
   - **Without Fleet:** run `systemd-run --user --unit=preview-<name> <command>`.
     If `systemd-run` cannot reach the user manager, run
     `export XDG_RUNTIME_DIR=/run/user/$(id -u)` first.

   The command:
   - **Static build** (Storybook, `vite build`): build into a directory inside
     the project, because `/tmp` is cleared when the workspace restarts. Serve
     it with `python3 -m http.server <port> --bind 127.0.0.1 --directory <build-dir>`.
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

Keep the port private: change no port sharing in Coder. To take a preview
down without Fleet, run `systemctl --user stop preview-<name>`. Stop previews that are no
longer needed.
