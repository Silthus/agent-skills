import { describe, expect, test } from "bun:test";
import { spawnSync } from "node:child_process";
import { copyFileSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { checkRunbook, targetOf } from "./check-runbook";

const mitigation = `Least destructive first.

- If the consumer pods crash-loop after a deploy, roll it back:
  \`\`\`sh
  argocd app rollback consumer-prod-us
  \`\`\`
  Costs: the last release's fix is gone. Undo: \`argocd app sync consumer-prod-us\`.
- If lag grows with no deploy, page the platform rotation now.
- Confirm recovery: lag below 2,000 on the graph for 10 minutes.`;

const symptoms = "Events reach dashboards late. Users see stale numbers.\nSee it: [lag](https://grafana.example.com/d/lag?from=now-1h). Firing: above 2,000 events for 10 minutes.";

const page = (fix = mitigation, top = symptoms) => `# Consumer lag high

## Symptoms

${top}

## Investigation

1. Open the lag graph: https://grafana.example.com/d/lag?from=now-1h.
   A line above 2,000 confirms it.

## Mitigation

${fix}

## Escalation

Page the platform rotation when no mitigation has started within 15 minutes.
`;

function folder(readme: string, agent?: string): string {
  const dir = mkdtempSync(join(tmpdir(), "runbook-"));
  writeFileSync(join(dir, "README.md"), readme);
  if (agent !== undefined) writeFileSync(join(dir, "AGENT.md"), agent);
  return dir;
}

const git = (dir: string, ...args: string[]) =>
  spawnSync("git", ["-C", dir, "-c", "user.name=t", "-c", "user.email=t@t", ...args], { encoding: "utf8" }).stdout.trim();

describe("checkRunbook", () => {
  test("a page in the proven shape passes with no AGENT.md", () => {
    expect(checkRunbook(targetOf(folder(page())))).toEqual({ problems: [], warnings: [] });
  });

  test("a page without the four sections fails", () => {
    expect(checkRunbook(targetOf(folder("# Consumer lag high\n\n## Mitigation\n\n- If lag grows, page the platform rotation.\n"))).problems).toEqual([
      'README.md: add a "## Symptoms" section',
      'README.md: add a "## Investigation" section',
      'README.md: add a "## Escalation" section',
    ]);
  });

  test("test status, history, role lines, and agent sections on the page fail", () => {
    const top = [
      symptoms,
      "UNTESTED: steps 1 and 3 have no recorded run.",
      "Partly tested 2026-11-09 on prod-eu by Sam.",
      "You are the person: run every step yourself.",
      'Agents: read "For agents" under Investigation.',
      "History: from 2026-08-15 to 2026-11-13, this alert would have paged 2 times.",
      "This warning pages nobody. Read it at your desk.",
      "",
      "### For agents",
    ].join("\n");
    expect(checkRunbook(targetOf(folder(page(mitigation, top)))).problems).toEqual([
      "README.md:7: test status goes in the PR description, not on the page",
      "README.md:8: test status goes in the PR description, not on the page",
      "README.md:9: drop the role line: the top serves the person, the body the agent",
      'README.md:10: drop the agents line: responding-to-alerts reads the body as is',
      "README.md:11: backtests and past fires go in the PR description, not on the page",
      "README.md:12: drop the aside: say what to look at and what to do",
      "README.md:14: drop the agent section: put each query in its check",
    ]);
  });

  test("the top is a few plain lines with a link to see it", () => {
    const query = "Lag is high.\n```promql\nsum(kafka_consumergroup_lag)\n```";
    expect(checkRunbook(targetOf(folder(page(mitigation, query)))).problems).toEqual([
      'README.md:6: move the code below "## Symptoms": the top is plain words for the person',
      'README.md:3: link one or two panels under "## Symptoms" that show the firing value',
    ]);
    const long = `${symptoms}\n${"Users see stale numbers.\n".repeat(8)}`;
    expect(checkRunbook(targetOf(folder(page(mitigation, long)))).warnings).toEqual([
      'README.md:3: 10 lines under "## Symptoms": keep the top to what is broken, who is hit, and the links',
    ]);
  });

  test("a goto flow with step tags and You see lines fails", () => {
    const flow = "1. [safe] Open the graph.\n   You see: a line above 2,000.\n   Below? Go to step 4.";
    expect(checkRunbook(targetOf(folder(page(flow)))).problems).toEqual([
      'README.md:15: drop the step tag: a production change names its "Costs:" and "Undo:"',
      "README.md:16: say what to look for in the check itself, not on a You see: line",
      'README.md:17: write "If <condition>, <action>." bullets, not a jump to another step',
    ]);
  });

  test("placeholders and vague words fail; long sentences and long pages only warn", () => {
    const fix = "- If lag grows, restart <deployment> and wait if needed.\n- If the restart did not help and lag keeps growing across every partition in both regions with no recent deploy on record, page the platform rotation now.";
    const report = checkRunbook(targetOf(folder(page(fix, symptoms + "\n" + "Events arrive late.\n".repeat(90)))));
    expect(report.problems).toEqual([
      'README.md:106: "if needed" is vague: write the exact value or action',
      "README.md:106: fill in <deployment>",
    ]);
    expect(report.warnings).toEqual([
      "README.md: 111 lines: proven runbooks run 40 to 100; cut background to a link",
      'README.md:3: 92 lines under "## Symptoms": keep the top to what is broken, who is hit, and the links',
      'README.md:107: 27 words: split "If the restart did not help and lag keep..."',
    ]);
  });

  test("a script line must be pinned to the commit that holds the same script", () => {
    const dir = folder("");
    git(dir, "init", "-q");
    copyFileSync(join(import.meta.dir, "..", "template.sh"), join(dir, "mitigate.sh"));
    git(dir, "add", "mitigate.sh");
    git(dir, "commit", "-qm", "script");
    const sha = git(dir, "rev-parse", "HEAD");
    const run = (ref: string) => `- If lag grows, run the restart script:\n  \`\`\`sh\n  curl -fsSL https://raw.githubusercontent.com/o/r/${ref}/mitigate.sh | bash\n  \`\`\`\n  Costs: events wait 2 minutes. Undo: none.`;

    writeFileSync(join(dir, "README.md"), page(run(sha)));
    expect(checkRunbook(targetOf(dir)).problems).toEqual([]);

    writeFileSync(join(dir, "README.md"), page(run("main")));
    expect(checkRunbook(targetOf(dir)).problems).toEqual(["README.md: pin the mitigate.sh line to a 40-character commit SHA, not a branch"]);

    writeFileSync(join(dir, "README.md"), page(run(sha)));
    writeFileSync(join(dir, "mitigate.sh"), "#!/usr/bin/env bash\necho changed\n");
    expect(checkRunbook(targetOf(dir)).problems).toEqual([`README.md: mitigate.sh differs from commit ${sha.slice(0, 7)}: commit it and put the new SHA in the page`]);
  });

  test("an AGENT.md, when present, must name the shared skill and link the page", () => {
    expect(checkRunbook(targetOf(folder(page(), "Restart the consumer when lag is high.\n"))).problems).toEqual([
      "AGENT.md: name the responding-to-alerts skill",
      "AGENT.md: link the checks in README.md",
    ]);
  });

  test("a runbook in a repo's own format keeps its sections and checks the bullets under Mitigation", () => {
    const dir = mkdtempSync(join(tmpdir(), "runbook-"));
    const file = join(dir, "ConsumerLagHigh.md");
    const hosted = (fix: string) => `---
alert: ConsumerLagHigh
---

## Symptoms

Consumers fall behind under load. Events reach dashboards late.
See it: [lag](https://grafana.example.com/d/lag). Firing: above 2,000 events.

## Investigation

1. Read the consumer logs around the time the lag started to grow, and compare them with the deploy history.

## Mitigation

${fix}

## Escalation

Post in the team channel.
`;
    writeFileSync(file, hosted(mitigation));
    expect(checkRunbook(targetOf(file))).toEqual({ problems: [], warnings: [] });

    writeFileSync(file, hosted("Roll back the deploy."));
    expect(checkRunbook(targetOf(file)).problems).toEqual(['ConsumerLagHigh.md: write the mitigations as bullets under "Mitigation"']);

    const commandFirst = "```bash\n# prod-us\naws sesv2 get-account --region us-east-1\n```\n\n- **If** sending is paused, page the platform rotation now.";
    writeFileSync(file, hosted(commandFirst));
    expect(checkRunbook(targetOf(file)).problems).toEqual([]);

    writeFileSync(file, hosted("```bash\n- not a bullet\n1. not a step\n```\n\nRoll back the deploy."));
    expect(checkRunbook(targetOf(file)).problems).toEqual(['ConsumerLagHigh.md: write the mitigations as bullets under "Mitigation"']);
  });
});
