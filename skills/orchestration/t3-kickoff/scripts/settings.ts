import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

export type Settings = Partial<Record<keyof typeof ENV_OVERRIDES, string>>;
type Env = Record<string, string | undefined>;

const ENV_OVERRIDES = {
  availabilityFile: "T3_KICKOFF_AVAILABILITY_FILE",
  remoteScript: "T3_KICKOFF_REMOTE_SCRIPT",
} as const;

export const SETTINGS_PATH = ".config/t3-kickoff/settings.json";

function readSettingsFile(path: string): Record<string, unknown> {
  if (!existsSync(path)) return {};
  const parsed: unknown = JSON.parse(readFileSync(path, "utf8"));
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) throw new Error(`${path} must hold a JSON object`);
  return parsed as Record<string, unknown>;
}

export function readSettings(home = homedir(), env: Env = process.env): Settings {
  const path = join(home, SETTINGS_PATH);
  const file = readSettingsFile(path);
  const settings: Settings = {};
  for (const [key, envName] of Object.entries(ENV_OVERRIDES) as Array<[keyof Settings, string]>) {
    const value = env[envName] || file[key];
    if (value === undefined || value === "") continue;
    if (typeof value !== "string") throw new Error(`${key} in ${path} must be a string`);
    settings[key] = value;
  }
  return settings;
}
