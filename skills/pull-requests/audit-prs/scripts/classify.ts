// Combines deterministic facts with Jev's hints into one status, a next
// action, and signals. Rules decide first. Jev refines the cases GitHub's data
// cannot tell; without Jev those cases become open questions for the agent.
// Merge confidence comes from `risk.ts` and is only attached here.

import type { Confidence, JevAnswers, PrFacts, Status, TriagedPr } from './types';

const YES = 0.7;
/** Drafts get a softer threshold: authors rarely write "done" in a draft description. */
const DRAFT_DONE = 0.5;
/** A PR without a push for this long has likely drifted from its base. */
export const STALE_DAYS = 14;
const DAY_MS = 86_400_000;

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;

export function daysSince(iso: string, now: number): number {
  return Math.floor((now - Date.parse(iso)) / DAY_MS);
}

export const isStale = (pr: PrFacts, now: number) => daysSince(pr.lastPushAt, now) >= STALE_DAYS;

interface Classification {
  status: Status;
  draftFinished: boolean;
  nextAction: string;
  reasons: string[];
  openQuestions: string[];
}

export function classify(pr: PrFacts, jev: JevAnswers | null): Classification {
  const reasons: string[] = [];
  const openQuestions: string[] = [];
  const humanWaiting = pr.threads.filter((t) => !t.authorIsBot && t.awaitingAuthor && !t.isOutdated).length;
  const botWaiting = pr.threads.filter((t) => t.authorIsBot && t.awaitingAuthor && !t.isOutdated).length;

  // Without Jev, an unanswered human thread counts as a change request. Bot findings never block on their own.
  let humanChanges: boolean;
  if (jev?.humanChangesPending != null) humanChanges = jev.humanChangesPending >= YES;
  else {
    humanChanges = humanWaiting > 0;
    if (humanWaiting || pr.humanComments.length) openQuestions.push('Do the unanswered human threads or comments ask for changes?');
  }
  let botFindings = false;
  if (jev?.botFindingsSubstantive != null) botFindings = jev.botFindingsSubstantive >= YES;
  else if (botWaiting) openQuestions.push(`Judge ${plural(botWaiting, 'unanswered bot finding')}: real defect or noise?`);

  if (pr.isDraft) {
    const draftFinished = (jev?.draftFinished ?? 0) >= DRAFT_DONE;
    if (!jev) openQuestions.push('Does the description read as a finished change?');
    reasons.push(draftFinished ? 'Description reads as finished' : 'Implementation still in progress');
    return {
      status: 'draft',
      draftFinished,
      nextAction: draftFinished ? 'Validate and mark ready for review' : 'Finish the implementation',
      reasons,
      openQuestions,
    };
  }

  // Hard blockers come from GitHub facts. Jev only adds the judgement calls.
  const hardBlockers: string[] = [];
  if (pr.mergeable === 'CONFLICTING') hardBlockers.push('Resolve merge conflicts');
  if (pr.ci.state === 'failing') hardBlockers.push(`Fix failing CI: ${pr.ci.failing.slice(0, 3).join(', ')}`);
  if (pr.trunk.failed) hardBlockers.push('Trunk removed the PR from the merge queue');
  const threadBlockers: string[] = [];
  if (humanChanges) threadBlockers.push(`Address ${plural(humanWaiting || pr.threads.filter((t) => !t.authorIsBot).length, 'unresolved reviewer thread')}`);
  if (botFindings) threadBlockers.push(`Check ${plural(botWaiting, 'automated finding')}`);
  const result = (status: Status, nextAction: string, why: string[]): Classification =>
    ({ status, draftFinished: false, nextAction, reasons: why, openQuestions });

  if (pr.review === 'changes-requested') {
    reasons.push(`Changes requested by ${pr.changeRequesters.join(', ') || 'a reviewer'}`);
    return result('changes-requested', hardBlockers[0] ?? 'Address the review feedback', [...reasons, ...hardBlockers, ...threadBlockers]);
  }
  if (hardBlockers.length) return result('blocked', hardBlockers[0]!, [...hardBlockers, ...threadBlockers]);
  if (humanChanges) return result('changes-requested', threadBlockers[0]!, ['A reviewer asked for changes in a thread', ...threadBlockers]);
  if (botFindings) return result('blocked', threadBlockers[0]!, threadBlockers);

  if (pr.review === 'approved') {
    reasons.push(`Approved by ${pr.approvers.join(', ') || 'a reviewer'}`);
    if (pr.ci.state === 'awaiting-authorization') {
      return result('waiting-ci-authorization', 'Ask a maintainer to authorize the CI run', [...reasons, `${plural(pr.ci.awaitingAuthorization, 'workflow')} need authorization`]);
    }
    if (pr.ci.state === 'cancelled') {
      return result('waiting-ci', 'Re-run CI, the last runs were cancelled', [...reasons, `${plural(pr.ci.cancelled.length, 'check')} cancelled`]);
    }
    if (pr.ci.state === 'pending' || pr.ci.state === 'none') {
      return result('waiting-ci', 'Wait for CI to finish', [...reasons, pr.ci.pending.length ? `${plural(pr.ci.pending.length, 'check')} running` : 'No check results yet']);
    }
    if (pr.mergeable === 'UNKNOWN') reasons.push('Mergeability not computed yet');
    const merge = pr.trunk.managed ? 'Comment /trunk merge' : 'Merge it';
    // Unjudged bot findings could still hide a defect, so the merge waits for the agent's verdict.
    const nextAction = !jev && botWaiting ? `Judge the bot findings, then ${merge.toLowerCase()}` : merge;
    return result('ready-to-merge', nextAction, [...reasons, 'CI green']);
  }

  // Not approved, nothing blocking: it needs a reviewer.
  reasons.push('No current approval');
  if (pr.ci.state === 'awaiting-authorization') reasons.push('CI also needs authorization');
  if (pr.ci.state === 'pending') reasons.push('CI running');
  if (pr.ci.state === 'cancelled') reasons.push('CI runs were cancelled');
  const nextAction = pr.ci.state === 'awaiting-authorization' ? 'Ask for review and CI authorization'
    : pr.ci.state === 'cancelled' ? 'Re-run CI, then ask for review'
    : 'Ask for review';
  return result('ready-for-review', nextAction, reasons);
}

/** Status-independent warnings: drift from the base branch and unanswered threads. */
export function signals(pr: PrFacts, now: number): string[] {
  const out: string[] = [];
  const behind = pr.behindBy === null ? '' : `, ${pr.behindBy} commits behind ${pr.baseRef}`;
  if (isStale(pr, now)) out.push(`Stale: last push ${daysSince(pr.lastPushAt, now)} days ago${behind}. Modernize candidate`);
  else if (pr.mergeable === 'CONFLICTING') out.push(`Conflicts with ${pr.baseRef}${behind}`);
  const human = pr.threads.filter((t) => !t.authorIsBot && t.awaitingAuthor).length;
  const bot = pr.threads.filter((t) => t.authorIsBot && t.awaitingAuthor).length;
  if (human) out.push(`${plural(human, 'human thread')} awaiting the author's reply`);
  if (bot) out.push(`${plural(bot, 'bot thread')} awaiting the author's reply`);
  if (pr.trunk.message) out.push(`Trunk: ${pr.trunk.message}`);
  return out;
}

/** Joins the classification with the agent's merge confidence from `risk.ts`. */
export function triage(pr: PrFacts, jev: JevAnswers | null, confidence: Confidence, now: number): TriagedPr {
  const c = classify(pr, jev);
  return { facts: pr, ...c, signals: signals(pr, now), confidence, jev };
}
