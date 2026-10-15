// Turns a raw GraphQL PR into deterministic facts. Everything here is a plain
// rule; nothing needs a model.

import type { RawActor, RawPr } from './github';
import type { CiState, CommentFacts, PrFacts, ReviewState, ThreadFacts } from './types';

const KNOWN_BOTS = new Set(['coderabbitai', 'trunk-io', 'github-actions', 'dependabot', 'renovate', 'vercel', 'greptile-apps', 'posthog-bot', 'codecov']);

export function isBot(actor: RawActor | null): boolean {
  if (!actor) return true;
  return actor.__typename === 'Bot' || actor.login.endsWith('[bot]') || KNOWN_BOTS.has(actor.login);
}

const TEST_FILE = /(^|\/)(tests?|__tests__|spec|e2e|cypress|playwright)\/|\.(test|spec|stories)\.[jt]sx?$|_test\.(py|go|rs)$|(^|\/)test_[^/]+\.py$/i;
const DOC_FILE = /\.(md|mdx|txt|rst)$|(^|\/)docs?\//i;

export function detectMedia(body: string) {
  const images = (body.match(/!\[[^\]]*\]\([^)]+\)|<img\b/gi) ?? []).length;
  const gifs = (body.match(/\.gif\b/gi) ?? []).length;
  const videos = (body.match(/\.(mp4|mov|webm)\b|<video\b|user-attachments\/assets\//gi) ?? []).length;
  return { images: Math.max(0, images - gifs), gifs, videos };
}

function reviewState(decision: string | null): ReviewState {
  switch (decision) {
    case 'APPROVED': return 'approved';
    case 'CHANGES_REQUESTED': return 'changes-requested';
    case 'REVIEW_REQUIRED': return 'review-required';
    default: return 'none';
  }
}

function ciFacts(pr: RawPr): PrFacts['ci'] {
  const commit = pr.commits.nodes[0]?.commit;
  const checks = commit?.statusCheckRollup?.contexts.nodes ?? [];
  const suites = commit?.checkSuites.nodes ?? [];
  const failing: string[] = [];
  const cancelled: string[] = [];
  const pending: string[] = [];
  let passed = 0;
  for (const c of checks) {
    if (c.__typename === 'CheckRun') {
      const name = c.name ?? 'check';
      if (c.status !== 'COMPLETED') pending.push(name);
      else if (['FAILURE', 'TIMED_OUT', 'STARTUP_FAILURE'].includes(c.conclusion ?? '')) failing.push(name);
      else if (c.conclusion === 'CANCELLED') cancelled.push(name);
      else passed++;
    } else {
      const name = c.context ?? 'status';
      if (c.state === 'PENDING' || c.state === 'EXPECTED') pending.push(name);
      else if (c.state === 'FAILURE' || c.state === 'ERROR') failing.push(name);
      else passed++;
    }
  }
  const awaitingAuthorization = suites.filter((s) => s.conclusion === 'ACTION_REQUIRED').length;
  const suitesRunning = suites.some((s) => s.status !== 'COMPLETED');
  let state: CiState = 'none';
  if (failing.length) state = 'failing';
  else if (awaitingAuthorization) state = 'awaiting-authorization';
  else if (pending.length || suitesRunning) state = 'pending';
  else if (cancelled.length) state = 'cancelled';
  else if (passed) state = 'green';
  return { state, failing, cancelled, pending, awaitingAuthorization, passed };
}

function trunkFacts(pr: RawPr): PrFacts['trunk'] {
  const comment = [...pr.comments.nodes].reverse().find((c) => c.author?.login === 'trunk-io' && c.body.includes('Trunk'));
  if (!comment) return { managed: false, failed: false, message: null };
  const firstLine = comment.body.replace(/<!--.*?-->/gs, '').trim().split('\n')[0] ?? '';
  const failed = /🚫|❌|removed from the merge queue|failed/i.test(firstLine);
  return { managed: true, failed, message: failed ? firstLine.slice(0, 300) : null };
}

const clip = (s: string, n: number) => (s.length > n ? `${s.slice(0, n)}…` : s);

export function toFacts(pr: RawPr, viewer: string): PrFacts {
  const files = pr.files.nodes.map((f) => f.path);
  const threads: ThreadFacts[] = pr.reviewThreads.nodes
    .filter((t) => !t.isResolved)
    .map((t) => {
      const first = t.comments.nodes[0];
      const last = t.lastComment.nodes[0];
      const lastAuthor = last?.author?.login ?? 'unknown';
      return {
        path: t.path,
        isOutdated: t.isOutdated,
        author: first?.author?.login ?? 'unknown',
        authorIsBot: isBot(first?.author ?? null),
        body: clip(first?.body ?? '', 600),
        lastAuthor,
        lastBody: clip(last?.body ?? '', 300),
        lastAt: last?.createdAt ?? '',
        awaitingAuthor: lastAuthor !== viewer,
      };
    });
  const humanComments: CommentFacts[] = pr.comments.nodes
    .filter((c) => c.author && !isBot(c.author) && c.author.login !== viewer)
    .slice(-8)
    .map((c) => ({ author: c.author!.login, body: clip(c.body, 500), createdAt: c.createdAt }));
  const reviews = pr.latestOpinionatedReviews.nodes;
  const testFiles = files.filter((f) => TEST_FILE.test(f));
  const head = pr.commits.nodes[0]?.commit;
  return {
    id: `${pr.repository.nameWithOwner}#${pr.number}`,
    repo: pr.repository.nameWithOwner,
    number: pr.number,
    title: pr.title,
    url: pr.url,
    body: pr.body ?? '',
    isDraft: pr.isDraft,
    baseRef: pr.baseRefName,
    headRef: pr.headRefName,
    headSha: head?.oid ?? '',
    createdAt: pr.createdAt,
    updatedAt: pr.updatedAt,
    lastPushAt: head?.committedDate ?? pr.updatedAt,
    behindBy: pr.baseRef?.compare?.behindBy ?? null,
    additions: pr.additions,
    deletions: pr.deletions,
    changedFiles: pr.changedFiles,
    files,
    labels: pr.labels.nodes.map((l) => l.name),
    review: reviewState(pr.reviewDecision),
    approvers: reviews.filter((r) => r.state === 'APPROVED').map((r) => r.author?.login ?? '?'),
    changeRequesters: reviews.filter((r) => r.state === 'CHANGES_REQUESTED').map((r) => r.author?.login ?? '?'),
    mergeable: (pr.mergeable as PrFacts['mergeable']) ?? 'UNKNOWN',
    mergeState: pr.mergeStateStatus,
    ci: ciFacts(pr),
    trunk: trunkFacts(pr),
    threads,
    humanComments,
    media: detectMedia(pr.body ?? ''),
    testFiles,
    docsOnly: files.length > 0 && files.every((f) => DOC_FILE.test(f)),
  };
}
