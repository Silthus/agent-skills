import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, statSync } from "node:fs";
import { basename, join, relative } from "node:path";

const maxSteps = 5;
const maxWords = 12;
const stampDays = 90;
const vague = ["if needed", "as needed", "if necessary", "should", "probably", "maybe", "etc", "appropriate", "as usual", "a few", "several", "some", "quickly", "soon", "just"];

type Line = { number: number; text: string };
type Step = { number: number; line: number; lines: Line[] };
type Add = (line: number | undefined, message: string) => void;

type Target = {
  pagePath: string;
  scriptPath: string;
  section: string;
  hostFormat: boolean;
};

export function targetOf(path: string, section?: string): Target {
  if (statSync(path, { throwIfNoEntry: false })?.isDirectory()) {
    return { pagePath: join(path, "README.md"), scriptPath: join(path, "mitigate.sh"), section: section ?? "Stop the bleeding", hostFormat: false };
  }
  return { pagePath: path, scriptPath: path.replace(/\.md$/, ".sh"), section: section ?? "Mitigation", hostFormat: true };
}

export function checkRunbook(target: Target, today = new Date()): string[] {
  const name = basename(target.pagePath);
  if (!existsSync(target.pagePath)) return [`${name}: missing`];
  const page = readFileSync(target.pagePath, "utf8");
  const lines = page.split("\n").map((text, index) => ({ number: index + 1, text }));
  const problems: string[] = [];
  const add: Add = (line, message) => problems.push(line ? `${name}:${line}: ${message}` : `${name}: ${message}`);

  const start = sectionStart(lines, target.section);
  if (!target.hostFormat && !lines.find((line) => line.text.trim())?.text.startsWith("# ")) add(1, "start with the alert title as a # heading");
  checkStamp(lines, today, add);
  checkStampBlock(stampBlock(lines), lines.slice(0, start ?? lines.length), target, add);
  const steps = start === undefined ? undefined : stepsOf(lines, start);
  checkSteps(steps, target.section, add);
  checkWording(target.hostFormat ? stampBlock(lines).concat(steps?.flatMap((step) => step.lines) ?? []) : nightLines(lines), add);
  checkScript(target.scriptPath, page, add);
  problems.push(...(target.hostFormat ? checkAgentSection(page, name) : checkAgentPage(target.pagePath)));
  return problems;
}

function checkStamp(lines: Line[], today: Date, add: Add): void {
  const untested = lines.find((line) => line.text.includes("UNTESTED"));
  if (untested) add(untested.number, "UNTESTED banner: record a run of every step it names, then remove it");
  const stamp = lines.find(isStamp);
  if (!stamp) return add(undefined, 'add the stamp "Tested <YYYY-MM-DD> on <environment> by <name>."');
  const partly = stamp.text.trim().startsWith("Partly");
  if (untested && !partly) add(stamp.number, 'write "Partly tested" while the UNTESTED banner stands');
  if (!untested && partly) add(stamp.number, 'write "Tested" once every step has a recorded run');
  const tested = new Date(/\d{4}-\d{2}-\d{2}/.exec(stamp.text)![0]);
  if ((today.getTime() - tested.getTime()) / 86_400_000 > stampDays) add(stamp.number, `stamp is older than ${stampDays} days: re-test the page`);
}

const isStamp = (line: Line) => /^(Partly tested|Tested) \d{4}-\d{2}-\d{2} on \S.* by \S.*\.$/.test(line.text.trim());

function stampBlock(lines: Line[]): Line[] {
  const stamp = lines.findIndex(isStamp);
  if (stamp < 0) return [];
  let first = stamp;
  let last = stamp;
  while (first > 0 && lines[first - 1]!.text.trim()) first--;
  while (last < lines.length - 1 && lines[last + 1]!.text.trim()) last++;
  return lines.slice(first, last + 1);
}

function checkStampBlock(block: Line[], header: Line[], target: Target, add: Add): void {
  if (!block.length) return;
  if (!block.some((line) => /\b(Page|Post in)\b/.test(line.text))) add(block[0]!.number, 'say who to page, or where to post, next to the stamp');
  if (!block.some((line) => line.text.includes("You are the person"))) add(block[0]!.number, 'add the role line next to the stamp: "You are the person: run every step yourself, `[human]` steps too."');
  if (!target.hostFormat && !header.some((line) => line.text.includes("[AGENT.md](AGENT.md)"))) add(undefined, "link [AGENT.md](AGENT.md) above the steps");
}

