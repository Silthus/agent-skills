import { afterEach, expect, test } from "bun:test";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { assertProviderAvailable, sharedAvailability } from "./availability.ts";

const fixtures: string[] = [];
afterEach(() => fixtures.splice(0).forEach((path) => rmSync(path, { recursive: true, force: true })));

function report(checkedAt: string): string {
  const home = mkdtempSync(join(tmpdir(), "availability-"));
  fixtures.push(home);
  const path = join(home, "report.json");
  writeFileSync(path, JSON.stringify({ checkedAt, providers: { claude: "exhausted", codex: "available" } }));
  return path;
}

test("a fresh report from the configured availability file blocks only the exhausted provider", () => {
  const availability = sharedAvailability({ availabilityFile: report(new Date().toISOString()) }, "/nonexistent");
  expect(() => assertProviderAvailable("claude-opus-5-5", availability)).toThrow("claude has verified exhausted quota");
  expect(() => assertProviderAvailable("gpt-6.1-sol", availability)).not.toThrow();
});

test("a stale or missing report blocks nothing", () => {
  const stale = sharedAvailability({ availabilityFile: report("2020-01-01T00:00:00.000Z") }, "/nonexistent");
  expect(() => assertProviderAvailable("claude-opus-5-5", stale)).not.toThrow();
  const missing = sharedAvailability({ availabilityFile: "/nonexistent/report.json" }, "/nonexistent");
  expect(missing.providers).toEqual({ claude: "unknown", codex: "unknown" });
});

test("without a report file, the fleet CLI in ~/dev/fleet supplies the report", () => {
  const home = mkdtempSync(join(tmpdir(), "availability-"));
  fixtures.push(home);
  mkdirSync(join(home, "dev/fleet"), { recursive: true });
  const checkedAt = new Date().toISOString();
  writeFileSync(join(home, "dev/fleet/fleet"), `#!/bin/sh\necho '{"checkedAt":"${checkedAt}","providers":{"claude":"available","codex":"exhausted"}}'\n`, { mode: 0o755 });
  const path = process.env.PATH;
  try {
    process.env.PATH = "/usr/bin:/bin";
    expect(sharedAvailability({}, home).providers).toEqual({ claude: "available", codex: "exhausted" });
  } finally {
    process.env.PATH = path;
  }
});
