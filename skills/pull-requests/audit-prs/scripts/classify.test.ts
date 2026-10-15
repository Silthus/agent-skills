import { describe, expect, test } from 'bun:test';
import { classify, signals, triage } from './classify';
import type { Confidence, JevAnswers, PrFacts, ThreadFacts } from './types';

const NOW = Date.parse('2026-09-23T00:00:00Z');

function pr(overrides: Partial<PrFacts> = {}): PrFacts {
  return {
    id: 'o/r#1', repo: 'o/r', number: 1, title: 't', url: 'u', body: '', isDraft: false,
    baseRef: 'master', headRef: 'feat', headSha: 'abc', createdAt: '2026-09-01T00:00:00Z', updatedAt: '2026-09-22T00:00:00Z',
    lastPushAt: '2026-09-22T00:00:00Z', behindBy: 3,
    additions: 10, deletions: 2, changedFiles: 1, files: ['src/a.ts'], labels: [],
    review: 'review-required', approvers: [], changeRequesters: [],
    mergeable: 'MERGEABLE', mergeState: 'BLOCKED',
    ci: { state: 'green', failing: [], cancelled: [], pending: [], awaitingAuthorization: 0, passed: 5 },
    trunk: { managed: true, failed: false, message: null },
    threads: [], humanComments: [], media: { images: 0, gifs: 0, videos: 0 }, testFiles: [], docsOnly: false,
    ...overrides,
  };
}

function jev(overrides: Partial<JevAnswers> = {}): JevAnswers {
  return { humanChangesPending: null, botFindingsSubstantive: null, draftFinished: null, ...overrides };
}

const humanThread: ThreadFacts = {
  path: 'a.ts', isOutdated: false, author: 'alice', authorIsBot: false, body: 'please rename',
  lastAuthor: 'alice', lastBody: 'please rename', lastAt: '2026-09-22T00:00:00Z', awaitingAuthor: true,
};
const botThread: ThreadFacts = { ...humanThread, author: 'coderabbitai', authorIsBot: true, lastAuthor: 'coderabbitai' };

describe('classify with Jev', () => {
  test('Jev decides whether an unresolved human thread is a change request', () => {
    const facts = pr({ threads: [humanThread] });
    expect(classify(facts, jev({ humanChangesPending: 0.9 })).status).toBe('changes-requested');
    expect(classify(facts, jev({ humanChangesPending: 0.2 })).status).toBe('ready-for-review');
  });

  test('substantive bot findings block, nits do not', () => {
    const facts = pr({ review: 'approved', threads: [botThread] });
    expect(classify(facts, jev({ botFindingsSubstantive: 0.8 })).status).toBe('blocked');
    expect(classify(facts, jev({ botFindingsSubstantive: 0.1 })).status).toBe('ready-to-merge');
  });

  test('conflicts beat everything except an explicit changes-requested review', () => {
    expect(classify(pr({ review: 'approved', mergeable: 'CONFLICTING' }), jev({ humanChangesPending: 0.95 })).status).toBe('blocked');
    expect(classify(pr({ review: 'changes-requested', mergeable: 'CONFLICTING' }), jev()).status).toBe('changes-requested');
  });

  test('approved with CI waiting for a maintainer is its own group', () => {
    const c = classify(pr({ review: 'approved', ci: { ...pr().ci, state: 'awaiting-authorization', awaitingAuthorization: 12, passed: 0 } }), jev());
    expect(c.status).toBe('waiting-ci-authorization');
  });
});

describe('classify without Jev', () => {
  test("a human thread that awaits the author's reply counts as a change request and asks the agent to confirm", () => {
    const c = classify(pr({ threads: [humanThread] }), null);
    expect(c.status).toBe('changes-requested');
    expect(c.openQuestions.join(' ')).toMatch(/ask for changes/);
  });

  test('a human thread the author answered last does not block', () => {
    expect(classify(pr({ threads: [{ ...humanThread, lastAuthor: 'me', awaitingAuthor: false }] }), null).status).toBe('ready-for-review');
  });

  test('bot findings never block on their own, the agent judges them', () => {
    const c = classify(pr({ review: 'approved', threads: [botThread] }), null);
    expect(c.status).toBe('ready-to-merge');
    expect(c.openQuestions).toEqual(['Judge 1 unanswered bot finding: real defect or noise?']);
    expect(c.nextAction).toBe('Judge the bot findings, then comment /trunk merge');
  });

  test('a draft is never called finished without Jev', () => {
    const c = classify(pr({ isDraft: true }), null);
    expect(c.draftFinished).toBe(false);
    expect(c.openQuestions).toContain('Does the description read as a finished change?');
  });
});

describe('triage', () => {
  const judged: Confidence = {
    level: 'low', reason: 'touches the billing webhook, no test covers the refund path', areas: ['api', 'auth-billing'],
    userFacing: true, breakLikelihood: 'medium', breakSeverity: 'high', basis: 'full diff',
  };

  test("keeps the agent's confidence as is", () => {
    expect(triage(pr({ review: 'approved' }), jev(), judged, NOW).confidence).toEqual(judged);
  });
});

describe('signals', () => {
  test('a PR without a push for two weeks is a modernize candidate', () => {
    expect(signals(pr({ lastPushAt: '2026-09-01T00:00:00Z', behindBy: 412 }), NOW))
      .toEqual(['Stale: last push 22 days ago, 412 commits behind master. Modernize candidate']);
  });

  test('a fresh PR with conflicts names the drift instead', () => {
    expect(signals(pr({ mergeable: 'CONFLICTING', behindBy: 40 }), NOW)).toEqual(['Conflicts with master, 40 commits behind master']);
  });

  test("counts threads that await the author's reply by author kind", () => {
    expect(signals(pr({ threads: [humanThread, botThread, botThread] }), NOW))
      .toEqual(["1 human thread awaiting the author's reply", "2 bot threads awaiting the author's reply"]);
  });
});
