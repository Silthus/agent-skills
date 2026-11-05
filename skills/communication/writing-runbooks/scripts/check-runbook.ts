import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";

const maxSteps = 5;
const maxWords = 12;
const stampDays = 90;
const vague = ["if needed", "as needed", "if necessary", "should", "probably", "maybe", "etc", "appropriate", "as usual", "a few", "several", "some", "quickly", "soon", "just"];

type Line = { number: number; text: string };
type Step = { number: number; line: number; lines: Line[] };

export function checkRunbook(dir: string, today = new Date()): string[] {
  const pagePath = join(dir, "README.md");
  if (!existsSync(pagePath)) return ["README.md: missing"];
  const page = readFileSync(pagePath, "utf8");
  const lines = page.split("\n").map((text, index) => ({ number: index + 1, text }));
  const problems: string[] = [];
  const add = (line: number | undefined, message: string) => problems.push(line ? `README.md:${line}: ${message}` : `README.md: ${message}`);

  checkHeader(lines, today, add);
  const steps = stepsOf(lines);
  checkSteps(steps, add);
  checkWording(nightLines(lines), add);
  checkScript(dir, page, add);
  problems.push(...checkAgentPage(dir));
  return problems;
}

type Add = (line: number | undefined, message: string) => void;

function checkHeader(lines: Line[], today: Date, add: Add): void {
  if (!lines.find((line) => line.text.trim())?.text.startsWith("# ")) add(1, "start with the alert title as a # heading");
  const untested = lines.find((line) => line.text.includes("UNTESTED"));
  if (untested) add(untested.number, "UNTESTED banner: test every [human] step, then remove it");
  const stamp = lines.find((line) => /^Tested \d{4}-\d{2}-\d{2} on \S.* by \S.*\.$/.test(line.text.trim()));
  if (!stamp) return add(undefined, 'add the stamp "Tested <YYYY-MM-DD> on <environment> by <name>."');
  const tested = new Date(stamp.text.trim().slice(7, 17));
  if ((today.getTime() - tested.getTime()) / 86_400_000 > stampDays) add(stamp.number, `stamp is older than ${stampDays} days: re-test the page`);
  const header = lines.slice(0, sectionStart(lines, "Stop the bleeding") ?? lines.length).map((line) => line.text).join("\n");
  if (!/\bPage\b/.test(header)) add(undefined, "say who to page above the steps");
  if (!header.includes("[AGENT.md](AGENT.md)")) add(undefined, "link [AGENT.md](AGENT.md) above the steps");
}

function sectionStart(lines: Line[], title: string): number | undefined {
  const index = lines.findIndex((line) => line.text.trim() === `## ${title}`);
  return index < 0 ? undefined : index;
}

function stepsOf(lines: Line[]): Step[] | undefined {
  const start = sectionStart(lines, "Stop the bleeding");
  if (start === undefined) return undefined;
  const steps: Step[] = [];
  for (const line of lines.slice(start + 1)) {
    if (line.text.startsWith("## ")) break;
    const numbered = /^(\d+)\. /.exec(line.text);
    if (numbered) steps.push({ number: Number(numbered[1]), line: line.number, lines: [] });
    steps.at(-1)?.lines.push(line);
  }
  return steps;
}

function checkSteps(steps: Step[] | undefined, add: Add): void {
  if (!steps) return add(undefined, 'add a "## Stop the bleeding" section');
  if (steps.length === 0 || steps.length > maxSteps) add(undefined, `put 1 to ${maxSteps} steps under "Stop the bleeding", not ${steps.length}`);
  steps.forEach((step, index) => {
    if (step.number !== index + 1) add(step.line, `number the steps 1, 2, 3: found ${step.number}`);
    checkStep(step, steps.length, add);
  });
}

