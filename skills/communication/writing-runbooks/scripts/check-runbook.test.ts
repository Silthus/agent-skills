import { describe, expect, test } from "bun:test";
import { spawnSync } from "node:child_process";
import { copyFileSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { checkRunbook, targetOf } from "./check-runbook";

const today = new Date("2026-11-05");

const page = (steps: string, header = "Tested 2026-11-01 on staging by Sam.") => `# Consumer lag high

${header}
Stuck for 15 minutes? Page the platform rotation. Do not wait.
You are the person: run every step yourself, \`[human]\` steps too.
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
    expect(checkRunbook(targetOf(folder(page(`${safeStep}\n\n${humanStep}`))), today)).toEqual([]);
  });

  test("a human step without its cost and undo fails", () => {
    const bare = humanStep.split("\n").slice(0, 5).join("\n");
    expect(checkRunbook(targetOf(folder(page(`${safeStep}\n\n${bare}`))), today)).toEqual([
      'README.md:17: step 2: [human] needs a "Costs:" line',
      'README.md:17: step 2: [human] needs an "Undo:" line',
    ]);
  });

  test("a step without a tag or a You see line fails", () => {
    expect(checkRunbook(targetOf(folder(page("1. Open the dashboard."))), today)).toEqual([
      "README.md:10: step 1: start with [safe] or [human]",
      'README.md:10: step 1: add a "You see:" line',
    ]);
  });

  test("more than five steps fails", () => {
    const steps = [1, 2, 3, 4, 5, 6].map((n) => `${n}. [safe] Wait 5 minutes.\n   You see: a flat line.`).join("\n\n");
    expect(checkRunbook(targetOf(folder(page(steps))), today)).toEqual(['README.md: put 1 to 5 steps first under "Stop the bleeding", not 6']);
  });

  test("an expired stamp or an UNTESTED banner fails", () => {
    expect(checkRunbook(targetOf(folder(page(safeStep, "Tested 2026-07-01 on staging by Sam."))), today)).toEqual([
      "README.md:3: stamp is older than 90 days: re-test the page",
    ]);
    expect(checkRunbook(targetOf(folder(page(safeStep, "UNTESTED: step 1 has no recorded run.\nPartly tested 2026-11-01 on staging by Sam."))), today)).toEqual([
      "README.md:3: UNTESTED banner: record a run of every step it names, then remove it",
    ]);
    expect(checkRunbook(targetOf(folder(page(safeStep, "UNTESTED: step 1 has no recorded run.\nTested 2026-11-01 on staging by Sam."))), today)).toEqual([
      "README.md:3: UNTESTED banner: record a run of every step it names, then remove it",
      'README.md:4: write "Partly tested" while the UNTESTED banner stands',
    ]);
  });

  test("placeholders, vague words, and long sentences before Morning fail", () => {
    const steps = "1. [safe] Open <dashboard> and wait if needed for the line to settle down again before you go on.\n   You see: a flat line.";
    expect(checkRunbook(targetOf(folder(page(steps))), today)).toEqual([
      "README.md:10: fill in <dashboard>",
      'README.md:10: "if needed" is vague: write the exact value or action',
      'README.md:10: 17 words: split "Open <dashboard> and wait if needed for ..." to 12 or fewer',
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
    expect(checkRunbook(targetOf(dir), today)).toEqual([]);

    writeFileSync(join(dir, "README.md"), page(run("main")));
    expect(checkRunbook(targetOf(dir), today)).toEqual(["README.md: pin the mitigate.sh line to a 40-character commit SHA, not a branch"]);

    writeFileSync(join(dir, "README.md"), page(run(sha)));
    writeFileSync(join(dir, "mitigate.sh"), "#!/usr/bin/env bash\necho changed\n");
    expect(checkRunbook(targetOf(dir), today)).toEqual([`README.md: mitigate.sh differs from commit ${sha.slice(0, 7)}: commit it and put the new SHA in the page`]);
  });

  test("the agent page must name the shared skill and link the steps", () => {
    expect(checkRunbook(targetOf(folder(page(safeStep), "Restart the consumer when lag is high.\n")), today)).toEqual([
      "AGENT.md: name the responding-to-alerts skill",
      "AGENT.md: link the steps in README.md",
    ]);
  });

  test("a runbook in a repo's own format keeps its sections and checks the steps under Mitigation", () => {
    const dir = mkdtempSync(join(tmpdir(), "runbook-"));
    const file = join(dir, "ConsumerLagHigh.md");
    const hosted = (agents: string) => `---
alert: ConsumerLagHigh
---

## Symptoms

Tested 2026-11-01 on staging by Sam.
Stuck for 15 minutes? Page the platform rotation.
You are the person: run every step yourself, \`[human]\` steps too.

Consumers fall behind under load, and this paragraph may run as long as the daytime reader likes it to.

## Investigation

Read the consumer logs around the time the lag started to grow, and compare them with the deploy history.
${agents}
## Mitigation

${safeStep}

${humanStep}

### From a toolbox pod

Longer daytime notes can follow the steps under their own heading, with as many words as they need.

## Escalation

Post in the team channel.
`;
    writeFileSync(file, hosted("\n### For agents\n\nFollow the `responding-to-alerts` skill. Run [safe] steps under Mitigation.\n"));
    expect(checkRunbook(targetOf(file), today)).toEqual([]);

    writeFileSync(file, hosted(""));
    expect(checkRunbook(targetOf(file), today)).toEqual(['ConsumerLagHigh.md: add a "### For agents" section']);
  });
});
