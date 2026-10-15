import { afterEach, expect, test } from "bun:test";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { readSettings, SETTINGS_PATH } from "./settings.ts";

const homes: string[] = [];
afterEach(() => homes.splice(0).forEach((path) => rmSync(path, { recursive: true, force: true })));

function homeWithSettings(content?: string): string {
  const home = mkdtempSync(join(tmpdir(), "t3-kickoff-settings-"));
  homes.push(home);
  if (content !== undefined) {
    mkdirSync(dirname(join(home, SETTINGS_PATH)), { recursive: true });
    writeFileSync(join(home, SETTINGS_PATH), content);
  }
  return home;
}

test("reads the settings file, and an environment variable overrides its key", () => {
  const home = homeWithSettings(JSON.stringify({ availabilityFile: "/var/report.json", remoteScript: "/opt/kickoff.ts" }));
  expect(readSettings(home, { T3_KICKOFF_AVAILABILITY_FILE: "/tmp/report.json" })).toEqual({
    availabilityFile: "/tmp/report.json",
    remoteScript: "/opt/kickoff.ts",
  });
});

test("has no settings without a file or environment variables", () => {
  expect(readSettings(homeWithSettings(), {})).toEqual({});
});

test("refuses a setting that is not a string", () => {
  expect(() => readSettings(homeWithSettings(JSON.stringify({ remoteScript: 1 })), {})).toThrow("remoteScript");
});
