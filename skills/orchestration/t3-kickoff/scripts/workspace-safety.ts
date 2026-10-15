import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, realpathSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, isAbsolute, join, relative, resolve, sep } from "node:path";

const POLICY_PATHS = [".config/t3-kickoff/workspace-safety.json", ".config/fleet/workspace-safety.json"];

export function assertWorkspaceSafe(workspace: string, home = homedir()): void {
  const policyPath = POLICY_PATHS.map((path) => join(home, path)).find((path) => existsSync(path));
  if (!policyPath) return;
  const policy = JSON.parse(readFileSync(policyPath, "utf8")) as { protectedRoots?: unknown };
  if (!Array.isArray(policy.protectedRoots) || !policy.protectedRoots.every((root) => typeof root === "string" && root.length && !isAbsolute(root) && !root.split(/[\\/]/).includes(".."))) throw new Error("Invalid workspace safety policy in " + policyPath);
  const canonical = (path: string) => existsSync(path) ? realpathSync(path) : resolve(path);
  const check = (candidate: string) => {
    for (const root of policy.protectedRoots as string[]) {
      const protectedPath = canonical(join(home, root));
      const path = relative(protectedPath, candidate);
      if (!path || path !== ".." && !path.startsWith(".." + sep) && !isAbsolute(path)) throw new Error("Refused protected workspace or Git metadata under " + protectedPath + ". Use an independent clone and preserve the existing checkout.");
    }
  };
  check(canonical(workspace));
  if (!policy.protectedRoots.length) return;
  const result = spawnSync("git", ["-C", workspace, "rev-parse", "--path-format=absolute", "--git-common-dir"], { encoding: "utf8", env: Object.fromEntries(Object.entries(process.env).filter(([key]) => !key.startsWith("GIT_"))) });
  if (result.status !== 0) {
    for (let path = canonical(workspace); ; path = dirname(path)) {
      if (existsSync(join(path, ".git"))) throw new Error("Cannot verify workspace Git metadata before launch");
      if (dirname(path) === path) return;
    }
  }
  check(canonical(result.stdout.trim()));
}
