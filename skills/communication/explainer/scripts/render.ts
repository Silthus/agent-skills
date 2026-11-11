// Renders an explainer canvas (.html, its .card element) or a Mermaid diagram (.mmd) to a 2x PNG beside the file.
import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join, resolve } from "node:path";
import { chromium, type Browser } from "playwright-core";

const usage = "usage: bun render.ts <canvas.html | diagram.mmd> [--browser <executable>]";
const mermaidScript = "https://cdn.jsdelivr.net/npm/mermaid@11.4.1/dist/mermaid.min.js";
const cacheDirs = [join(homedir(), ".cache/ms-playwright"), join(homedir(), "Library/Caches/ms-playwright")];
const patterns = ["*/*/chrome-headless-shell", "*/*/headless_shell", "*/*/chrome", "*/*/Chromium.app/Contents/MacOS/Chromium"];

const cachedBrowsers = () =>
  cacheDirs.filter(existsSync).flatMap((cwd) => patterns.flatMap((pattern) => [...new Bun.Glob(pattern).scanSync({ cwd, absolute: true })]));

async function launch(explicit?: string): Promise<Browser> {
  for (const executablePath of explicit ? [explicit] : [undefined, ...cachedBrowsers()]) {
    const browser = await chromium.launch({ executablePath }).catch(() => undefined);
    if (browser) return browser;
  }
  throw new Error("No Chromium found. Install one with `bunx playwright install chromium-headless-shell`, or pass --browser <executable>.");
}

const args = process.argv.slice(2);
const at = args.indexOf("--browser");
const browserPath = at >= 0 ? args.splice(at, 2)[1] : undefined;
const input = args[0];
if (!input) {
  console.error(usage);
  process.exit(2);
}
const output = resolve(input).replace(/\.(html|mmd)$/, "") + ".png";
const browser = await launch(browserPath);
try {
  const page = await browser.newPage({ deviceScaleFactor: 2, viewport: { width: 800, height: 600 }, colorScheme: "light" });
  if (input.endsWith(".mmd")) {
    await page.setContent('<!doctype html><style>.card > svg > text{font-size:16px !important;font-weight:600}</style><body style="margin:0;background:#fff"><div class="card" style="display:inline-block;padding:16px"></div></body>');
    await page.addScriptTag({ url: mermaidScript });
    await page.evaluate(async (source) => {
      const mermaid = (window as unknown as { mermaid: { initialize(c: object): void; render(id: string, text: string): Promise<{ svg: string }> } }).mermaid;
      mermaid.initialize({
        startOnLoad: false,
        theme: "base",
        themeVariables: {
          fontFamily: '-apple-system, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif',
          fontSize: "13px",
          primaryColor: "#f6f8fa",
          primaryBorderColor: "#d1d9e0",
          primaryTextColor: "#1f2328",
          lineColor: "#59636e",
          actorBkg: "#f6f8fa",
          actorBorder: "#d1d9e0",
          actorLineColor: "#d1d9e0",
          signalColor: "#59636e",
          signalTextColor: "#1f2328",
          noteBkgColor: "#fff8c5",
          noteBorderColor: "#d4a72c",
          noteTextColor: "#1f2328",
          labelBoxBkgColor: "#f6f8fa",
          labelBoxBorderColor: "#d1d9e0",
          loopTextColor: "#59636e",
          edgeLabelBackground: "#ffffff",
        },
        flowchart: { useMaxWidth: false, wrappingWidth: 220, curve: "basis" },
        sequence: { useMaxWidth: false, mirrorActors: false, wrap: true, width: 170, actorMargin: 90, noteMargin: 8, messageMargin: 28 },
        state: { useMaxWidth: false },
      });
      document.querySelector(".card")!.innerHTML = (await mermaid.render("diagram", source)).svg;
    }, readFileSync(input, "utf8"));
  } else {
    await page.goto(`file://${resolve(input)}`);
  }
  await page.locator(".card").first().screenshot({ path: output });
  console.log(`Wrote ${output}`);
  const overflows = await page.locator(".card").first().evaluate((card) => {
    const label = (element: Element) => (element.textContent ?? "").trim().replace(/\s+/g, " ").slice(0, 60);
    const outside = (inner: DOMRect, outer: DOMRect) =>
      inner.left < outer.left - 1 || inner.right > outer.right + 1 || inner.top < outer.top - 1 || inner.bottom > outer.bottom + 1;
    const cardBox = card.getBoundingClientRect();
    // SVG text has no scroll size, so compare its box with the svg that clips it and with the card.
    const clippedSvgText = [...card.querySelectorAll("svg text")].filter((text) => {
      const box = text.getBoundingClientRect();
      const svg = text.closest("svg");
      return box.width > 0 && ((svg && outside(box, svg.getBoundingClientRect())) || outside(box, cardBox));
    });
    const overflowingBoxes = [card, ...card.querySelectorAll("*")].filter(
      (element) => element.clientWidth > 0 && element.scrollWidth > element.clientWidth + 1,
    );
    return [...clippedSvgText, ...overflowingBoxes].map(label);
  });
  if (overflows.length) {
    console.error(`Text overflows its box in:\n${[...new Set(overflows)].map((text) => `  "${text}"`).join("\n")}`);
    process.exitCode = 1;
  }
} finally {
  await browser.close();
}
