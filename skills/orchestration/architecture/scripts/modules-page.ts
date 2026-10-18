import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

export type Change = 'added' | 'changed' | 'removed' | 'todayOnly';

type Decision = { q?: string; fork?: boolean };
type Marks = Decision & { change?: Change; followUp?: boolean };

export type SeamFunction = string | (Marks & { name: string });
export type Chip = Marks & { id?: string; text: string; cycle?: boolean; wide?: boolean };
export type Module = Marks & {
  id: string;
  name: string;
  note?: string;
  todayName?: string;
  used?: number;
  external?: boolean;
  flex?: number;
  seam: SeamFunction[];
  chips?: Chip[];
};
export type Bus = { id?: string; name: string; note?: string; cycles?: string[] };
export type Row = ({ modules: Module[] } | { bus: Bus }) & { gap?: number };
export type Untouched = { name: string; seam: string[]; used?: number; note?: string };

type Side = 'top' | 'bottom' | 'left' | 'right';
export type Wire = Decision & {
  from: string;
  to: string;
  kind?: 'call' | 'leak' | 'bus';
  change?: Change;
  followUp?: boolean;
  label?: string;
  todayLabel?: string;
  fromSide?: Side;
  fromAt?: number;
  toSide?: Side;
  toAt?: number;
  straight?: 'from' | 'to';
  bend?: number;
  labelAt?: number;
  labelOffset?: [number, number];
  labelAlign?: 'start' | 'middle' | 'end';
  crossAt?: number;
};
export type Spec = { rows: Row[]; wires: Wire[]; untouched?: Untouched[] };

const busOf = (row: Row): Bus | undefined => ('bus' in row ? row.bus : undefined);
const modulesOf = (row: Row): Module[] => ('modules' in row ? row.modules : []);
const busId = (bus: Bus) => bus.id ?? 'bus';
const seamId = (module: Module) => `${module.id}-seam`;

function elementIds(spec: Spec): string[] {
  return spec.rows.flatMap((row) => {
    const bus = busOf(row);
    if (bus) return [busId(bus)];
    return modulesOf(row).flatMap((module) => [
      module.id,
      ...(module.seam.length ? [seamId(module)] : []),
      ...(module.chips ?? []).flatMap((chip) => (chip.id ? [chip.id] : [])),
    ]);
  });
}

export function checkSpec(spec: Spec): string[] {
  const ids = elementIds(spec);
  const twice = [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))];
  const known = new Set(ids);
  const missing = spec.wires.flatMap((wire) =>
    [wire.from, wire.to].filter((end) => !known.has(end)).map((end) => `wire ${wire.from} → ${wire.to}: no element ${end}`),
  );
  return [...twice.map((id) => `id ${id} is used twice`), ...missing];
}

const asset = (name: string) => readFileSync(join(import.meta.dir, name), 'utf8');

const escape = (text: string) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const visibility: Record<Change, string> = { added: 'v-added', changed: '', removed: 'v-removed', todayOnly: 'v-today' };

function classes(...names: Array<string | false | undefined>): string {
  return names.filter(Boolean).join(' ');
}

function tags(marks: Marks): string {
  return (marks.followUp ? '<span class="f"></span>' : '') + (marks.q ? `<span class="q">${escape(marks.q)}</span>` : '');
}

function markClasses(marks: Marks): string[] {
  return [
    marks.change ? visibility[marks.change] : '',
    marks.change === 'added' ? 'new' : '',
    marks.change === 'changed' ? 'changed' : '',
    marks.followUp ? 'follow' : '',
    marks.q ? 'ask' : '',
    marks.q && marks.fork ? 'fork' : '',
  ];
}

const asMarks = (fn: SeamFunction): Marks & { name: string } => (typeof fn === 'string' ? { name: fn } : fn);

function seamBar(functions: string[], id?: string): string {
  const idAttribute = id ? ` id="${escape(id)}"` : '';
  return `<div class="seam"${idAttribute}><span class="tag">seam</span>${functions.join('')}</div>`;
}

