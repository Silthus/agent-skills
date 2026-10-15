import { afterAll, beforeAll, describe, expect, test } from 'bun:test';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { PrFacts, RiskJudgement } from './types';

// The cache must go to a temporary folder, never the user's. The store reads the variable at import time.
const cacheDir = mkdtempSync(join(tmpdir(), 'audit-prs-test-'));
process.env.AUDIT_PRS_CACHE = cacheDir;
const { CACHE_DIR } = await import('./store');
const { DIFF_BUDGET, excerptDiff, parseJudgement, readPending, readScores, riskBrief, writePending } = await import('./risk');

beforeAll(() => expect(CACHE_DIR).toBe(cacheDir));
afterAll(() => rmSync(cacheDir, { recursive: true, force: true }));

function pr(overrides: Partial<PrFacts> = {}): PrFacts {
  return {
    id: 'o/r#1', repo: 'o/r', number: 1, title: 'Refund through the webhook', url: 'u', body: 'Handles refunds.', isDraft: false,
    baseRef: 'master', headRef: 'feat', headSha: 'abc', createdAt: '2026-09-01T00:00:00Z', updatedAt: '2026-09-22T00:00:00Z',
    lastPushAt: '2026-09-22T00:00:00Z', behindBy: 0,
    additions: 10, deletions: 2, changedFiles: 1, files: ['billing/webhook.ts'], labels: [],
    review: 'approved', approvers: [], changeRequesters: [], mergeable: 'MERGEABLE', mergeState: 'CLEAN',
    ci: { state: 'green', failing: [], cancelled: [], pending: [], awaitingAuthorization: 0, passed: 5 },
    trunk: { managed: false, failed: false, message: null },
    threads: [], humanComments: [], media: { images: 0, gifs: 0, videos: 0 }, testFiles: [], docsOnly: false,
    ...overrides,
  };
}

const judgement: RiskJudgement = {
  level: 'low', reason: 'touches the billing webhook, no test covers the refund path', areas: ['api', 'auth-billing'],
  userFacing: true, breakLikelihood: 'medium', breakSeverity: 'high', basis: 'full diff',
};

const section = (path: string, size: number) => `diff --git a/${path} b/${path}\n--- a/${path}\n+++ b/${path}\n${'+x\n'.repeat(size / 3)}`;

describe('excerptDiff', () => {
  test('keeps a diff under the budget whole', () => {
    const diff = section('src/a.ts', 300);
    expect(excerptDiff(diff, [])).toEqual({ text: diff, basis: 'full diff', omitted: [] });
  });

  test('puts source before tests, names lockfiles only, clips big files, and stays in the budget', () => {
    const diff = [section('src/a.test.ts', 3000), section('bun.lock', 30_000), section('src/huge.ts', 30_000), section('src/b.ts', 3000)]
      .concat(Array.from({ length: 10 }, (_, i) => section(`src/more${i}.ts`, 6000))).join('');
    const out = excerptDiff(diff, ['src/a.test.ts']);
    expect(out.basis).toBe('diff excerpt');
    expect(out.text.length).toBeLessThanOrEqual(DIFF_BUDGET);
    expect(out.text.startsWith('diff --git a/src/huge.ts')).toBe(true);
    expect(out.text).toContain('more lines of this file cut');
    expect(out.text).not.toContain('b/bun.lock');
    expect(out.omitted).toEqual(['src/more4.ts', 'src/more5.ts', 'src/more6.ts', 'src/more7.ts', 'src/more8.ts', 'src/more9.ts', 'bun.lock']);
    // A small test file still fills the space that the skipped source files leave, after all source.
    expect(out.text.indexOf('a/src/a.test.ts')).toBeGreaterThan(out.text.indexOf('a/src/more3.ts'));
  });
});

describe('riskBrief', () => {
  test('puts the change first and the weak signals in one line', () => {
    const { text: user, basis } = riskBrief(pr({ testFiles: [], media: { images: 2, gifs: 0, videos: 0 } }), section('billing/webhook.ts', 300));
    expect(basis).toBe('full diff');
    expect(user).toContain('Title: Refund through the webhook');
    expect(user).toContain('Signals: CI green; 0 test files changed; 2 screenshots or recordings in the description; 12 changed lines');
    expect(user).toContain('diff --git a/billing/webhook.ts');
  });

  test('without a diff, the agent judges from the file list', () => {
    const { text: user, basis } = riskBrief(pr(), null);
    expect(basis).toBe('file list');
    expect(user).toContain('Judge from the file list');
  });
});

