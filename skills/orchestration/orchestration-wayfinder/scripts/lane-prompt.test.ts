import { expect, test } from "bun:test";
import { renderLanePrompt } from "./lane-prompt.ts";

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

test("accepts numbers on the allow-list", () => {
  expect(renderLanePrompt("Resolve #{{ticket}}; #140 is its sibling.", { ticket: "155" }, [140])).toBe("Resolve #155; #140 is its sibling.");
});

test("refuses a placeholder left without a value", () => {
  expect(() => renderLanePrompt(template, { ticket: "155" }, [95])).toThrow("no value for {{rules}}");
});
