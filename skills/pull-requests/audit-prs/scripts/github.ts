// Fetches the viewer's open PRs from GitHub GraphQL with the `gh` login token.
// A light search lists the PRs, then detail queries run in parallel batches, so
// the wall time is one slow batch instead of the sum of all pages.

import { $ } from 'bun';

const ENDPOINT = 'https://api.github.com/graphql';
const BATCH_SIZE = 2;
const MAX_ATTEMPTS = 4;
const SAFE_NAME = /^[\w.-]+$/;

export interface RawActor { login: string; __typename?: string }
export interface RawThread {
  isResolved: boolean;
  isOutdated: boolean;
  path: string | null;
  comments: { nodes: { body: string; author: RawActor | null }[] };
  lastComment: { nodes: { body: string; createdAt: string; author: RawActor | null }[] };
}
export interface RawCheck {
  __typename: 'CheckRun' | 'StatusContext';
  name?: string; status?: string; conclusion?: string | null;
  context?: string; state?: string;
}
export interface RawPr {
  number: number; title: string; url: string; body: string; isDraft: boolean;
  createdAt: string; updatedAt: string; baseRefName: string; headRefName: string;
  additions: number; deletions: number; changedFiles: number;
  mergeable: string; mergeStateStatus: string; reviewDecision: string | null;
  repository: { nameWithOwner: string; isFork: boolean };
  labels: { nodes: { name: string }[] };
  files: { nodes: { path: string }[] };
  latestOpinionatedReviews: { nodes: { state: string; author: RawActor | null }[] };
  comments: { nodes: { body: string; createdAt: string; author: RawActor | null }[] };
  reviewThreads: { nodes: RawThread[] };
  baseRef: { compare: { behindBy: number } | null } | null;
  commits: { nodes: { commit: {
    oid: string;
    committedDate: string;
    statusCheckRollup: { contexts: { nodes: RawCheck[] } } | null;
    checkSuites: { nodes: { status: string; conclusion: string | null }[] };
  } }[] };
}

export interface FetchResult { viewer: string; prs: RawPr[]; forkPrs: number }

interface PrRef { owner: string; name: string; number: number }

const PR_FIELDS = /* GraphQL */ `
  fragment Pr on PullRequest {
    number title url body isDraft createdAt updatedAt
    baseRefName headRefName
    additions deletions changedFiles
    mergeable mergeStateStatus reviewDecision
    repository { nameWithOwner isFork }
    labels(first: 20) { nodes { name } }
    files(first: 100) { nodes { path } }
    latestOpinionatedReviews(first: 20) { nodes { state author { login } } }
    comments(last: 20) { nodes { body createdAt author { login __typename } } }
    reviewThreads(first: 40) {
      nodes {
        isResolved isOutdated path
        comments(first: 1) { nodes { body author { login __typename } } }
        lastComment: comments(last: 1) { nodes { body createdAt author { login __typename } } }
      }
    }
    commits(last: 1) {
      nodes { commit {
        oid committedDate
        statusCheckRollup {
          contexts(first: 100) { nodes {
            __typename
            ... on CheckRun { name status conclusion }
            ... on StatusContext { context state }
          } }
        }
        checkSuites(first: 40) { nodes { status conclusion } }
      } }
    }
  }
`;

const LIST_QUERY = /* GraphQL */ `
  query ($after: String) {
    viewer { login }
    search(query: "is:pr is:open author:@me archived:false", type: ISSUE, first: 100, after: $after) {
      pageInfo { hasNextPage endCursor }
      nodes { ... on PullRequest { number repository { name isFork owner { login } } } }
    }
  }
`;

let tokenOnce: Promise<string> | null = null;
/** Reads the token once per run. `GH_TOKEN` wins, like it does for `gh` itself. */
const githubToken = () => (tokenOnce ??= readToken());

async function readToken(): Promise<string> {
  const fromEnv = process.env.GH_TOKEN ?? process.env.GITHUB_TOKEN;
  if (fromEnv) return fromEnv;
  const out = await $`gh auth token`.quiet().nothrow();
  if (out.exitCode !== 0) throw new Error('No GitHub token. Run `gh auth login` or set GH_TOKEN.');
  return out.stdout.toString().trim();
}

