import { readFileSync } from "node:fs";
import { parseArgs } from "node:util";

const ticketReference = /(?:#|\b(?:issues|pull)\/|\b(?:issue|pr) [a-z-]+ )(\d+)\b/g;
const placeholder = /\{\{(\w+)\}\}/g;

export function renderLanePrompt(template: string, values: Record<string, string>, allowed: number[]): string {
  const prompt = template.replace(placeholder, (_, name: string) => {
    const value = values[name];
    if (value === undefined) throw new Error(`The template has no value for {{${name}}}. Pass --set ${name}=<value>.`);
    return value;
  });
  assertOnlyAllowedTickets(prompt, values.ticket!, allowed);
  return prompt;
}

function assertOnlyAllowedTickets(prompt: string, ticket: string, allowed: number[]): void {
  const permitted = new Set([Number(ticket), ...allowed]);
  const strays = [...new Set([...prompt.matchAll(ticketReference)].map((match) => Number(match[1])))].filter((number) => !permitted.has(number));
  if (strays.length) throw new Error(`The prompt names ${strays.map((number) => `#${number}`).join(", ")}, outside #${ticket} and the allow-list. Fix the template, or pass the numbers it names on purpose to --allow.`);
}

function parseCommandLine(): { template: string; values: Record<string, string>; allowed: number[] } {
  const { values: options, positionals } = parseArgs({
    allowPositionals: true,
    options: { allow: { type: "string", default: "" }, set: { type: "string", multiple: true, default: [] } },
  });
  const [templateFile, ticket] = positionals;
  if (!templateFile || !/^\d+$/.test(ticket ?? "")) throw new Error("Usage: lane-prompt.ts <template file> <ticket number> [--allow <n,n,...>] [--set <name>=<value>]...");
  const values: Record<string, string> = { ticket: ticket! };
  for (const pair of options.set) {
    const [name, ...value] = pair.split("=");
    values[name!] = value.join("=");
  }
  const allowed = options.allow.split(",").filter(Boolean).map(Number);
  return { template: readFileSync(templateFile, "utf8"), values, allowed };
}

if (import.meta.main) {
  try {
    const { template, values, allowed } = parseCommandLine();
    process.stdout.write(renderLanePrompt(template, values, allowed));
  } catch (error) {
    console.error((error as Error).message);
    process.exit(1);
  }
}
