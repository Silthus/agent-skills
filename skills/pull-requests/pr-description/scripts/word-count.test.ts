import { describe, expect, test } from "bun:test";
import { countWords, report } from "./word-count";

const receipt = [
  "<!-- hedge-proof-receipt head=abc hash=def -->",
  "| Proof | What ran | Result | Commit |",
  "| --- | --- | --- | --- |",
  "| live-run | one real send | delivered | `abc` |",
  "Full receipt: https://example.com/a/1",
  "<!-- /hedge-proof-receipt -->",
].join("\n");

describe("countWords", () => {
  test("counts prose, the callout, tables and collapsed blocks", () => {
    const body = [
      "## Problem",
      "",
      "- A customer cannot send.",
      "",
      "<!-- merge-risk -->",
      "> - **Tier:** non-critical",
      "<!-- /merge-risk -->",
      "",
      "<details><summary>Decisions</summary>",
      "",
      "| Question | Answer |",
      "| --- | --- |",
      "</details>",
    ].join("\n");
    const count = countWords(body);
    expect(count.counted).toBe(count.total - count.comments);
    expect(count.comments).toBe(6);
  });

  test("leaves out the receipt, fenced code, diagrams, template lines and comments", () => {
    const body = [
      "Two words.",
      receipt,
      "```mermaid",
      "flowchart LR",
      "    A[start] --> B[end]",
      "```",
      "~~~diff",
      "- old",
      "~~~",
      "- [x] I reviewed the submitted code.",
      "- No feature flag controls this change <!-- release-status: no-feature-flag -->",
      "<!-- Aim for 150 words. -->",
    ].join("\n");
    const count = countWords(body);
    expect(count.counted).toBe(2);
    expect(count.receipt).toBeGreaterThan(0);
    expect(count.code).toBe(11);
    expect(count.templateLines).toBe(18);
    expect(count.comments).toBe(6);
  });

  test("reads the older fleet receipt markers too", () => {
    expect(countWords(receipt.replaceAll("hedge-proof-receipt", "fleet-proof-receipt")).counted).toBe(0);
  });

  test("keeps counting after a fence that a longer fence closes", () => {
    expect(countWords("````markdown\n```\ninner\n```\n````\nafter").counted).toBe(1);
  });
});

describe("report", () => {
  test("names the verdict and what was left out", () => {
    const line = report({ counted: 801, total: 1000, receipt: 150, code: 40, comments: 4, templateLines: 5 });
    expect(line).toStartWith("801 words counted, over the 800-word cap.");
    expect(line).toContain("receipt 150");
  });
});