describe('parseJudgement', () => {
  const { basis: _, ...answer } = judgement;

  test('reads a fenced JSON answer and drops unknown areas', () => {
    const content = '```json\n' + JSON.stringify({ ...answer, areas: ['api', 'auth-billing', 'kitchen'] }) + '\n```';
    expect(parseJudgement(content, 'full diff')).toEqual(judgement);
  });

  test('refuses an answer outside the schema', () => {
    expect(() => parseJudgement(JSON.stringify({ ...answer, level: 'certain' }), 'full diff')).toThrow(/outside the schema/);
    expect(() => parseJudgement('not json', 'full diff')).toThrow();
  });
});

describe('readScores', () => {
  test('lists the PRs without a judgement for their head, but not drafts', async () => {
    const run = await readScores([pr({ id: 'o/r#1' }), pr({ id: 'o/r#2', isDraft: true })]);
    expect(run).toMatchObject({ cached: 0, pending: 1 });
    expect(run.confidence.get('o/r#1')).toEqual({ level: 'unscored', reason: 'waits for your judgement: run score.ts' });
    expect(run.confidence.get('o/r#2')).toEqual({ level: 'unscored', reason: 'draft, judged when it is ready for review' });
    expect(Object.keys(await readPending())).toEqual(['o/r#1']);
  });
});

describe('score.ts', () => {
  const script = join(import.meta.dir, 'score.ts');
  const { basis: _, ...answer } = judgement;
  const record = (id: string, stdin: string) => {
    const out = Bun.spawnSync(['bun', script, '--record', id], { stdin: Buffer.from(stdin), env: { ...process.env, AUDIT_PRS_CACHE: cacheDir } });
    return { code: out.exitCode, text: out.stdout.toString() + out.stderr.toString() };
  };

  test('refuses a judgement before the brief was read', async () => {
    await readScores([pr({ id: 'o/r#3' })]);
    expect(record('o/r#3', JSON.stringify(answer))).toEqual({ code: 2, text: 'Read the brief first: bun score.ts o/r#3\n' });
  });

  test('stores a judgement for the head that the audit saw, until the next push', async () => {
    await readScores([pr({ id: 'o/r#4' })]);
    await writePending({ 'o/r#4': { facts: pr({ id: 'o/r#4' }), basis: 'diff excerpt' } });
    const baseline = { at: 'x', prs: { 'o/r#4': { headSha: 'abc', confidence: { level: 'unscored', reason: 'waits' } } } };
    writeFileSync(join(cacheDir, 'last.json'), JSON.stringify(baseline));

    const out = record('o/r#4', `\n${JSON.stringify(answer)}\n`);
    expect(out.code).toBe(0);
    expect(out.text).toContain('Recorded o/r#4: low: touches the billing webhook');
    expect(await readPending()).toEqual({});
    expect(JSON.parse(readFileSync(join(cacheDir, 'last.json'), 'utf8')).prs['o/r#4'].confidence).toEqual({ level: 'low', reason: judgement.reason });

    const same = await readScores([pr({ id: 'o/r#4' })]);
    expect(same.confidence.get('o/r#4')).toEqual({ ...judgement, basis: 'diff excerpt' });
    const pushed = await readScores([pr({ id: 'o/r#4', headSha: 'def' })]);
    expect(pushed.pending).toBe(1);
  });

  test('refuses an answer outside the schema and keeps the PR waiting', async () => {
    await writePending({ 'o/r#5': { facts: pr({ id: 'o/r#5' }), basis: 'full diff' } });
    const out = record('o/r#5', JSON.stringify({ ...answer, level: 'certain' }));
    expect(out.code).toBe(1);
    expect(out.text).toContain('outside the schema');
    expect(Object.keys(await readPending())).toEqual(['o/r#5']);
  });
});
