import { describe, expect, test } from "bun:test";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { callingThread, handoffPrompt, matchProjects, modelFlags, projectRepository, remoteCommand, repositoryKey } from "./handoff.ts";

const app = {
  id: "project-app",
  title: "app",
  workspaceRoot: "/home/user/dev/app",
  repositoryIdentity: { canonicalKey: "github.com/acme/app", locator: { remoteUrl: "git@github.com:Acme/app.git" } },
};
const docs = { id: "project-docs", title: "docs", workspaceRoot: "/home/user/dev/docs", repositoryIdentity: null };

const thread = (id: string, worktreePath: string | null, state: string, projectId = app.id) => ({
  id,
  title: `Thread ${id}`,
  projectId,
  worktreePath,
  modelSelection: { instanceId: "claudeAgent", model: "claude-opus-5-5" },
  archivedAt: null,
  status: state,
});

describe("matchProjects", () => {
  test("finds a project by id, title, or repository", () => {
    for (const key of ["project-app", "app", "github.com/acme/app"]) {
      expect(matchProjects([app, docs], key)).toEqual([app]);
    }
  });

  test("finds nothing for an unknown repository", () => {
    expect(matchProjects([app, docs], "github.com/acme/unknown")).toEqual([]);
  });

  test("finds a project without a repository identity by its origin remote", () => {
    const unidentified = { ...app, repositoryIdentity: null };
    const originUrl = (root: string) => (root === app.workspaceRoot ? "git@github.com:Acme/app.git" : undefined);
    expect(matchProjects([unidentified, docs], "github.com/Acme/app", originUrl)).toEqual([unidentified]);
  });

  test("finds a fork whose identity names the upstream by its origin remote", () => {
    const fork = { ...app, repositoryIdentity: { canonicalKey: "github.com/upstream/app" } };
    const originUrl = (root: string) => (root === app.workspaceRoot ? "git@github.com:Acme/app.git" : undefined);
    expect(matchProjects([fork, docs], "github.com/acme/app", originUrl)).toEqual([fork]);
    expect(matchProjects([fork, docs], "github.com/upstream/app", originUrl)).toEqual([fork]);
  });
});

describe("projectRepository", () => {
  test("names a fork by its origin remote, where its branches are pushed", () => {
    const fork = { ...app, repositoryIdentity: { canonicalKey: "github.com/upstream/app" } };
    expect(projectRepository(fork, () => "git@github.com:Acme/app.git")).toBe("github.com/acme/app");
  });

  test("falls back to the repository identity without an origin remote", () => {
    expect(projectRepository(app, () => undefined)).toBe("github.com/acme/app");
  });
});

describe("repositoryKey", () => {
  test("is host and path in lower case for every remote URL form", () => {
    for (const url of [
      "git@github.com:Acme/app.git",
      "https://github.com/Acme/app",
      "https://github.com/Acme/app.git",
      "ssh://git@github.com/Acme/app.git",
    ]) {
      expect(repositoryKey(url)).toBe("github.com/acme/app");
    }
  });
});

describe("callingThread", () => {
  const worktree = "/home/user/.t3/worktrees/app/t3code-335e6425";

  test("is the thread with a running turn in this worktree", () => {
    const shell = {
      projects: [app],
      threads: [thread("old", worktree, "completed"), thread("self", worktree, "running"), thread("other", "/tmp/x", "running")],
    };
    expect(callingThread(shell, worktree)?.id).toBe("self");
  });

  test("is a project-root thread when the thread has no worktree", () => {
    const shell = { projects: [app], threads: [thread("self", null, "running")] };
    expect(callingThread(shell, app.workspaceRoot)?.id).toBe("self");
  });

  test("is found through a symlinked project root", () => {
    const shell = { projects: [app], threads: [thread("self", null, "running")] };
    const resolve = (path: string) => path.replace("/home/user/dev/app", "/home/user/src/app");
    expect(callingThread(shell, "/home/user/src/app", resolve)?.id).toBe("self");
  });

  test("is unknown when two threads run in the same directory", () => {
    const shell = { projects: [app], threads: [thread("a", worktree, "running"), thread("b", worktree, "running")] };
    expect(callingThread(shell, worktree)).toBeUndefined();
  });
});

describe("modelFlags", () => {
  test("carries the provider, model, and options of the thread", () => {
    const selection = {
      instanceId: "claudeAgent",
      model: "claude-opus-5-5",
      options: [{ id: "effort", value: "high" }, { id: "fastMode", value: false }, { id: "contextWindow", value: "1m" }],
    };
    expect(modelFlags(selection)).toEqual([
      "--provider", "claudeAgent", "--model", "claude-opus-5-5", "--effort", "high", "--context-window", "1m",
    ]);
  });

  test("omits options the thread does not set", () => {
    expect(modelFlags({ instanceId: "codex", model: "gpt-6.1-sol", options: [] })).toEqual([
      "--provider", "codex", "--model", "gpt-6.1-sol", "--effort", "none", "--context-window", "none",
    ]);
  });
});

describe("remoteCommand", () => {
  const fakeBunHome = () => {
    const home = mkdtempSync(join(tmpdir(), "handoff-"));
    const bin = join(home, "bin");
    mkdirSync(bin);
    writeFileSync(join(bin, "bun"), "#!/bin/sh\nprintf '%s\\n' \"$@\"\n", { mode: 0o755 });
    return { home, env: { HOME: home, SHELL: "/bin/sh", PATH: `${bin}:/usr/bin:/bin` } };
  };
  const install = (path: string) => {
    mkdirSync(join(path, ".."), { recursive: true });
    writeFileSync(path, "");
    return path;
  };
  const args = ["--title", "Fix the user's \"export\" $HOME `id`", "--base", "t3code/abc"];

  test("runs the installed kickoff in a login shell with every argument intact", () => {
    const { home, env } = fakeBunHome();
    const script = install(join(home, ".claude/skills/t3-kickoff/scripts/kickoff.ts"));

    const result = spawnSync("/bin/sh", ["-c", remoteCommand(args)], { encoding: "utf8", env });

    expect(result.stdout.trimEnd().split("\n")).toEqual([script, ...args]);
  });

  test("prefers the script the override names", () => {
    const { home, env } = fakeBunHome();
    install(join(home, ".agents/skills/t3-kickoff/scripts/kickoff.ts"));
    const script = install(join(home, "skills/t3-kickoff/scripts/kickoff.ts"));

    const result = spawnSync("/bin/sh", ["-c", remoteCommand(args, script)], { encoding: "utf8", env });

    expect(result.stdout.trimEnd().split("\n")[0]).toBe(script);
  });

  test("fails when the target has no t3-kickoff skill", () => {
    const { env } = fakeBunHome();

    const result = spawnSync("/bin/sh", ["-c", remoteCommand(args)], { encoding: "utf8", env });

    expect(result.status).toBe(127);
    expect(result.stderr).toContain("t3-kickoff is not installed");
  });
});

describe("handoffPrompt", () => {
  test("tells the new thread where the work came from and where to push", () => {
    const prompt = handoffPrompt({ source: "hub", title: "Fix the export", branch: "t3code/abc" }, "Do the rest.");
    expect(prompt).toContain("hub");
    expect(prompt).toContain("Fix the export");
    expect(prompt).toContain("git push origin HEAD:t3code/abc");
    expect(prompt.endsWith("Do the rest.")).toBe(true);
  });
});
