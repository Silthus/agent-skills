import { describe, expect, test } from 'bun:test';
import { checkSpec, modulesPage, type Spec, type Wire } from './modules-page';

const spec = (overrides: Partial<Spec> = {}): Spec => ({
  rows: [
    { modules: [
      { id: 'engine', name: 'Engine', seam: ['give'], chips: [{ id: 'engine-awards', text: 'awards' }] },
      { id: 'progression', name: 'Progression', seam: ['applyGain'] },
    ] },
    { bus: { name: 'Bus' } },
  ],
  wires: [{ from: 'engine', to: 'bus', kind: 'bus', label: 'pub pointsGiven' }],
  ...overrides,
});

describe('checkSpec', () => {
  test('a spec whose wires attach to frames, seam bars, chips and the bus passes', () => {
    const wires = [
      { from: 'engine-awards', to: 'progression-seam' },
      { from: 'bus', to: 'progression', kind: 'bus' as const },
    ];
    expect(checkSpec(spec({ wires }))).toEqual([]);
  });

  test('names a wire end that is not on the page', () => {
    expect(checkSpec(spec({ wires: [{ from: 'engine', to: 'rewards-seam' }] }))).toEqual([
      'wire engine → rewards-seam: no element rewards-seam',
    ]);
  });

  test('a module without seam functions has no seam bar to attach to', () => {
    const rows: Spec['rows'] = [{ modules: [
      { id: 'player', name: 'Player', external: true, seam: [] },
      { id: 'engine', name: 'Engine', seam: ['give'] },
    ] }];
    expect(checkSpec({ rows, wires: [{ from: 'player-seam', to: 'engine-seam' }] })).toEqual([
      'wire player-seam → engine-seam: no element player-seam',
    ]);
  });

  test('names an id used twice', () => {
    const rows: Spec['rows'] = [{ modules: [
      { id: 'engine', name: 'Engine', seam: [] },
      { id: 'quests', name: 'Quests', seam: [], chips: [{ id: 'engine', text: 'engine copy' }] },
    ] }];
    expect(checkSpec({ rows, wires: [] })).toEqual(['id engine is used twice']);
  });
});

const viewButtons = (html: string) => [...html.matchAll(/data-view-to="(\w+)"/g)].map((match) => match[1]);
const hasUntouchedToggle = (html: string) => /<button[^>]*data-untouched-toggle/.test(html);
const legend = (html: string) => [...html.matchAll(/<span class="key">(.*?)<\/span>/g)].map((match) => match[1]);

describe('modulesPage', () => {
  test('a context map that changes nothing has no view buttons and no untouched toggle', () => {
    const html = modulesPage(spec());
    expect(viewButtons(html)).toEqual([]);
    expect(hasUntouchedToggle(html)).toBe(false);
  });

  test('a change that removes parts can be viewed as target, target with what it removes, and today', () => {
    const rows: Spec['rows'] = [{ modules: [
      { id: 'quests', name: 'Quests', seam: ['rerollQuest', { name: 'openQuestCrate', change: 'removed' }] },
    ] }];
    expect(viewButtons(modulesPage({ rows, wires: [] }))).toEqual(['target', 'removed', 'today']);
  });

  test('untouched modules sit behind a toggle', () => {
    const html = modulesPage(spec({ untouched: [{ name: 'Store', seam: ['buyItem'], used: 22 }] }));
    expect(hasUntouchedToggle(html)).toBe(true);
    expect(html).toContain('22 used outside');
  });

  test('the legend explains only what the page draws', () => {
    const rows: Spec['rows'] = [{ modules: [
      { id: 'quests', name: 'Quests', used: 61, seam: [{ name: 'questLogOf', change: 'added' }], chips: [{ text: 'imports questsFlag', cycle: true }] },
      { id: 'rewards', name: 'Rewards', followUp: true, change: 'added', seam: ['openCrate'] },
    ] }];
    const wires: Wire[] = [{ from: 'quests', to: 'rewards-seam', kind: 'leak', label: '30 symbols, 9 files' }];
    expect(legend(modulesPage({ rows, wires }))).toEqual(['seam', 'added', 'leak', 'follow-up', 'cycle', 'used outside']);
    expect(legend(modulesPage(spec()))).toEqual(['seam', 'bus']);
  });

  test('names are text, so generics and markup in them show as written', () => {
    const rows: Spec['rows'] = [{ modules: [{ id: 'web', name: 'Website <reads>', seam: ['getQuestLog<T>'] }] }];
    const wires: Wire[] = [{ from: 'web', to: 'web-seam', label: '</script><b>' }];
    const html = modulesPage({ rows, wires });
    expect(html).toContain('getQuestLog&lt;T&gt;');
    expect(html).toContain('Website &lt;reads&gt;');
    expect(html).not.toContain('</script><b>');
  });
});