function checkStep(step: Step, count: number, add: Add): void {
  const text = step.lines.map((line) => line.text).join("\n");
  const tag = /^\d+\. \[(safe|human)\] /.exec(step.lines[0]!.text)?.[1];
  if (!tag) add(step.line, `step ${step.number}: start with [safe] or [human]`);
  if (!text.includes("You see:")) add(step.line, `step ${step.number}: add a "You see:" line`);
  if ((text.match(/```/g)?.length ?? 0) > 2) add(step.line, `step ${step.number}: one command per step`);
  if (tag === "human" && !/Costs: \S/.test(text)) add(step.line, `step ${step.number}: [human] needs a "Costs:" line`);
  if (tag === "human" && !/Undo: \S/.test(text)) add(step.line, `step ${step.number}: [human] needs an "Undo:" line`);
  for (const target of text.matchAll(/Go to step (\d+)/g)) {
    if (Number(target[1]) > count) add(step.line, `step ${step.number}: there is no step ${target[1]}`);
  }
}

function nightLines(lines: Line[]): Line[] {
  return lines.slice(0, sectionStart(lines, "Morning") ?? lines.length);
}

function checkWording(lines: Line[], add: Add): void {
  let inCode = false;
  for (const line of lines) {
    if (line.text.trim().startsWith("```")) { inCode = !inCode; continue; }
    const placeholder = /<[^>\n]+>|\b(TODO|TBD|XXX)\b/.exec(line.text)?.[0];
    if (placeholder) add(line.number, `fill in ${placeholder}`);
    if (inCode || line.text.startsWith("#")) continue;
    const prose = proseOf(line.text);
    const word = vague.find((phrase) => new RegExp(`\\b${phrase}\\b`, "i").test(prose));
    if (word) add(line.number, `"${word}" is vague: write the exact value or action`);
    for (const sentence of prose.split(/(?<=[.?!])\s+/)) {
      const words = sentence.split(/\s+/).filter(Boolean).length;
      if (words > maxWords) add(line.number, `${words} words: split "${sentence.slice(0, 40)}..." to ${maxWords} or fewer`);
    }
  }
}

function proseOf(text: string): string {
  return text
    .replace(/`[^`]*`/g, "code")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/https?:\/\/\S+/g, "link")
    .replace(/^\s*(\d+\.|-|>)\s*/, "")
    .replace(/^\[(safe|human)\]\s*/, "")
    .trim();
}

function checkScript(dir: string, page: string, add: Add): void {
  const scriptPath = join(dir, "mitigate.sh");
  if (!existsSync(scriptPath)) return;
  if (spawnSync("bash", ["-n", scriptPath]).status !== 0) add(undefined, "mitigate.sh: bash -n fails");
  const runLine = page.split("\n").find((line) => line.includes("mitigate.sh") && /\| bash\s*$/.test(line));
  if (!runLine) return add(undefined, "run mitigate.sh with one line: curl -fsSL <raw URL at a commit SHA> | bash");
  const sha = /\b[0-9a-f]{40}\b/.exec(runLine)?.[0];
  if (!sha) return add(undefined, "pin the mitigate.sh line to a 40-character commit SHA, not a branch");
  const pinned = scriptAt(dir, sha);
  if (pinned === null) return;
  if (pinned === undefined) add(undefined, `commit ${sha.slice(0, 7)} has no mitigate.sh here: commit the script and use that SHA`);
  else if (pinned !== readFileSync(scriptPath, "utf8")) add(undefined, `mitigate.sh differs from commit ${sha.slice(0, 7)}: commit it and put the new SHA in the page`);
}

function scriptAt(dir: string, sha: string): string | undefined | null {
  const top = spawnSync("git", ["-C", dir, "rev-parse", "--show-toplevel"], { encoding: "utf8" });
  if (top.status !== 0) return null;
  const path = relative(top.stdout.trim(), join(dir, "mitigate.sh"));
  const show = spawnSync("git", ["-C", dir, "show", `${sha}:${path}`], { encoding: "utf8" });
  return show.status === 0 ? show.stdout : undefined;
}

function checkAgentPage(dir: string): string[] {
  const agentPath = join(dir, "AGENT.md");
  if (!existsSync(agentPath)) return ["AGENT.md: missing"];
  const agent = readFileSync(agentPath, "utf8");
  const problems: string[] = [];
  if (!agent.includes("responding-to-alerts")) problems.push("AGENT.md: name the responding-to-alerts skill");
  if (!agent.includes("(README.md)")) problems.push("AGENT.md: link the steps in README.md");
  return problems;
}

if (import.meta.main) {
  const dir = process.argv[2];
  if (!dir) {
    console.error("Usage: bun check-runbook.ts <runbook folder>");
    process.exit(2);
  }
  const problems = checkRunbook(dir);
  if (problems.length) {
    console.error(problems.join("\n"));
    process.exit(1);
  }
  console.log("ok");
}
