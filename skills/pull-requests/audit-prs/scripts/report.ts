// Renders the audit as compact Markdown for an agent, and diffs it against the
// previous run so a loop can tell "nothing changed" from real news.

import { isStale } from './classify';
import { STATUSES, type Confidence, type Status, type TriagedPr } from './types';

/** What the next run compares against. Only fields whose change is news. */
export interface Snapshot {
  at: string;
  prs: Record<string, {
    title: string;
    url: string;
    status: Status;
    nextAction: string;
    headSha: string;
    ci: string;
    review: string;
    awaitingAuthor: number;
    /** Optional: snapshots from before this field stay quiet instead of flagging every stale PR. */
    modernize?: boolean;
    /** Optional for the same reason. */
    confidence?: { level: Confidence['level']; reason: string };
  }>;
}

export function snapshot(prs: TriagedPr[], at: string): Snapshot {
  const now = Date.parse(at);
  return {
    at,
    prs: Object.fromEntries(prs.map((p) => [p.facts.id, {
      title: p.facts.title,
      url: p.facts.url,
      status: p.status,
      nextAction: p.nextAction,
      headSha: p.facts.headSha,
      ci: p.facts.ci.state,
      review: p.facts.review,
      awaitingAuthor: p.facts.threads.filter((t) => t.awaitingAuthor).length,
      modernize: isStale(p.facts, now),
      confidence: { level: p.confidence.level, reason: p.confidence.reason },
    }])),
  };
}

const link = (id: string, url: string) => `[${id}](${url})`;

/** Low confidence on a PR that is ready to merge is always news: the merge is one command away. */
const lowReady = (p: Snapshot['prs'][string]) => p.status === 'ready-to-merge' && p.confidence?.level === 'low';

/** One line per PR that changed in a way worth reacting to. Empty when nothing did. */
export function diff(previous: Snapshot | null, current: Snapshot): string[] {
  if (!previous) return [];
  const lines: string[] = [];
  for (const [id, now] of Object.entries(current.prs)) {
    const before = previous.prs[id];
    if (!before) {
      const low = lowReady(now) ? `. Low merge confidence: ${now.confidence!.reason}` : '';
      lines.push(`New: ${link(id, now.url)} ${now.title} → ${now.status}. ${now.nextAction}${low}`);
      continue;
    }
    const parts: string[] = [];
    if (before.status !== now.status) parts.push(`${before.status} → ${now.status}`);
    if (before.headSha !== now.headSha) parts.push('new push');
    if (before.ci !== now.ci) parts.push(`CI ${before.ci} → ${now.ci}`);
    if (before.review !== now.review) parts.push(`review ${before.review} → ${now.review}`);
    if (now.awaitingAuthor > before.awaitingAuthor) parts.push(`${now.awaitingAuthor - before.awaitingAuthor} new thread replies await the author`);
    if (before.modernize === false && now.modernize) parts.push('now a modernize candidate');
    // A snapshot from before the confidence field counts as known, so the first run after the upgrade stays quiet.
    const lowBefore = before.status === 'ready-to-merge' && (!before.confidence || before.confidence.level === 'low');
    if (lowReady(now) && !lowBefore) parts.push(`low merge confidence: ${now.confidence!.reason}`);
    if (parts.length) lines.push(`Changed: ${link(id, now.url)} ${parts.join(', ')}. Next: ${now.nextAction}`);
  }
  for (const [id, before] of Object.entries(previous.prs)) {
    if (!current.prs[id]) lines.push(`Closed or merged: ${link(id, before.url)} ${before.title}`);
  }
  return lines;
}

const HEADINGS: Record<Status, string> = {
  'blocked': 'Blocked, needs the author',
  'changes-requested': 'Changes requested',
  'ready-to-merge': 'Ready to merge',
  'waiting-ci-authorization': 'Waiting for CI authorization',
  'waiting-ci': 'Waiting for CI',
  'ready-for-review': 'Ready for review',
  'draft': 'Drafts',
};

const pct = (p: number | null) => (p === null ? null : `${Math.round(p * 100)}%`);

function jevLine(pr: TriagedPr): string | null {
  const j = pr.jev;
  if (!j) return null;
  const parts = [
    j.humanChangesPending !== null && `human changes pending ${pct(j.humanChangesPending)}`,
    j.botFindingsSubstantive !== null && `bot findings real ${pct(j.botFindingsSubstantive)}`,
    j.draftFinished !== null && `draft finished ${pct(j.draftFinished)}`,
  ].filter(Boolean);
  return parts.length ? `Jev hints: ${parts.join(', ')}` : null;
}

/** "low: touches the billing webhook, ... (api, auth-billing; user-facing; breakage likelihood medium, severity high)". */
export function confidenceText(c: Confidence): string {
  if (c.level === 'unscored') return `unscored: ${c.reason}`;
  const scope = [
    c.areas.join(', ') || 'no areas named',
    c.userFacing ? 'user-facing' : 'not user-facing',
    `breakage likelihood ${c.breakLikelihood}, severity ${c.breakSeverity}`,
    c.basis !== 'full diff' && `judged from the ${c.basis}`,
  ].filter(Boolean);
  return `${c.level}: ${c.reason} (${scope.join('; ')})`;
}

function prBlock(pr: TriagedPr): string {
  const f = pr.facts;
  const lines = [
    `- ${link(f.id, f.url)} ${f.title}`,
    `  Next: ${pr.nextAction}`,
    `  Confidence: ${confidenceText(pr.confidence)}`,
  ];
  if (pr.reasons.length) lines.push(`  Why: ${pr.reasons.join('; ')}`);
  if (pr.signals.length) lines.push(`  Signals: ${pr.signals.join('; ')}`);
  const jev = jevLine(pr);
  if (jev) lines.push(`  ${jev}`);
  if (pr.openQuestions.length) lines.push(`  Judge: ${pr.openQuestions.join(' ')}`);
  return lines.join('\n');
}

export interface ReportMeta {
  at: string;
  seconds: number;
  forkPrs: number;
  jev: string;
  confidence: string;
  previousAt: string | null;
  errors: string[];
}

export function renderMarkdown(prs: TriagedPr[], changes: string[], meta: ReportMeta, changesOnly: boolean): string {
  const out = [`# PR audit ${meta.at.slice(0, 16).replace('T', ' ')} UTC: ${prs.length} open PRs in ${meta.seconds.toFixed(1)}s`];
  out.push(`Jev: ${meta.jev}. Merge confidence: ${meta.confidence}. PRs into forks hidden: ${meta.forkPrs}.`);
  for (const e of meta.errors) out.push(`Error: ${e}`);

  if (meta.previousAt) {
    const since = meta.previousAt.slice(0, 16).replace('T', ' ');
    out.push('', changes.length ? `## Changes since ${since} UTC\n\n${changes.map((c) => `- ${c}`).join('\n')}` : `No changes since ${since} UTC.`);
  } else {
    out.push('', 'First run: no previous audit to compare against.');
  }
  if (changesOnly) return out.join('\n');

  for (const status of STATUSES) {
    const group = prs.filter((p) => p.status === status);
    if (!group.length) continue;
    // Finished drafts first: they only need a validation pass.
    if (status === 'draft') group.sort((a, b) => Number(b.draftFinished) - Number(a.draftFinished));
    out.push('', `## ${HEADINGS[status]} (${group.length})`, '', group.map(prBlock).join('\n'));
  }
  return out.join('\n');
}
