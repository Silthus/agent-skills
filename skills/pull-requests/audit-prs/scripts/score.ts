#!/usr/bin/env bun
// Merge confidence from the agent that runs the audit. The audit lists the PRs
// whose current head has no judgement. This script prints the rubric and a
// brief for each of them, and stores the agent's answers, so that the next
// audit reads them from the cache. A brief holds up to 40k characters of diff,
// so the agent asks for a few at a time.
//
//   bun score.ts                  the PRs that wait for a judgement, one per line
//   bun score.ts <id>...          the rubric and the briefs for these PRs
//   bun score.ts --record <id>    store the JSON judgement from stdin

import { fetchDiff } from './github';
import { confidenceText, type Snapshot } from './report';
import { parseJudgement, readPending, riskBrief, RUBRIC, saveJudgement, writePending, type Pending } from './risk';
import { readJson, writeJson } from './store';

const USAGE = 'Use: bun score.ts [<id>...] | bun score.ts --record <id> with the JSON judgement on stdin.';

class UsageError extends Error {}

function list(pending: Pending) {
  const entries = Object.entries(pending);
  if (!entries.length) return 'No PR waits for a judgement.';
  return entries.map(([id, { facts }]) => `${id} ${facts.title} (+${facts.additions} -${facts.deletions})`).join('\n');
}

async function brief(pending: Pending, ids: string[]) {
  const unknown = ids.filter((id) => !pending[id]);
  if (unknown.length) throw new UsageError(`Not waiting for a judgement: ${unknown.join(', ')}. Run audit.ts first.`);
  const diffs = await Promise.all(ids.map((id) => fetchDiff(pending[id]!.facts.repo, pending[id]!.facts.number)));
  const briefs = ids.map((id, i) => {
    const entry = pending[id]!;
    const { text, basis } = riskBrief(entry.facts, diffs[i] ?? null);
    entry.basis = basis;
    return `## ${id}\nURL: ${entry.facts.url}\n\n${text}`;
  });
  // `--record` takes the basis from here, so a judgement is only stored after its brief was read.
  await writePending(pending);
  return [RUBRIC, ...briefs].join('\n\n---\n\n');
}

async function record(pending: Pending, id: string) {
  const entry = pending[id];
  if (!entry) throw new UsageError(`${id} does not wait for a judgement. Run audit.ts first.`);
  if (!entry.basis) throw new UsageError(`Read the brief first: bun score.ts ${id}`);
  const judgement = parseJudgement(await Bun.stdin.text(), entry.basis);
  await saveJudgement(entry.facts.headSha, id, judgement);
  delete pending[id];
  await writePending(pending);
  // The change baseline gets the judgement too, so the next `--changes` run does not report it again.
  const last = await readJson<Snapshot | null>('last.json', null);
  const seen = last?.prs[id];
  if (last && seen?.headSha === entry.facts.headSha) {
    seen.confidence = { level: judgement.level, reason: judgement.reason };
    await writeJson('last.json', last);
  }
  return `Recorded ${id}: ${confidenceText(judgement)}. ${Object.keys(pending).length} PRs wait for a judgement.`;
}

const args = process.argv.slice(2);
try {
  const pending = await readPending();
  if (args[0] === '--record') {
    if (args.length !== 2) throw new UsageError(USAGE);
    console.log(await record(pending, args[1]!));
  } else {
    if (args.some((a) => a.startsWith('-'))) throw new UsageError(USAGE);
    console.log(args.length ? await brief(pending, args) : list(pending));
  }
} catch (e) {
  console.error(e instanceof UsageError ? e.message : `Error: ${(e as Error).message}`);
  process.exit(e instanceof UsageError ? 2 : 1);
}
