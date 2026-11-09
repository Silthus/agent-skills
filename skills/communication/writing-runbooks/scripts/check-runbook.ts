import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, statSync } from "node:fs";
import { basename, join, relative } from "node:path";

const maxLines = 100;
const maxItems = 6;
const maxWords = 25;
const folderSections = ["Symptoms", "Investigation", "Mitigation", "Escalation"];
const vague = ["if needed", "as needed", "if necessary", "should", "probably", "maybe", "etc", "appropriate", "as usual", "a few", "several", "some", "quickly", "soon", "just"];

// Lines that belong in the PR description or an agent's notes, never on the reader's page.
const offPage: [RegExp, string][] = [
  [/\bUNTESTED\b/, "test status goes in the PR description, not on the page"],
  [/^\s*(Partly )?[Tt]ested \d{4}-\d{2}-\d{2}\b/, "test status goes in the PR description, not on the page"],
  [/\bYou are the person\b/, "drop the role line: the page has one reader"],
  [/^\s*Agents:/, "drop the agents line: responding-to-alerts reads the page as is"],
  [/^#{2,4} For agents\s*$/, "drop the agent section: one line beside a check, or nothing"],
];

// Lines that turn Mitigation into a flowchart instead of conditional bullets.
const flowchart: [RegExp, string][] = [
  [/\bGo to step \d+/i, 'write "If <condition>, <action>." bullets, not a jump to another step'],
  [/^\s*You see:/, "say what to look for in the check itself, not on a You see: line"],
  [/\[(safe|human)\]/, 'drop the step tag: a production change names its "Costs:" and "Undo:"'],
];

type Line = { number: number; text: string };
type Add = (line: number | undefined, message: string) => void;
export type Report = { problems: string[]; warnings: string[] };

type Target = {
  pagePath: string;
  scriptPath: string;
  section: string;
  hostFormat: boolean;
};

export function targetOf(path: string, section?: string): Target {
  if (statSync(path, { throwIfNoEntry: false })?.isDirectory()) {
    return { pagePath: join(path, "README.md"), scriptPath: join(path, "mitigate.sh"), section: section ?? "Mitigation", hostFormat: false };
  }
  return { pagePath: path, scriptPath: path.replace(/\.md$/, ".sh"), section: section ?? "Mitigation", hostFormat: true };
}

export function checkRunbook(target: Target): Report {
  const name = basename(target.pagePath);
  if (!existsSync(target.pagePath)) return { problems: [`${name}: missing`], warnings: [] };
  const page = readFileSync(target.pagePath, "utf8");
  const lines = page.replace(/\n+$/, "").split("\n").map((text, index) => ({ number: index + 1, text }));
  const report: Report = { problems: [], warnings: [] };
  const at = (list: string[]): Add => (line, message) => list.push(line ? `${name}:${line}: ${message}` : `${name}: ${message}`);
  const add = at(report.problems);
  const warn = at(report.warnings);

  if (!target.hostFormat) {
    if (!lines.find((line) => line.text.trim())?.text.startsWith("# ")) add(1, "start with the alert title as a # heading");
    for (const section of folderSections) if (!sectionOf(lines, section)) add(undefined, `add a "## ${section}" section`);
  }
  if (lines.length > maxLines) warn(undefined, `${lines.length} lines: proven runbooks run 40 to ${maxLines}; cut background to a link`);
  checkLines(lines, offPage, add);

  const fix = sectionOf(lines, target.section);
  if (!fix) {
    if (target.hostFormat) add(undefined, `add a "## ${target.section}" section`);
  } else {
    checkLines(fix, flowchart, add);
    const items = fix.filter((line) => /^(-|\d+\.) /.test(line.text)).length;
    if (items === 0) add(undefined, `write the mitigations as bullets under "${target.section}"`);
    if (items > maxItems) warn(undefined, `${items} items under "${target.section}": keep 3 to 5 mitigations, least destructive first`);
    checkWording(fix, add, warn);
  }
  checkPlaceholders(lines, add);
  checkScript(target.scriptPath, page, add);
  if (!target.hostFormat) report.problems.push(...checkAgentPage(target.pagePath));
  return report;
}

function sectionOf(lines: Line[], title: string): Line[] | undefined {
  const start = lines.findIndex((line) => line.text.trim() === `## ${title}`);
  if (start < 0) return undefined;
  const end = lines.findIndex((line, index) => index > start && /^#{1,2} /.test(line.text));
  return lines.slice(start + 1, end < 0 ? lines.length : end);
}

function checkLines(lines: Line[], rules: [RegExp, string][], add: Add): void {
  for (const line of lines) {
    const rule = rules.find(([shape]) => shape.test(line.text));
    if (rule) add(line.number, rule[1]);
  }
}

function checkPlaceholders(lines: Line[], add: Add): void {
  for (const line of lines) {
    const placeholder = /<[^>\n]+>|\b(TODO|TBD|XXX)\b/.exec(line.text)?.[0];
    if (placeholder) add(line.number, `fill in ${placeholder}`);
  }
}

function checkWording(lines: Line[], add: Add, warn: Add): void {
  let inCode = false;
  for (const line of lines) {
    if (line.text.trim().startsWith("```")) { inCode = !inCode; continue; }
    if (inCode || line.text.startsWith("#")) continue;
    const prose = proseOf(line.text);
    const word = vague.find((phrase) => new RegExp(`\\b${phrase}\\b`, "i").test(prose));
    if (word) add(line.number, `"${word}" is vague: write the exact value or action`);
    for (const sentence of prose.split(/(?<=[.?!])\s+/)) {
      const words = sentence.split(/\s+/).filter(Boolean).length;
      if (words > maxWords) warn(line.number, `${words} words: split "${sentence.slice(0, 40)}..."`);
    }
  }
}

function proseOf(text: string): string {
  return text
    .replace(/`[^`]*`/g, "code")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/https?:\/\/\S+/g, "link")
    .replace(/^\s*(\d+\.|-|>)\s*/, "")
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

// AGENT.md is optional; when it exists it must lean on the shared skill and the page.
function checkAgentPage(pagePath: string): string[] {
  const agentPath = join(pagePath, "..", "AGENT.md");
  if (!existsSync(agentPath)) return [];
  const agent = readFileSync(agentPath, "utf8");
  const problems: string[] = [];
  if (!agent.includes("responding-to-alerts")) problems.push("AGENT.md: name the responding-to-alerts skill");
  if (!agent.includes("(README.md)")) problems.push("AGENT.md: link the checks in README.md");
  return problems;
}

if (import.meta.main) {
  const [path, flag, section] = process.argv.slice(2);
  if (!path || (flag !== undefined && (flag !== "--section" || !section))) {
    console.error("Usage: bun check-runbook.ts <runbook folder | runbook file> [--section <mitigation heading>]");
    process.exit(2);
  }
  const { problems, warnings } = checkRunbook(targetOf(path, section));
  if (warnings.length) console.error(warnings.map((warning) => `warning: ${warning}`).join("\n"));
  if (problems.length) {
    console.error(problems.join("\n"));
    process.exit(1);
  }
  console.log("ok");
}
