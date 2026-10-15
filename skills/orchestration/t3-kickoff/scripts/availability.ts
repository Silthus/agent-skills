import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { readSettings, type Settings } from "./settings.ts";

type Status = "available" | "exhausted" | "unknown";
export type Availability = { checkedAt?: string; providers: Record<"claude" | "codex", Status> };
const unknown = (): Availability => ({ providers: { claude: "unknown", codex: "unknown" } });

function parseAvailability(text: string, now = Date.now()): Availability {
  try {
    const report = JSON.parse(text) as Availability;
    const age = now - Date.parse(report.checkedAt ?? "");
    if (!Number.isFinite(age) || age < 0 || age > 11 * 60_000) return unknown();
    if (![report.providers.claude, report.providers.codex].every((value) => ["available", "exhausted", "unknown"].includes(value))) return unknown();
    return report;
  } catch { return unknown(); }
}

export function readAvailability(path: string, now = Date.now()): Availability {
  try { return parseAvailability(readFileSync(path, "utf8"), now); }
  catch { return unknown(); }
}

function fleetCli(home = homedir()): string | undefined {
  const local = join(home, "dev/fleet/fleet");
  return Bun.which("fleet") ?? (existsSync(local) ? local : undefined);
}

function fleetAvailability(fleet: string): Availability {
  const result = spawnSync(fleet, ["availability"], { encoding: "utf8", timeout: 15_000 });
  return result.status === 0 ? parseAvailability(result.stdout) : unknown();
}

export function sharedAvailability(settings: Settings = readSettings(), home = homedir()): Availability {
  if (settings.availabilityFile) return readAvailability(settings.availabilityFile);
  const fleet = fleetCli(home);
  return fleet ? fleetAvailability(fleet) : unknown();
}

export function assertProviderAvailable(model: string, availability = sharedAvailability()) {
  const provider = model.startsWith("gpt-") ? "codex" : model.startsWith("claude-") ? "claude" : undefined;
  if (provider && availability.providers[provider] === "exhausted") throw new Error(`${provider} has verified exhausted quota in the shared availability report. Keep the selected model and wait for confirmed recovery.`);
}