function seamFunction(fn: SeamFunction): string {
  const marks = asMarks(fn);
  return `<span class="${classes('fn', ...markClasses(marks))}">${escape(marks.name)}${tags(marks)}</span>`;
}

function chip(chip: Chip): string {
  const id = chip.id ? ` id="${escape(chip.id)}"` : '';
  return `<span${id} class="${classes('chip', ...markClasses(chip), chip.cycle && 'cycle', chip.wide && 'wide')}">${escape(chip.text)}${tags(chip)}</span>`;
}

function moduleName(module: Module): string {
  const name = module.todayName
    ? `<span class="v-added">${escape(module.name)}</span><span class="v-today">${escape(module.todayName)}</span>`
    : escape(module.name);
  const note = module.note ? ` <small>${escape(module.note)}</small>` : '';
  const used = module.used === undefined ? '' : ` <span class="used">${module.used} used outside</span>`;
  return `<div class="name">${name}${note}${tags(module)}${used}</div>`;
}

function moduleFrame(module: Module): string {
  const seam = module.seam.length ? seamBar(module.seam.map(seamFunction), seamId(module)) : '';
  const chips = module.chips?.length ? `<div class="chips">${module.chips.map(chip).join('')}</div>` : '';
  const style = module.flex === undefined ? '' : ` style="flex:${module.flex}"`;
  return `<div id="${escape(module.id)}" class="${classes('mod', ...markClasses(module), module.external && 'external')}"${style}>${seam}${moduleName(module)}${chips}</div>`;
}

function busRail(bus: Bus): string {
  const note = bus.note ? `<span>${escape(bus.note)}</span>` : '';
  const cycles = (bus.cycles ?? []).map((cycle) => `<span class="cycle">${escape(cycle)}</span>`).join('');
  return `<div class="rail" id="${escape(busId(bus))}"><b>${escape(bus.name)}</b>${note}${cycles}</div>`;
}

function row(row: Row, index: number): string {
  const gap = index === 0 ? '' : `<div style="height:${row.gap ?? 56}px"></div>`;
  const bus = busOf(row);
  return gap + (bus ? busRail(bus) : `<div class="row">${modulesOf(row).map(moduleFrame).join('')}</div>`);
}

function untouchedCards(untouched: Untouched[]): string {
  const card = (module: Untouched) => {
    const facts = [module.used === undefined ? '' : `${module.used} used outside`, module.note ?? ''].filter(Boolean).join(' · ');
    return `<div class="mini">${seamBar(module.seam.map((fn) => `<span class="fn">${escape(fn)}</span>`))}<b>${escape(module.name)}</b><p>${escape(facts)}</p></div>`;
  };
  return `<div class="untouched"><h4>Untouched by this change. The top bar is the seam: its most used functions.</h4><div class="grid">${untouched.map(card).join('')}</div></div>`;
}

function everyMark(spec: Spec): Array<Marks & { cycle?: boolean }> {
  const modules = spec.rows.flatMap(modulesOf);
  return [
    ...modules,
    ...modules.flatMap((module) => [...module.seam.map(asMarks), ...(module.chips ?? [])]),
    ...spec.wires,
  ];
}

const changes = (spec: Spec) => new Set(everyMark(spec).map((marks) => marks.change));

function controls(spec: Spec): string {
  const viewed = ['added', 'removed', 'todayOnly'].some((change) => changes(spec).has(change as Change));
  const views = viewed
    ? `<div class="views" role="group" aria-label="View"><button data-view-to="target" aria-pressed="true">Target</button><button data-view-to="removed" aria-pressed="false">Target + what it removes</button><button data-view-to="today" aria-pressed="false">Today</button></div>`
    : '';
  const toggle = spec.untouched?.length ? '<button class="toggle" data-untouched-toggle aria-pressed="false">Untouched modules and their seams</button>' : '';
  return views || toggle ? `<div class="controls">${views}${toggle}</div>` : '';
}

