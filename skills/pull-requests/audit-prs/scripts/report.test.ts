import { describe, expect, test } from 'bun:test';
import { confidenceText, diff, type Snapshot } from './report';

const entry = (overrides: Partial<Snapshot['prs'][string]> = {}): Snapshot['prs'][string] => ({
  title: 'Fix it', url: 'https://github.com/o/r/pull/1', status: 'ready-for-review', nextAction: 'Ask for review',
  headSha: 'abc', ci: 'green', review: 'review-required', awaitingAuthor: 0, ...overrides,
});
const snap = (prs: Snapshot['prs']): Snapshot => ({ at: '2026-09-23T00:00:00Z', prs });

describe('diff', () => {
  test('the first run has nothing to compare against', () => {
    expect(diff(null, snap({ 'o/r#1': entry() }))).toEqual([]);
  });

  test('an unchanged audit stays quiet', () => {
    expect(diff(snap({ 'o/r#1': entry() }), snap({ 'o/r#1': entry() }))).toEqual([]);
  });

  test('reports status, push, CI, and new replies in one line with the next action', () => {
    const before = snap({ 'o/r#1': entry() });
    const after = snap({ 'o/r#1': entry({ status: 'blocked', headSha: 'def', ci: 'failing', awaitingAuthor: 2, nextAction: 'Fix failing CI: lint' }) });
    expect(diff(before, after)).toEqual([
      'Changed: [o/r#1](https://github.com/o/r/pull/1) ready-for-review → blocked, new push, CI green → failing, 2 new thread replies await the author. Next: Fix failing CI: lint',
    ]);
  });

  test('reports new and closed PRs', () => {
    const lines = diff(snap({ 'o/r#1': entry() }), snap({ 'o/r#2': entry({ url: 'https://github.com/o/r/pull/2', title: 'New thing' }) }));
    expect(lines).toEqual([
      'New: [o/r#2](https://github.com/o/r/pull/2) New thing → ready-for-review. Ask for review',
      'Closed or merged: [o/r#1](https://github.com/o/r/pull/1) Fix it',
    ]);
  });
});

describe('diff of merge confidence', () => {
  const ready = { status: 'ready-to-merge' as const, nextAction: 'Merge it' };
  const low = { level: 'low' as const, reason: 'touches the billing webhook, no test covers the refund path' };

  test('a PR that becomes ready to merge with low confidence is news, with the reason', () => {
    const lines = diff(snap({ 'o/r#1': entry({ confidence: low }) }), snap({ 'o/r#1': entry({ ...ready, confidence: low }) }));
    expect(lines[0]).toContain('ready-for-review → ready-to-merge, low merge confidence: touches the billing webhook, no test covers the refund path');
  });

  test('a ready PR that drops to low is news once, then stays quiet', () => {
    const high = snap({ 'o/r#1': entry({ ...ready, confidence: { level: 'high', reason: 'docs only' } }) });
    const dropped = snap({ 'o/r#1': entry({ ...ready, confidence: low }) });
    expect(diff(high, dropped)[0]).toContain('low merge confidence');
    expect(diff(dropped, dropped)).toEqual([]);
  });

  test('stays quiet against an older snapshot without the field, and for low confidence outside "Ready to merge"', () => {
    expect(diff(snap({ 'o/r#1': entry(ready) }), snap({ 'o/r#1': entry({ ...ready, confidence: low }) }))).toEqual([]);
    expect(diff(snap({ 'o/r#1': entry() }), snap({ 'o/r#1': entry({ confidence: low }) }))).toEqual([]);
  });

  test('a new PR that is ready to merge with low confidence says so', () => {
    expect(diff(snap({}), snap({ 'o/r#1': entry({ ...ready, confidence: low }) }))[0])
      .toBe('New: [o/r#1](https://github.com/o/r/pull/1) Fix it → ready-to-merge. Merge it. Low merge confidence: touches the billing webhook, no test covers the refund path');
  });
});

describe('confidenceText', () => {
  test('names the level, the concrete risk, and the scope', () => {
    expect(confidenceText({
      level: 'low', reason: 'touches the billing webhook, no test covers the refund path', areas: ['api', 'auth-billing'],
      userFacing: true, breakLikelihood: 'medium', breakSeverity: 'high', basis: 'diff excerpt',
    })).toBe('low: touches the billing webhook, no test covers the refund path (api, auth-billing; user-facing; breakage likelihood medium, severity high; judged from the diff excerpt)');
  });

  test('an unscored PR shows the note instead of a level', () => {
    expect(confidenceText({ level: 'unscored', reason: 'waits for your judgement: run score.ts' })).toBe('unscored: waits for your judgement: run score.ts');
  });
});

describe('diff of modernize candidates', () => {
  test('reports a PR that becomes stale, but not against an older snapshot without the field', () => {
    const after = snap({ 'o/r#1': entry({ modernize: true }) });
    expect(diff(snap({ 'o/r#1': entry({ modernize: false }) }), after)[0]).toContain('now a modernize candidate');
    expect(diff(snap({ 'o/r#1': entry() }), after)).toEqual([]);
  });
});
