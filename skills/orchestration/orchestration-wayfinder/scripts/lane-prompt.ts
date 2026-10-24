import { readFileSync } from "node:fs";
import { parseArgs } from "node:util";

const ticketLink = /(?:#|\b(?:issues|pull)\/|\bspec\/[\w.-]+-|\bmap-[\w.-]+-\d+-)(\d+)\b/g;
const ghTicketCommand = /\bgh[ \t]+(?:issue|pr)(?:[ \t]+(?:--?[\w-]+(?:[ \t=](?!-)[^\s"'`]+)?|[a-z-]+))+?[ \t]+["']?(\d+)\b/g;
const placeholder = /\{\{(\w+)\}\}/g;

type LaneArguments = { templateFile: string; values: Record<string, string>; allowed: number[] };

export function renderLanePrompt(template: string, values: Record<string, string>, allowed: number[]): string {
  const prompt = template.replace(placeholder, (_, name: string) => valueOf(values, name));
  const unfilled = placeholder.exec(prompt);
  placeholder.lastIndex = 0;
  if (unfilled) throw missingValue(unfilled[1]!);
  assertOnlyAllowedTickets(prompt, values.ticket!, allowed);
  return prompt;
}

function valueOf(values: Record<string, string>, name: string): string {
  if (!Object.hasOwn(values, name) || values[name] === "") throw missingValue(name);
  return values[name]!;
}

function missingValue(name: string): Error {
  return new Error(`The template has no value for {{${name}}}. Pass --set ${name}=<value>.`);
}

function assertOnlyAllowedTickets(prompt: string, ticket: string, allowed: number[]): void {
  const permitted = new Set([Number(ticket), ...allowed]);
  const named = [...prompt.matchAll(ticketLink), ...prompt.matchAll(ghTicketCommand)].map((match) => Number(match[1]));
  const strays = [...new Set(named)].filter((number) => !permitted.has(number)).sort((a, b) => a - b);
  if (strays.length) throw new Error(`The prompt names ${strays.map((number) => `#${number}`).join(", ")}, outside #${ticket} and the allow-list. Fix the template, or pass the numbers it names on purpose to --allow.`);
}

export function parseLaneArguments(argv: string[]): LaneArguments {
  const { values: options, positionals } = parseArgs({
    args: argv,
    allowPositionals: true,
    options: { allow: { type: "string", default: "" }, set: { type: "string", multiple: true, default: [] } },
  });
  const [templateFile, ticket] = positionals;
  if (!templateFile || !/^\d+$/.test(ticket ?? "")) throw new Error("Usage: lane-prompt.ts <template file> <ticket number> [--allow <n,n,...>] [--set <name>=<value>]...");
  const values: Record<string, string> = {};
  for (const pair of options.set) {
    const separator = pair.indexOf("=");
    if (separator < 1) throw new Error(`--set takes <name>=<value>, not "${pair}".`);
    values[pair.slice(0, separator)] = pair.slice(separator + 1);
  }
  if (Object.hasOwn(values, "ticket")) throw new Error("The ticket comes from the second argument; drop --set ticket=….");
  values.ticket = ticket!;
  return { templateFile, values, allowed: options.allow.split(",").filter(Boolean).map(Number) };
}

if (import.meta.main) {
  try {
    const { templateFile, values, allowed } = parseLaneArguments(process.argv.slice(2));
    process.stdout.write(renderLanePrompt(readFileSync(templateFile, "utf8"), values, allowed));
  } catch (error) {
    console.error((error as Error).message);
    process.exit(1);
  }
}