const line = (color: string, style = 'solid') => `<i style="border-color:${color};border-top-style:${style}"></i>`;

function legend(spec: Spec): string {
  const marks = everyMark(spec);
  const has = (test: (marks: Marks & { cycle?: boolean }) => boolean) => marks.some(test);
  const wireKinds = new Set(spec.wires.map((wire) => wire.kind ?? 'call'));
  const modules = spec.rows.flatMap(modulesOf);
  const busCycles = spec.rows.some((row) => busOf(row)?.cycles?.length);
  const entries: Array<[boolean, string, string, string]> = [
    [true, 'seam', '<b class="swatch seamkey">fn</b>', "a module's interface; parts sit below it"],
    [spec.wires.some((wire) => (wire.kind ?? 'call') === 'call' && !wire.change && !wire.followUp && !wire.q), 'call', line('#334155'), 'through a seam'],
    [changes(spec).has('added'), 'added', line('#15803d'), 'by this change, green'],
    [changes(spec).has('changed'), 'changed', '<span class="swatch chip changed">part</span>', 'by this change'],
    [changes(spec).has('removed') || changes(spec).has('todayOnly'), 'removed', line('#94a3b8', 'dashed'), '✕ by this change, struck through'],
    [wireKinds.has('leak'), 'leak', line('#dc2626'), 'reaches past a seam, with measured counts'],
    [wireKinds.has('bus'), 'bus', line('#475569'), 'pub and sub on the rail'],
    [has((m) => !!m.followUp), 'follow-up', line('#ea580c', 'dashed'), 'the target needs it; a later refactor builds it'],
    [has((m) => !!m.q && !m.fork), 'Qn', line('#7c3aed', 'dashed'), 'a suggestion, open in question n'],
    [has((m) => !!m.q && !!m.fork), 'fork', line('#7c3aed', 'dotted'), 'alternatives, open in their question'],
    [has((m) => !!m.cycle) || busCycles, 'cycle', '<span class="swatch chip cycle"></span>', 'an import cycle'],
    [modules.some((module) => module.external), 'external', '<span class="swatch mod external">&nbsp;</span>', 'an actor or external system'],
    [modules.some((module) => module.used !== undefined) || !!spec.untouched?.some((module) => module.used !== undefined), 'used outside', '<span class="used">n</span>', 'exports other modules use'],
  ];
  return `<div class="legend">${entries.filter(([shown]) => shown).map(([, key, swatch, text]) => `<span>${swatch}<span class="key">${key}</span> ${text}</span>`).join('')}</div>`;
}

export function modulesPage(spec: Spec): string {
  const wires = JSON.stringify(spec.wires).replace(/</g, '\\u003c');
  return `<!doctype html><html><head><meta charset="utf-8"><style>${asset('modules-page.css')}</style></head><body>
<div class="panel" id="modules" data-view="target" data-untouched="off">
<svg class="wires"></svg>
${controls(spec)}${spec.rows.map(row).join('\n')}${spec.untouched?.length ? untouchedCards(spec.untouched) : ''}${legend(spec)}
</div>
<script>${asset('modules-page.wires.js')}
connect(document.getElementById("modules"), ${wires});
</script>
</body></html>
`;
}

if (import.meta.main) {
  const [specPath, outPath] = process.argv.slice(2);
  if (!specPath || !outPath) {
    console.error('usage: bun modules-page.ts <spec.json> <page.html>');
    process.exit(2);
  }
  const spec: Spec = JSON.parse(readFileSync(specPath, 'utf8'));
  const problems = checkSpec(spec);
  if (problems.length) {
    console.error(problems.join('\n'));
    process.exit(1);
  }
  writeFileSync(outPath, modulesPage(spec));
  console.log(`Wrote ${outPath}`);
}
