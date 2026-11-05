import { describe, expect, test } from "bun:test";
import { spawnSync } from "node:child_process";
import { copyFileSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { checkRunbook } from "./check-runbook";

const today = new Date("2026-11-05");

const page = (steps: string, header = "Tested 2026-11-01 on staging by Sam.") => `# Consumer lag high

${header}
Stuck for 15 minutes? Page the platform rotation. Do not wait.
Agents: read [AGENT.md](AGENT.md).

## Stop the bleeding

${steps}

## Morning

Read the design doc for the long story about why consumers fall behind under load.
`;

const safeStep = `1. [safe] Copy and run:
   \`\`\`sh
   kubectl --context prod --namespace ingest get pods
   \`\`\`
   You see: \`consumer-1 CrashLoopBackOff\`
   Not that? Page the platform rotation.`;

const humanStep = `2. [human] Copy and run:
   \`\`\`sh
   kubectl --context prod --namespace ingest rollout restart deployment/consumer
   \`\`\`
   You see: \`deployment.apps/consumer restarted\`
   Costs: events wait 2 minutes.
   Undo: \`kubectl --context prod --namespace ingest rollout undo deployment/consumer\``;

const agentPage = "Follow the `responding-to-alerts` skill. The steps are in [README.md](README.md).\n";

function folder(readme: string, agent = agentPage): string {
  const dir = mkdtempSync(join(tmpdir(), "runbook-"));
  writeFileSync(join(dir, "README.md"), readme);
  writeFileSync(join(dir, "AGENT.md"), agent);
  return dir;
}

const git = (dir: string, ...args: string[]) =>
  spawnSync("git", ["-C", dir, "-c", "user.name=t", "-c", "user.email=t@t", ...args], { encoding: "utf8" }).stdout.trim();

describe("checkRunbook", () => {
  test("a tested page with a safe and a human step passes", () => {
    expect(checkRunbook(folder(page(`${safeStep}\n\n${humanStep}`)), today)).toEqual([]);
  });

  test("a human step without its cost and undo fails", () => {
    const bare = humanStep.split("\n").slice(0, 5).join("\n");
    expect(checkRunbook(folder(page(`${safeStep}\n\n${bare}`)), today)).toEqual([
      'README.md:16: step 2: [human] needs a "Costs:" line',
      'README.md:16: step 2: [human] needs an "Undo:" line',
    ]);
  });

  test("a step without a tag or a You see line fails", () => {
    expect(checkRunbook(folder(page("1. Open the dashboard.")), today)).toEqual([
      "README.md:9: step 1: start with [safe] or [human]",
      'README.md:9: step 1: add a "You see:" line',
    ]);
  });

  test("more than five steps fails", () => {
    const steps = [1, 2, 3, 4, 5, 6].map((n) => `${n}. [safe] Wait 5 minutes.\n   You see: a flat line.`).join("\n\n");
    expect(checkRunbook(folder(page(steps)), today)).toEqual(['README.md: put 1 to 5 steps under "Stop the bleeding", not 6']);
  });

  test("an expired stamp or an UNTESTED banner fails", () => {
    expect(checkRunbook(folder(page(safeStep, "Tested 2026-07-01 on staging by Sam.")), today)).toEqual([
      "README.md:3: stamp is older than 90 days: re-test the page",
    ]);
    expect(checkRunbook(folder(page(safeStep, "Tested 2026-11-01 on staging by Sam.\nUNTESTED: step 2 never ran.")), today)).toEqual([
      "README.md:4: UNTESTED banner: test every [human] step, then remove it",
    ]);
  });

  test("placeholders, vague words, and long sentences before Morning fail", () => {
    const steps = "1. [safe] Open <dashboard> and wait if needed for the line to settle down again before you go on.\n   You see: a flat line.";
    expect(checkRunbook(folder(page(steps)), today)).toEqual([
      "README.md:9: fill in <dashboard>",
      'README.md:9: "if needed" is vague: write the exact value or action',
      'README.md:9: 17 words: split "Open <dashboard> and wait if needed for ..." to 12 or fewer',
    ]);
  });

  test("a script line must be pinned to the commit that holds the same script", () => {
    const dir = folder("");
    git(dir, "init", "-q");
    copyFileSync(join(import.meta.dir, "..", "template.sh"), join(dir, "mitigate.sh"));
    git(dir, "add", "mitigate.sh");
    git(dir, "commit", "-qm", "script");
    const sha = git(dir, "rev-parse", "HEAD");
    const run = (ref: string) => `1. [human] Copy and run:\n   \`\`\`sh\n   curl -fsSL https://raw.githubusercontent.com/o/r/${ref}/mitigate.sh | bash\n   \`\`\`\n   You see: \`Done\`\n   Costs: events wait 2 minutes.\n   Undo: \`./undo.sh\``;

    writeFileSync(join(dir, "README.md"), page(run(sha)));
    expect(checkRunbook(dir, today)).toEqual([]);

    writeFileSync(join(dir, "README.md"), page(run("main")));
    expect(checkRunbook(dir, today)).toEqual(["README.md: pin the mitigate.sh line to a 40-character commit SHA, not a branch"]);

    writeFileSync(join(dir, "README.md"), page(run(sha)));
    writeFileSync(join(dir, "mitigate.sh"), "#!/usr/bin/env bash\necho changed\n");
    expect(checkRunbook(dir, today)).toEqual([`README.md: mitigate.sh differs from commit ${sha.slice(0, 7)}: commit it and put the new SHA in the page`]);
  });

  test("the agent page must name the shared skill and link the steps", () => {
    expect(checkRunbook(folder(page(safeStep), "Restart the consumer when lag is high.\n"), today)).toEqual([
      "AGENT.md: name the responding-to-alerts skill",
      "AGENT.md: link the steps in README.md",
    ]);
  });
});
