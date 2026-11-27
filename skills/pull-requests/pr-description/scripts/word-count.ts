import { readFileSync } from "node:fs";

export const wordCap = 800;
export const smallChangeCap = 350;

export type WordCount = {
  counted: number;
  total: number;
  receipt: number;
  code: number;
  comments: number;
  templateLines: number;
};

const words = (text: string) => text.split(/\s+/).filter(Boolean).length;

const receiptBlock = /<!-- (fleet|hedge)-proof-receipt\b[\s\S]*?<!-- \/(fleet|hedge)-proof-receipt -->/g;
const templateLine = /^[ \t]*[-*] (\[[ xX]\] .*|.*<!-- release-status:.*)$/gm;
const preformatted = /<pre\b[\s\S]*?<\/pre>/g;
const comment = /<!--[\s\S]*?-->/g;

const inline = /<\/?(a|b|code|del|em|i|s|span|strong|sub|sup)\b[^>]*>/g;
const written = (html: string) => html.replace(inline, "").replace(/<[^>]*>/g, " ").replace(/&[#\w]+;/g, "&").split(/\s+/).filter((word) => /[\p{L}\p{N}]/u.test(word)).length;
const matched = (text: string, pattern: RegExp) => [...text.matchAll(pattern)].reduce((sum, [match]) => sum + words(match), 0);

export function countWords(body: string): WordCount {
  const total = words(body);
  const withoutReceipt = body.replace(receiptBlock, "\n");
  const html = Bun.markdown.html(withoutReceipt.replace(templateLine, "\n"));
  return {
    counted: written(html.replace(comment, "\n").replace(preformatted, "\n")),
    total,
    receipt: matched(body, receiptBlock),
    code: matched(html.replace(comment, "\n"), preformatted),
    comments: matched(html, comment),
    templateLines: matched(withoutReceipt, templateLine),
  };
}

export function capFor(args: string[]): number {
  return args.includes("--small") ? smallChangeCap : wordCap;
}

export function report(count: WordCount, cap = wordCap): string {
  const capName = cap === smallChangeCap ? `${cap}-word cap for a small change` : `${cap}-word cap`;
  const verdict = `${count.counted > cap ? "over" : "within"} the ${capName}`;
  return `${count.counted} words counted, ${verdict}. Not counted: receipt ${count.receipt}, code and diagrams ${count.code}, template lines ${count.templateLines}, comments ${count.comments} (${count.total} in the file).`;
}

if (import.meta.main) {
  const args = process.argv.slice(2);
  const path = args.find((arg) => arg !== "--small");
  if (!path) {
    console.error("Usage: bun scripts/word-count.ts [--small] <body.md>");
    process.exit(2);
  }
  const cap = capFor(args);
  const count = countWords(readFileSync(path, "utf8"));
  console.log(report(count, cap));
  process.exit(count.counted > cap ? 1 : 0);
}
