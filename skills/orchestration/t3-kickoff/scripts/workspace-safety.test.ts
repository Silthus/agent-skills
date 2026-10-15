import { afterEach, expect, test } from "bun:test";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { assertWorkspaceSafe } from "./workspace-safety.ts";

const fixtures: string[] = [];
afterEach(() => fixtures.splice(0).forEach((path) => rmSync(path, { recursive: true, force: true })));

test("protected Git metadata cannot back an agent worktree and local edits survive refusal", () => {
  const home = mkdtempSync(join(tmpdir(), "workspace-safety-"));
  fixtures.push(home);
  mkdirSync(join(home, ".config/t3-kickoff"), { recursive: true });
  writeFileSync(join(home, ".config/t3-kickoff/workspace-safety.json"), JSON.stringify({ protectedRoots: ["app"] }));
  const checkout = join(home, "app");
  const git = (args: string[]) => {
    const result = Bun.spawnSync(["git", ...args], { env: { ...Object.fromEntries(Object.entries(process.env).filter(([key]) => !key.startsWith("GIT_"))), GIT_CONFIG_GLOBAL: "/dev/null", GIT_CONFIG_SYSTEM: "/dev/null" } });
    if (result.exitCode !== 0) throw new Error(result.stderr.toString());
  };
  git(["init", "-q", checkout]);
  writeFileSync(join(checkout, "tracked.txt"), "committed\n");
  git(["-C", checkout, "add", "."]);
  git(["-C", checkout, "-c", "user.name=Test", "-c", "user.email=test@example.invalid", "commit", "-qm", "fixture"]);
  writeFileSync(join(checkout, "tracked.txt"), "local edits\n");
  const worktree = join(home, "outside");
  git(["-C", checkout, "worktree", "add", "-qb", "worker", worktree]);
  expect(() => assertWorkspaceSafe(checkout, home)).toThrow("protected workspace");
  expect(() => assertWorkspaceSafe(worktree, home)).toThrow("protected workspace");
  expect(readFileSync(join(checkout, "tracked.txt"), "utf8")).toBe("local edits\n");
  const safe = join(home, "dev/app");
  git(["init", "-q", safe]);
  expect(() => assertWorkspaceSafe(safe, home)).not.toThrow();
  const inherited = process.env.GIT_DIR;
  try {
    process.env.GIT_DIR = join(safe, ".git");
    expect(() => assertWorkspaceSafe(worktree, home)).toThrow("protected workspace");
  } finally {
    if (inherited === undefined) delete process.env.GIT_DIR; else process.env.GIT_DIR = inherited;
  }
  const scratch = join(home, "scratch");
  mkdirSync(scratch);
  expect(() => assertWorkspaceSafe(scratch, home)).not.toThrow();
});

test("the Fleet policy path applies when no t3-kickoff policy exists", () => {
  const home = mkdtempSync(join(tmpdir(), "workspace-safety-"));
  fixtures.push(home);
  mkdirSync(join(home, ".config/fleet"), { recursive: true });
  writeFileSync(join(home, ".config/fleet/workspace-safety.json"), JSON.stringify({ protectedRoots: ["app"] }));
  mkdirSync(join(home, "app"));
  expect(() => assertWorkspaceSafe(join(home, "app"), home)).toThrow("protected workspace");
});
