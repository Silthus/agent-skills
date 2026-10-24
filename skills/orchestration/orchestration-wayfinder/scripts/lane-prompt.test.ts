import { expect, test } from "bun:test";
import { parseLaneArguments, renderLanePrompt } from "./lane-prompt.ts";

const template = "Resolve #{{ticket}} on map #95: `gh issue view {{ticket}} -R acme/maps`. Add rules {{rules}}.";

test("fills the ticket and every other value into the template", () => {
  expect(renderLanePrompt(template, { ticket: "155", rules: "LP98-LP102" }, [95])).toBe(
    "Resolve #155 on map #95: `gh issue view 155 -R acme/maps`. Add rules LP98-LP102.",
  );
});

test("refuses a prompt that names a ticket outside its own and the allow-list", () => {
  const copied = "Resolve #155. Read https://github.com/acme/maps/issues/145, then `gh issue edit 145` and `gh pr view 146`, and see pull/147.";
  expect(() => renderLanePrompt(copied, { ticket: "155" }, [])).toThrow("names #145, #146, #147, outside #155 and the allow-list");
});

test("finds a ticket in a gh command with quotes, flags before it, or tabs", () => {
  for (const command of ['gh issue view "145" -R acme/maps', "gh issue view --repo acme/maps 145", 'gh issue view --repo "acme/maps" 145', 'gh issue view --repo="acme/maps" 145', "gh issue -R acme/maps view 145", "gh issue\tedit\t145", "gh pr view --comments 145"]) {
    expect(() => renderLanePrompt(`Resolve #155: ${command}`, { ticket: "155" }, [])).toThrow("names #145");
  }
});

test("reads numbers in gh prose and option values as no ticket", () => {
  const prose = "Resolve #155. Use gh issue commands and stop after 30 minutes. Run `gh issue list --limit 20` and `gh pr checks --watch --interval 20`.";
  expect(renderLanePrompt(prose, { ticket: "155" }, [])).toBe(prose);
});

test("checks a long run of flags without backtracking for seconds", () => {
  const started = performance.now();
  const flags = `Resolve #155: gh issue view ${"--flag ".repeat(40)}no-ticket`;
  expect(renderLanePrompt(flags, { ticket: "155" }, [])).toBe(flags);
  expect(performance.now() - started).toBeLessThan(100);
});

test("finds a ticket in a strand branch and a lease name", () => {
  expect(() => renderLanePrompt("Resolve #155 on spec/export-145.", { ticket: "155" }, [])).toThrow("names #145");
  expect(() => renderLanePrompt("Resolve #155. Run `fleet lease map-personal-95-145`.", { ticket: "155" }, [95])).toThrow("names #145");
  expect(renderLanePrompt("Resolve #{{ticket}} on spec/export-{{ticket}} with lease map-personal-95-{{ticket}}.", { ticket: "155" }, [95])).toBe(
    "Resolve #155 on spec/export-155 with lease map-personal-95-155.",
  );
});

test("accepts numbers on the allow-list", () => {
  expect(renderLanePrompt("Resolve #{{ticket}}; #140 is its sibling.", { ticket: "155" }, [140])).toBe("Resolve #155; #140 is its sibling.");
});

test("refuses a placeholder left without a value", () => {
  expect(() => renderLanePrompt(template, { ticket: "155" }, [95])).toThrow("no value for {{rules}}");
  expect(() => renderLanePrompt("Resolve #{{ticket}}. {{toString}}", { ticket: "155" }, [])).toThrow("no value for {{toString}}");
  expect(() => renderLanePrompt(template, { ticket: "155", rules: "" }, [95])).toThrow("no value for {{rules}}");
});

test("refuses a value that brings in a placeholder of its own", () => {
  expect(() => renderLanePrompt("Resolve #{{ticket}}. {{context}}", { ticket: "155", context: "Read {{missing}}" }, [])).toThrow("no value for {{missing}}");
});

test("reads the ticket, the allow-list, and named values from the command line", () => {
  expect(parseLaneArguments(["t.md", "155", "--allow", "95,140", "--set", "rules=LP98=LP102"])).toEqual({
    templateFile: "t.md",
    values: { ticket: "155", rules: "LP98=LP102" },
    allowed: [95, 140],
  });
});

test("refuses a --set that overrides the ticket or carries no value", () => {
  expect(() => parseLaneArguments(["t.md", "155", "--set", "ticket=145"])).toThrow("The ticket comes from the second argument");
  expect(() => parseLaneArguments(["t.md", "155", "--set", "rules"])).toThrow("--set takes <name>=<value>");
});
