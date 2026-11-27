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

const pictureMark = "\u0001";
const codeOpen = "\u0002";
const codeClose = "\u0003";
const rawOpen = "\u0004";
const rawClose = "\u0005";
const rawChunk = new RegExp(`${rawOpen}([^${rawClose}]*)${rawClose}`, "g");
const templateLine = /^[ \t]*[-*] (\[[ xX]\] .*|.*<!-- release-status:.*)$/gm;
const receiptMarker = /^<!-- \/?(fleet|hedge)-proof-receipt\b/;
const media = /<(img|video)\b/i;
const markers = /[\u0001-\u0005]/g;

function rawBlock(raw: string) {
  const shown = raw.split(/<!--[\s\S]*?-->/).join(" ");
  const text = shown.split(/<\/?(?:a|b|code|del|em|i|s|span|strong|sub|sup)\b[^>]*>/).join("").split(/<[^>]*>/).join(" ");
  return `${media.test(shown) ? pictureMark : ""} ${text}\n\n`;
}

type Shape = { text: string; visible: string; topLevelItems: number };

function shapeOf(markdown: string): Shape {
  let inReceipt = false;
  let closingsAhead = markdown.match(/<!-- \/(fleet|hedge)-proof-receipt -->/g)?.length ?? 0;
  let afterRollout = false;
  let topLevelItems = 0;
  const kept = (text: string) => inReceipt ? "" : text;
  const block = (children: string) => kept(`${children}\n\n`);
  const rendered = Bun.markdown.render(markdown, {
    text: (written: string) => /^<[\s\S]*>$/.test(written) ? `${rawOpen}${written.replace(markers, "")}${rawClose}` : kept(written.replace(markers, "")),
    html: (children: string) => {
      const raw = children.replace(rawChunk, "$1").trim();
      if (receiptMarker.test(raw)) {
        const closing = raw.startsWith("<!-- /");
        if (closing) closingsAhead -= 1;
        inReceipt = !closing && closingsAhead > 0;
        return "\n\n";
      }
      return kept(rawBlock(raw));
    },
    codespan: (children: string) => kept(`${codeOpen}${children.replace(rawChunk, "$1")}${codeClose}`),
    code: (_children: string, meta?: { language?: string }) => kept(/^mermaid\b/.test(meta?.language ?? "") ? `${pictureMark}\n\n` : "\n\n"),
    image: () => kept(pictureMark),
    heading: (children: string) => {
      if (!inReceipt && /^Rollout\b/i.test(children.trim())) afterRollout = true;
      return block(children);
    },
    listItem: (children: string, meta?: { depth?: number }) => {
      if (!inReceipt && !afterRollout && meta?.depth === 0) topLevelItems += 1;
      return kept(`${children}\n`);
    },
    paragraph: block,
    th: (children: string) => kept(` ${children} `),
    td: (children: string) => kept(` ${children} `),
    tr: (children: string) => kept(`${children}\n`),
    hr: () => "\n\n",
  });
  const text = rendered.replace(rawChunk, (_chunk, raw: string) => /^<(img|video)\b/i.test(raw) ? pictureMark : " ");
  const visible = text.replace(new RegExp(`${codeOpen}[^${codeClose}]*${codeClose}`, "g"), " ");
  return { text: text.replaceAll(codeOpen, "").replaceAll(codeClose, "").replaceAll(pictureMark, " "), visible, topLevelItems };
}

const writtenWords = (text: string) => text.split(/\s+/).filter((word) => /[\p{L}\p{N}]/u.test(word)).length;

const receiptBlock = /<!-- (fleet|hedge)-proof-receipt\b[\s\S]*?<!-- \/(fleet|hedge)-proof-receipt -->/g;
const preformatted = /^ {0,3}(`{3,}|~{3,})[^\n]*\n[\s\S]*?^ {0,3}\1[ \t]*$/gm;
const comment = /<!--[\s\S]*?-->/g;
const matched = (text: string, pattern: RegExp) => [...text.matchAll(pattern)].reduce((sum, [match]) => sum + words(match), 0);

export function countWords(body: string): WordCount {
  const withoutReceipt = body.replace(receiptBlock, "\n");
  const withoutCode = withoutReceipt.replace(preformatted, "\n");
  return {
    counted: writtenWords(shapeOf(body.replace(templateLine, "\n")).text),
    total: words(body),
    receipt: matched(body, receiptBlock),
    code: matched(withoutReceipt, preformatted),
    templateLines: matched(withoutCode, templateLine),
    comments: matched(withoutCode.replace(templateLine, "\n"), comment),
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
