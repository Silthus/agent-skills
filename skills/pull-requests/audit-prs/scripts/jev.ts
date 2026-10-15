// Asks Jev (TypeSafe AI, through the Vercel AI Gateway) the thread and draft
// questions that need judgement. Plain `fetch` against the gateway's evaluation
// endpoint keeps the skill free of npm dependencies. Answers are cached by input
// fingerprint, so an unchanged PR never costs a second call. Merge confidence is
// not Jev's: see `risk.ts`.

import { eachWithin, gatewayPost } from './key';
import { fingerprint, readJson, writeJson } from './store';
import type { JevAnswers, PrFacts } from './types';

const ENDPOINT = 'https://ai-gateway.vercel.sh/v4/ai/evaluation-model';
const MODEL = 'typesafe-ai/jev';
const CACHE_FILE = 'jev.json';
/** The whole Jev phase gets this long. Unanswered PRs keep stale hints and retry next run. */
const BUDGET_MS = 10_000;
// Jev throttles bursts. Three in flight with jittered backoff stays under its limit.
const CONCURRENCY = 3;

type Cache = Record<string, { fingerprint: string; value: JevAnswers }>;

/** The compact view of a PR that Jev reasons over. Kept small: input tokens are the whole bill. */
export function jevState(pr: PrFacts) {
  return {
    title: pr.title,
    repo: pr.repo,
    isDraft: pr.isDraft,
    description: pr.body.slice(0, 6000),
    stats: { additions: pr.additions, deletions: pr.deletions, changedFiles: pr.changedFiles },
    files: pr.files.slice(0, 80),
    testFilesChanged: pr.testFiles.length,
    mediaInDescription: pr.media,
    ci: pr.ci.state,
    reviewDecision: pr.review,
    unresolvedThreads: pr.threads.slice(0, 15).map((t) => ({
      file: t.path ?? '',
      outdated: t.isOutdated,
      from: t.authorIsBot ? `${t.author} (automated reviewer)` : `${t.author} (human reviewer)`,
      comment: t.body,
      latestReply: t.lastAuthor === t.author ? null : { from: t.lastAuthor, comment: t.lastBody },
    })),
    recentHumanComments: pr.humanComments,
  };
}

export function questionsFor(pr: PrFacts) {
  const hasHumanInput = pr.threads.some((t) => !t.authorIsBot) || pr.humanComments.length > 0;
  const hasBotThreads = pr.threads.some((t) => t.authorIsBot);
  return {
    ...(hasHumanInput && {
      humanChangesPending: {
        type: 'boolean' as const,
        instructions: 'Do unresolved review threads or recent comments from human reviewers ask the author to change something that has not been addressed yet?',
        criteria: {
          true: 'A human reviewer asked for a concrete change, fix, or answer and there is no reply or follow-up showing it was handled.',
          false: 'Human feedback is praise, a resolved question, an optional suggestion the author declined with a reason, or there is no human feedback.',
        },
      },
    }),
    ...(hasBotThreads && {
      botFindingsSubstantive: {
        type: 'boolean' as const,
        instructions: 'Do the unresolved threads from automated reviewers describe a real defect that should be fixed before this PR merges?',
        criteria: {
          true: 'At least one automated finding points to a bug, a security issue, broken behavior, or missing handling that the author has not answered.',
          false: 'The automated findings are style nits, optional refactors, false positives, or the author already replied explaining why no change is needed.',
        },
      },
    }),
    ...(pr.isDraft && {
      draftFinished: {
        type: 'boolean' as const,
        instructions: 'Is the implementation of this draft PR substantially complete, so it only waits for the author to validate it and mark it ready for review?',
        criteria: {
          true: 'The description reads as a finished change: problem, solution, and validation are written up, no TODO items or "WIP" markers remain.',
          false: 'The description mentions remaining work, open questions, TODOs, missing tests, or the change is clearly partial.',
        },
      },
    }),
  };
}

type RawAnswer = { probability?: number };

async function evaluate(key: string, pr: PrFacts, deadline: number): Promise<{ answers: JevAnswers; inputTokens: number }> {
  const questions = questionsFor(pr);
  // A PR without threads that is not a draft raises no question. It costs no call.
  if (!Object.keys(questions).length) return { answers: NO_QUESTIONS, inputTokens: 0 };
  const body = await gatewayPost<{ answers: Record<string, RawAnswer>; usage?: { inputTokens?: number } }>(
    ENDPOINT, key, { state: jevState(pr), questions }, deadline, {
      'ai-gateway-protocol-version': '0.0.1',
      'ai-gateway-auth-method': 'api-key',
      'ai-evaluation-model-specification-version': '4',
      'ai-model-id': MODEL,
    });
  const a = body.answers;
  return {
    answers: {
      humanChangesPending: a.humanChangesPending?.probability ?? null,
      botFindingsSubstantive: a.botFindingsSubstantive?.probability ?? null,
      draftFinished: a.draftFinished?.probability ?? null,
    },
    inputTokens: body.usage?.inputTokens ?? 0,
  };
}

const NO_QUESTIONS: JevAnswers = { humanChangesPending: null, botFindingsSubstantive: null, draftFinished: null };

export interface JevRun {
  answers: Map<string, JevAnswers>;
  fresh: number;
  cached: number;
  /** Out of budget or failed; retried on the next run. */
  deferred: number;
  inputTokens: number;
  errors: string[];
}

/** Answers every PR from cache or Jev. A failed PR keeps its last cached answer as a stale hint. */
export async function askJev(key: string, prs: PrFacts[]): Promise<JevRun> {
  const cache = await readJson<Cache>(CACHE_FILE, {});
  const run: JevRun = { answers: new Map(), fresh: 0, cached: 0, deferred: 0, inputTokens: 0, errors: [] };
  const todo: { pr: PrFacts; fp: string }[] = [];
  for (const pr of prs) {
    const fp = fingerprint({ state: jevState(pr), questions: questionsFor(pr) });
    const hit = cache[pr.id];
    if (hit?.fingerprint === fp) { run.answers.set(pr.id, hit.value); run.cached++; }
    else todo.push({ pr, fp });
  }

  const deadline = Date.now() + BUDGET_MS;
  const { failed, denied } = await eachWithin(todo, CONCURRENCY, deadline, async ({ pr, fp }) => {
    const { answers, inputTokens } = await evaluate(key, pr, deadline);
    cache[pr.id] = { fingerprint: fp, value: answers };
    run.answers.set(pr.id, answers);
    run.fresh++;
    run.inputTokens += inputTokens;
  });
  for (const [{ pr }, message] of failed) run.errors.push(`${pr.id}: ${message}`);
  // Anything without a fresh answer falls back to its last answer as a stale hint.
  for (const { pr } of todo) {
    if (run.answers.has(pr.id)) continue;
    run.deferred++;
    const stale = cache[pr.id]?.value;
    if (stale) run.answers.set(pr.id, stale);
  }
  if (denied) throw denied;

  // Drop closed PRs so the cache only holds what is open.
  const live = new Set(prs.map((p) => p.id));
  for (const id of Object.keys(cache)) if (!live.has(id)) delete cache[id];
  await writeJson(CACHE_FILE, cache);
  return run;
}