function sectionStart(lines: Line[], title: string): number | undefined {
  const index = lines.findIndex((line) => line.text.trim() === `## ${title}`);
  return index < 0 ? undefined : index;
}

function stepsOf(lines: Line[], start: number): Step[] {
  const steps: Step[] = [];
  for (const line of lines.slice(start + 1)) {
    if (line.text.startsWith("#")) break;
    const numbered = /^(\d+)\. /.exec(line.text);
    if (numbered) steps.push({ number: Number(numbered[1]), line: line.number, lines: [] });
    steps.at(-1)?.lines.push(line);
  }
  return steps;
}

function checkSteps(steps: Step[] | undefined, section: string, add: Add): void {
  if (!steps) return add(undefined, `add a "## ${section}" section`);
  if (steps.length === 0 || steps.length > maxSteps) add(undefined, `put 1 to ${maxSteps} steps first under "${section}", not ${steps.length}`);
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

function checkScript(scriptPath: string, page: string, add: Add): void {
  if (!existsSync(scriptPath)) return;
  const script = basename(scriptPath);
  if (spawnSync("bash", ["-n", scriptPath]).status !== 0) add(undefined, `${script}: bash -n fails`);
  const runLine = page.split("\n").find((line) => line.includes(script) && /\| bash\s*$/.test(line));
  if (!runLine) return add(undefined, `run ${script} with one line: curl -fsSL <raw URL at a commit SHA> | bash`);
  const sha = /\b[0-9a-f]{40}\b/.exec(runLine)?.[0];
  if (!sha) return add(undefined, `pin the ${script} line to a 40-character commit SHA, not a branch`);
  const pinned = scriptAt(scriptPath, sha);
  if (pinned === null) return;
  if (pinned === undefined) add(undefined, `commit ${sha.slice(0, 7)} has no ${script} here: commit the script and use that SHA`);
  else if (pinned !== readFileSync(scriptPath, "utf8")) add(undefined, `${script} differs from commit ${sha.slice(0, 7)}: commit it and put the new SHA in the page`);
}

function scriptAt(scriptPath: string, sha: string): string | undefined | null {
  const dir = join(scriptPath, "..");
  const top = spawnSync("git", ["-C", dir, "rev-parse", "--show-toplevel"], { encoding: "utf8" });
  if (top.status !== 0) return null;
  const path = relative(top.stdout.trim(), scriptPath);
  const show = spawnSync("git", ["-C", dir, "show", `${sha}:${path}`], { encoding: "utf8" });
  return show.status === 0 ? show.stdout : undefined;
}

function checkAgentPage(pagePath: string): string[] {
  const agentPath = join(pagePath, "..", "AGENT.md");
  if (!existsSync(agentPath)) return ["AGENT.md: missing"];
  const agent = readFileSync(agentPath, "utf8");
  const problems: string[] = [];
  if (!agent.includes("responding-to-alerts")) problems.push("AGENT.md: name the responding-to-alerts skill");
  if (!agent.includes("(README.md)")) problems.push("AGENT.md: link the steps in README.md");
  return problems;
}

function checkAgentSection(page: string, name: string): string[] {
  const heading = /^(#{2,4}) For agents$/m.exec(page);
  if (!heading) return [`${name}: add a "### For agents" section`];
  const rest = page.slice(heading.index + heading[0].length);
  const end = new RegExp(`^#{1,${heading[1]!.length}} `, "m").exec(rest)?.index ?? rest.length;
  const section = rest.slice(0, end);
  return section.includes("responding-to-alerts") ? [] : [`${name}: name the responding-to-alerts skill under "For agents"`];
}

if (import.meta.main) {
  const [path, flag, section] = process.argv.slice(2);
  if (!path || (flag !== undefined && (flag !== "--section" || !section))) {
    console.error("Usage: bun check-runbook.ts <runbook folder | runbook file> [--section <steps heading>]");
    process.exit(2);
  }
  const problems = checkRunbook(targetOf(path, section));
  if (problems.length) {
    console.error(problems.join("\n"));
    process.exit(1);
  }
  console.log("ok");
}
