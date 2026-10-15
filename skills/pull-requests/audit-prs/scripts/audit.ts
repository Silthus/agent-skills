#!/usr/bin/env bun
// Audits the viewer's open PRs: fetch from GitHub, derive facts, ask Jev for
// hints, read the agent's cached merge confidence, classify, diff against the
// previous run, print for an agent. Jev is the only model call. The agent
// judges merge confidence itself with `score.ts`.
//
//   bun audit.ts              full report as Markdown
//   bun audit.ts --changes    only what changed since the previous run
//   bun audit.ts --json       everything as JSON
//   bun audit.ts --no-jev     skip Jev; the agent judges the open questions

import { fetchOpenPrs } from './github';
import { toFacts } from './facts';
import { triage } from './classify';
import { askJev, type JevRun } from './jev';
import { forgetKey, GatewayError, gatewayKey, KEY_TTL_HOURS, keyFilePath } from './key';
import { diff, renderMarkdown, snapshot, type Snapshot } from './report';
import { readScores } from './risk';
import { readJson, writeJson } from './store';
import { STATUSES } from './types';

const OPTIONS = ['--json', '--changes', '--no-jev'];
const args = new Set(process.argv.slice(2));
const unknown = [...args].filter((a) => !OPTIONS.includes(a));
if (unknown.length) {
  console.error(`Unknown option: ${unknown.join(' ')}. Use ${OPTIONS.join(', ')}.`);
  process.exit(2);
}

const started = performance.now();
const now = Date.now();
const at = new Date(now).toISOString();
const skipJev = args.has('--no-jev');

// The key lookup can wait for a 1Password approval, so it runs alongside the GitHub fetch.
const [github, key, previous] = await Promise.all([
  fetchOpenPrs(),
  skipJev ? Promise.resolve(null) : gatewayKey(),
  readJson<Snapshot | null>('last.json', null),
]);
const facts = github.prs.map((pr) => toFacts(pr, github.viewer));
const NO_KEY = `unavailable (no AI_GATEWAY_API_KEY, no key file at ${keyFilePath()}, no cached key, no AUDIT_PRS_OP_REF or 1Password not approved)`;

/** Runs Jev. Returns its answers, or null with the reason for the report header. */
async function runJev(): Promise<{ run: JevRun | null; note: string }> {
  if (skipJev) return { run: null, note: 'skipped by --no-jev' };
  if (!key) return { run: null, note: NO_KEY };
  try {
    return { run: await askJev(key.key, facts), note: '' };
  } catch (e) {
    if (e instanceof GatewayError && e.status === 401) await forgetKey();
    return { run: null, note: `failed: ${(e as Error).message}` };
  }
}

const keyNote = key ? `key from ${key.source} (cached ${KEY_TTL_HOURS} h)` : '';
const [jev, risk] = await Promise.all([runJev(), readScores(facts)]);
const jevNote = jev.run
  ? `${jev.run.fresh} fresh, ${jev.run.cached} cached, ${jev.run.deferred} deferred to the next run, ${jev.run.inputTokens} input tokens, ${keyNote}`
  : jev.note;
const riskNote = `${risk.cached} judged, ${risk.pending} wait for your judgement${risk.pending ? ' (run score.ts)' : ''}`;

const prs = facts
  .map((f) => triage(f, jev.run?.answers.get(f.id) ?? null, risk.confidence.get(f.id)!, now))
  .sort((a, b) => STATUSES.indexOf(a.status) - STATUSES.indexOf(b.status) || Date.parse(b.facts.updatedAt) - Date.parse(a.facts.updatedAt));

const current = snapshot(prs, at);
const changes = diff(previous, current);
await writeJson('last.json', current);

const meta = {
  at,
  seconds: (performance.now() - started) / 1000,
  forkPrs: github.forkPrs,
  jev: jevNote,
  confidence: riskNote,
  previousAt: previous?.at ?? null,
  errors: (jev.run?.errors ?? []).map((e) => `Jev ${e}`),
};

if (args.has('--json')) console.log(JSON.stringify({ ...meta, changes, prs }, null, 2));
else console.log(renderMarkdown(prs, changes, meta, args.has('--changes')));
