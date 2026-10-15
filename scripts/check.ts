import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";

const root = resolve(import.meta.dir, "..");
const skillsRoot = join(root, "skills");
const problems: string[] = [];

type Skill = { theme: string; name: string; dir: string };

function directories(path: string): string[] {
  return readdirSync(path, { withFileTypes: true }).filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort();
}

function markdownFiles(path: string): string[] {
  return readdirSync(path, { withFileTypes: true, recursive: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
    .map((entry) => join(entry.parentPath, entry.name));
}

function frontmatterField(content: string, field: string): string | undefined {
  const frontmatter = /^---\n([\s\S]*?)\n---\n/.exec(content)?.[1];
  return frontmatter?.match(new RegExp(`^${field}:\\s*(.+)$`, "m"))?.[1]?.trim();
}

function checkSkill(skill: Skill): void {
  const skillFile = join(skill.dir, "SKILL.md");
  if (!existsSync(skillFile)) return void problems.push(`${skill.theme}/${skill.name}: missing SKILL.md`);
  const content = readFileSync(skillFile, "utf8");
  if (frontmatterField(content, "name") !== skill.name) problems.push(`${skill.theme}/${skill.name}: frontmatter name must be ${skill.name}`);
  if (!frontmatterField(content, "description")) problems.push(`${skill.theme}/${skill.name}: frontmatter needs a description`);
}

// A skill link that leaves its theme breaks for plugin installs, which copy one theme at a time.
// The theme README is repository documentation, so it may link to other themes.
function checkLinks(file: string, theme: string): void {
  const content = readFileSync(file, "utf8").replace(/```[\s\S]*?```/g, "").replace(/`[^`\n]*`/g, "");
  const mayLeaveTheme = file === join(skillsRoot, theme, "README.md");
  for (const match of content.matchAll(/\]\(([^)\s]+)\)/g)) {
    const target = match[1]!.split("#")[0]!;
    if (!target || /^[a-z]+:/.test(target) || target.startsWith("<")) continue;
    const resolved = resolve(dirname(file), target);
    const where = relative(root, file);
    if (!existsSync(resolved)) problems.push(`${where}: broken link ${match[1]}`);
    else if (!mayLeaveTheme && relative(join(skillsRoot, theme), resolved).startsWith("..")) problems.push(`${where}: link ${match[1]} leaves the ${theme} theme; name the skill instead`);
  }
}

function checkMarketplace(themes: string[]): void {
  const marketplace = JSON.parse(readFileSync(join(root, ".claude-plugin/marketplace.json"), "utf8"));
  const sources = marketplace.plugins.map((plugin: { source: string }) => plugin.source).sort();
  const expected = themes.map((theme) => `./skills/${theme}`);
  if (JSON.stringify(sources) !== JSON.stringify(expected)) problems.push(`marketplace.json plugins ${sources.join(", ")} must match themes ${expected.join(", ")}`);
}

function checkThemeReadme(theme: string, skills: Skill[]): void {
  const readme = join(skillsRoot, theme, "README.md");
  if (!existsSync(readme)) return void problems.push(`${theme}: missing README.md`);
  const content = readFileSync(readme, "utf8");
  for (const skill of skills) if (!content.includes(`./${skill.name}/SKILL.md`)) problems.push(`${theme}/README.md: does not list ${skill.name}`);
}

const themes = directories(skillsRoot);
const seen = new Map<string, string>();
for (const theme of themes) {
  const skills = directories(join(skillsRoot, theme)).map((name) => ({ theme, name, dir: join(skillsRoot, theme, name) }));
  for (const skill of skills) {
    if (seen.has(skill.name)) problems.push(`${skill.name}: in both ${seen.get(skill.name)} and ${theme}`);
    seen.set(skill.name, theme);
    checkSkill(skill);
  }
  for (const file of markdownFiles(join(skillsRoot, theme))) checkLinks(file, theme);
  checkThemeReadme(theme, skills);
}
checkMarketplace(themes);

if (problems.length) {
  console.error(problems.join("\n"));
  process.exit(1);
}
console.log(`Checked ${seen.size} skills in ${themes.length} themes.`);
