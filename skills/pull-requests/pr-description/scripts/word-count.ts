import { readFileSync } from "node:fs";

export const wordCap = 800;

export type WordCount = {
  counted: number;
  total: number;
  receipt: number;
  code: number;
  comments: number;
  templateLines: number;
};

const words = (text: string) => text.split(/\s+/).filter(Boolean).length;

function take(text: string, pattern: RegExp): [string, number] {
  let removed = 0;
  const rest = text.replace(pattern, (match) => {
    removed += words(match);
    return "\n";
  });
  return [rest, removed];
}

export function countWords(body: string): WordCount {
  const total = words(body);
  const [withoutReceipt, receipt] = take(body, /<!-- (fleet|hedge)-proof-receipt\b[\s\S]*?<!-- \/(fleet|hedge)-proof-receipt -->/g);
  const [withoutCode, code] = take(withoutReceipt, /^ {0,3}(`{3,}|~{3,})[^\n]*\n[\s\S]*?^ {0,3}\1[ \t]*$/gm);
  const [withoutTemplateLines, templateLines] = take(withoutCode, /^[ \t]*[-*] (\[[ xX]\] .*|.*<!-- release-status:.*)$/gm);
  const [prose, comments] = take(withoutTemplateLines, /<!--[\s\S]*?-->/g);
  return { counted: words(prose), total, receipt, code, comments, templateLines };
}

export function report(count: WordCount): string {
  const verdict = count.counted > wordCap ? `over the ${wordCap}-word cap` : `within the ${wordCap}-word cap`;
  return `${count.counted} words counted, ${verdict}. Not counted: receipt ${count.receipt}, code and diagrams ${count.code}, template lines ${count.templateLines}, comments ${count.comments} (${count.total} in the file).`;
}

if (import.meta.main) {
  const path = process.argv[2];
  if (!path) {
    console.error("Usage: bun scripts/word-count.ts <body.md>");
    process.exit(2);
  }
  const count = countWords(readFileSync(path, "utf8"));
  console.log(report(count));
  process.exit(count.counted > wordCap ? 1 : 0);
}
