import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { basename, extname, join, resolve } from 'node:path';
import { chromium, type Browser, type Page } from 'playwright-core';

const usage = 'usage: bun screenshot.ts <page.html | diagram.mmd> [out-prefix] [--width <css px, default 1100>] [--browser <executable>]';
const mermaidScript = 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js';
const cacheDirs = [join(homedir(), '.cache/ms-playwright'), join(homedir(), 'Library/Caches/ms-playwright')];
const executables = ['*/*/chrome-headless-shell', '*/*/chrome', '*/*/Chromium.app/Contents/MacOS/Chromium'];

function cachedBrowsers(): string[] {
  return cacheDirs
    .filter(existsSync)
    .flatMap((dir) => executables.flatMap((pattern) => [...new Bun.Glob(pattern).scanSync({ cwd: dir, absolute: true })]))
    .sort()
    .reverse();
}

async function launch(explicit?: string): Promise<Browser> {
  const candidates = [explicit, chromium.executablePath(), ...cachedBrowsers()].filter((path): path is string => !!path && existsSync(path));
  if (candidates[0]) return chromium.launch({ executablePath: candidates[0] });
  try {
    return await chromium.launch({ channel: 'chrome' });
  } catch {
    throw new Error('No Chromium found. Install one with `bunx playwright install chromium-headless-shell`, or pass --browser <executable>.');
  }
}

async function shootPanel(page: Page, path: string): Promise<void> {
  await page.locator('.panel').screenshot({ path });
  const collisions: string[] = JSON.parse((await page.locator('.panel').getAttribute('data-collisions')) ?? '[]');
  console.log(`Wrote ${path}${collisions.length ? `\n  labels collide: ${collisions.join('; ')}` : ''}`);
}

async function shootModulesPage(page: Page, input: string, prefix: string): Promise<void> {
  await page.goto(`file://${resolve(input)}`);
  const views = await page.locator('[data-view-to]').evaluateAll((buttons) => buttons.map((button) => (button as HTMLElement).dataset.viewTo!));
  if (!views.length) await shootPanel(page, `${prefix}.png`);
  for (const view of views) {
    await page.click(`[data-view-to="${view}"]`);
    await shootPanel(page, `${prefix}-${view}.png`);
  }
  if (await page.locator('[data-untouched-toggle]').count()) {
    if (views.includes('removed')) await page.click('[data-view-to="removed"]');
    await page.click('[data-untouched-toggle]');
    await shootPanel(page, `${prefix}-untouched.png`);
  }
}

async function shootMermaid(page: Page, input: string, prefix: string): Promise<void> {
  await page.setContent('<!doctype html><html><body style="margin:0;background:#fff"><div id="diagram" style="display:inline-block;padding:16px"></div></body></html>');
  await page.addScriptTag({ url: mermaidScript });
  const svg = await page.evaluate(async (source) => {
    const mermaid = (window as unknown as { mermaid: { initialize(config: object): void; render(id: string, text: string): Promise<{ svg: string }> } }).mermaid;
    mermaid.initialize({ startOnLoad: false, theme: 'neutral' });
    const { svg } = await mermaid.render('rendered', source);
    document.getElementById('diagram')!.innerHTML = svg;
    return svg;
  }, readFileSync(input, 'utf8'));
  writeFileSync(`${prefix}.svg`, svg);
  await page.locator('#diagram').screenshot({ path: `${prefix}.png` });
  console.log(`Wrote ${prefix}.svg and ${prefix}.png`);
}

if (import.meta.main) {
  const args = process.argv.slice(2);
  const option = (name: string) => {
    const at = args.indexOf(name);
    return at >= 0 ? args.splice(at, 2)[1] : undefined;
  };
  const browserPath = option('--browser');
  const width = Number(option('--width') ?? 1100);
  const [input, prefixArg] = args;
  if (!input) {
    console.error(usage);
    process.exit(2);
  }
  const prefix = prefixArg ?? join(resolve(input, '..'), basename(input, extname(input)));
  const browser = await launch(browserPath);
  try {
    const page = await browser.newPage({ deviceScaleFactor: 2, viewport: { width, height: 900 } });
    await (extname(input) === '.mmd' ? shootMermaid(page, input, prefix) : shootModulesPage(page, input, prefix));
  } finally {
    await browser.close();
  }
}