/**
 * GitHub answers heavy GraphQL queries with 502 now and then. Back off and retry.
 * Partial errors count as failures: a PR missing from the data would read as closed.
 */
async function graphql<T>(token: string, query: string, variables: Record<string, unknown> = {}): Promise<T> {
  let lastError = '';
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, variables }),
      });
      if (res.ok) {
        const json = await res.json() as { data?: T; errors?: { message: string }[] };
        if (json.data && !json.errors?.length) return json.data;
        lastError = json.errors?.map((e) => e.message).join('; ') ?? 'empty response';
      } else {
        lastError = `HTTP ${res.status}`;
        if (res.status === 401) break;
      }
    } catch (e) {
      lastError = (e as Error).message;
    }
    if (attempt < MAX_ATTEMPTS) await Bun.sleep(1000 * attempt);
  }
  throw new Error(`GitHub GraphQL failed: ${lastError}`);
}

/** One aliased query per batch: `p0: repository(...) { pullRequest(...) { ...Pr } }`. */
export function detailQuery(refs: PrRef[]): string {
  const parts = refs.map((r, i) => {
    if (!SAFE_NAME.test(r.owner) || !SAFE_NAME.test(r.name)) throw new Error(`Unexpected repository name: ${r.owner}/${r.name}`);
    // `refs/pull/N/head` lives in the base repository, so the compare also works for fork branches.
    return `p${i}: repository(owner: "${r.owner}", name: "${r.name}") { pullRequest(number: ${r.number}) {
      ...Pr
      baseRef { compare(headRef: "refs/pull/${r.number}/head") { behindBy } }
    } }`;
  });
  return `query {\n${parts.join('\n')}\n}\n${PR_FIELDS}`;
}

export async function fetchOpenPrs(): Promise<FetchResult> {
  const token = await githubToken();
  const refs: PrRef[] = [];
  let viewer = '';
  let forkPrs = 0;
  let after: string | null = null;
  for (let page = 0; page < 10; page++) {
    type ListPage = { viewer: { login: string }; search: { pageInfo: { hasNextPage: boolean; endCursor: string }; nodes: ({ number: number; repository: { name: string; isFork: boolean; owner: { login: string } } } | null)[] } };
    const data: ListPage = await graphql<ListPage>(token, LIST_QUERY, { after });
    viewer = data.viewer.login;
    for (const n of data.search.nodes) {
      if (!n || !('number' in n)) continue;
      // PRs into forks are private scratch work. PRs from a fork into upstream stay.
      if (n.repository.isFork) { forkPrs++; continue; }
      refs.push({ owner: n.repository.owner.login, name: n.repository.name, number: n.number });
    }
    if (!data.search.pageInfo.hasNextPage) break;
    after = data.search.pageInfo.endCursor;
  }

  const batches: PrRef[][] = [];
  for (let i = 0; i < refs.length; i += BATCH_SIZE) batches.push(refs.slice(i, i + BATCH_SIZE));
  const results = await Promise.all(batches.map(async (batch) => {
    const data = await graphql<Record<string, { pullRequest: RawPr | null } | null>>(token, detailQuery(batch));
    return Object.values(data).map((repo) => repo?.pullRequest).filter((pr): pr is RawPr => !!pr);
  }));
  return { viewer, prs: results.flat(), forkPrs };
}

/** The PR's unified diff, or null when GitHub refuses to render it because it is too large. */
export async function fetchDiff(repo: string, number: number, signal?: AbortSignal): Promise<string | null> {
  const res = await fetch(`https://api.github.com/repos/${repo}/pulls/${number}`, {
    signal,
    headers: { Authorization: `Bearer ${await githubToken()}`, Accept: 'application/vnd.github.diff' },
  });
  if (res.status === 406 || res.status === 422) return null;
  if (!res.ok) throw new Error(`GitHub diff HTTP ${res.status}`);
  return res.text();
}
