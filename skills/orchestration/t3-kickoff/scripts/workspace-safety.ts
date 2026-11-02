import { existsSync, readFileSync, realpathSync } from "node:fs";
import { homedir } from "node:os";
import { isAbsolute, join, relative, resolve, sep } from "node:path";

const POLICY_PATHS = [".config/t3-kickoff/workspace-safety.json", ".config/fleet/workspace-safety.json"];

export function assertWorkspaceSafe(workspace: string, home = homedir()): void {
  const policyPath = POLICY_PATHS.map((path) => join(home, path)).find((path) => existsSync(path));
  if (!policyPath) return;
  const policy = JSON.parse(readFileSync(policyPath, "utf8")) as { protectedRoots?: unknown };
  if (!Array.isArray(policy.protectedRoots) || !policy.protectedRoots.every((root) => typeof root === "string" && root.length && !isAbsolute(root) && !root.split(/[\\/]/).includes(".."))) throw new Error("Invalid workspace safety policy in " + policyPath);
  const canonical = (path: string) => existsSync(path) ? realpathSync(path) : resolve(path);
  const candidate = canonical(workspace);
  for (const root of policy.protectedRoots as string[]) {
    const protectedPath = canonical(join(home, root));
    const path = relative(protectedPath, candidate);
    if (!path || path !== ".." && !path.startsWith(".." + sep) && !isAbsolute(path)) throw new Error("Refused protected workspace " + protectedPath + ". Launch with a new worktree and preserve the existing checkout.");
  }
}
