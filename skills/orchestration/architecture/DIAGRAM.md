# The module page

The diagram for rungs 1 and 2 is one self-contained HTML page: modules as frames, each with its seam as a dark top bar, and wires drawn between them by a small script. You write a JSON spec; `scripts/modules-page.ts` checks it and writes the page. `example/modules.json` is a complete rung 2 spec with leaks, removed parts, a follow-up module, a bus and untouched modules; start from a copy of it.

```bash
bun <this skill's directory>/scripts/modules-page.ts spec.json modules.html
bun <this skill's directory>/scripts/screenshot.ts modules.html
```

`modules-page.ts` stops and names each wire end that has no element and each id used twice. `screenshot.ts` writes one PNG per view beside the page (`modules-target.png`, `modules-removed.png`, `modules-today.png`, and `modules-untouched.png` with the untouched modules shown, or `modules.png` for a page without views), and prints every wire label that overlaps another label, covers a seam bar, a name, a chip or the bus, or runs off the page. `--width` sets the page width in CSS pixels: 1100 by default for a PNG, 728 for the T3 reply column. It finds Chromium in the Playwright cache, or takes `--browser <executable>`. When there is none, install it with `bunx playwright install chromium-headless-shell`. Bun fetches `playwright-core` on the first run when the skill's directory has no `node_modules`, which needs network access once.

## What the page draws

- **A module** is a bordered frame. Its top bar is its **seam**: its interface functions in a monospace font on a dark background. Its implementation parts are **chips** inside it. A wire that ends on the seam bar goes through the seam; a wire that ends on a chip reaches past it.
- **Leaks** are red wires labelled with measured counts, such as `30 symbols, 9 files`. Each frame shows its import surface, `61 used outside`. An import cycle is a red dashed chip marked ↺.
- **The bus** is a full-width dark rail between module rows. Publishers and subscribers attach to it with short vertical `pub X` and `sub X` wires.
- **Fill is the change**: green is added by this change, yellow is changed. An orange dashed frame or chip with a `follow-up` tag is part of the target that a later refactor builds.
- **Views**: Target, Target + what it removes, and Today. In the middle view the removed chips, seam functions and wires stay in place, grey, dashed and struck through, with a ✕ on each removed wire. A toggle shows the untouched modules as mini cards: their top functions as the seam bar, their import surface, and their bus events.
- **Decisions**: a part with `q` gets a purple dashed outline and its question tag, such as `Q2`. A part with `q` and `fork: true` is an alternative with a dotted outline; set its `q` to `Q3 A` or `Q3 B`. Today draws everything as it is, without its question, so give a suggested part or alternative that does not exist yet `change: 'added'` to keep it out of Today.

The legend lists only the marks the page uses, and the view buttons appear only when the spec adds or removes something.

## The spec

```ts
type Spec = { rows: Row[]; wires: Wire[]; untouched?: Untouched[] };
type Row = ({ modules: Module[] } | { bus: { id?: string; name: string; note?: string; cycles?: string[] } }) & { gap?: number };
type Module = Marks & { id: string; name: string; note?: string; todayName?: string; used?: number; external?: boolean; flex?: number; seam: Array<string | Marks & { name: string }>; chips?: Chip[] };
type Chip = Marks & { id?: string; text: string; cycle?: boolean; wide?: boolean };
type Marks = { change?: 'added' | 'changed' | 'removed' | 'todayOnly'; followUp?: boolean; q?: string; fork?: boolean };
type Untouched = { name: string; seam: string[]; used?: number; note?: string };
```

- A wire end is a module `id`, its seam bar `<id>-seam`, a chip `id`, or the bus id (`bus` unless set).
- `change: 'removed'` is drawn today, struck through in the middle view, and gone from the target. `todayOnly` is drawn only in Today, for a part the struck-through view would only clutter. `todayName` names a module as it is called today.
- `external: true` draws an actor or an external system as a blue frame. A module with no seam functions has no bar: use that for actors in rung 1.
- `flex` sets a frame's width in its row (default 1); `gap` sets the space above a row in pixels (default 56).
- `untouched` fills the toggle. Put a card's bus events in its `note`, such as `pub coinsSpent`. Leave `untouched` out and the toggle goes away.

A wire takes `from`, `to`, an optional `kind` (`call` by default, `leak`, or `bus`), the same `change`, `followUp`, `q` and `fork` as a part, a `label`, and a `todayLabel` for Today when the count reads differently there. The layout options:

- `fromSide` and `toSide` (`top`, `bottom`, `left`, `right`; default bottom to top) and `fromAt` and `toAt` (0 to 1 along that side) place the ends.
- `straight: 'from'` or `'to'` lines the other end up with that one. Use it for every bus wire, so it drops straight onto the rail.
- `bend` is how far the curve leaves each end (default 40).
- `labelAt` (0 to 1 along the wire), `labelOffset` (`[x, y]` pixels) and `labelAlign` (`start`, `middle`, `end`) place the label. `crossAt` places the ✕ on a removed wire.

## Layout

The rows are placed by hand, so you choose which modules sit next to each other. Put callers above the modules they call, and the bus between the rows that publish and subscribe. Then render at each width you will post at, read every view's PNG, and move labels until `screenshot.ts` reports no collisions and each label sits beside its own wire; the check misses a label that sits on another wire, so look for that. Frames move between views and widths, since hidden parts free up space and narrow rows wrap, so a label that fits in Target at 1100 can collide in Today at 728. Short labels move least: put the counts on the wire and the explanation in the round.

## Mermaid fallback

Only when the page cannot be rendered outside T3 (no Chromium, or no network for the first `playwright-core` fetch), draw rungs 1 and 2 as a Mermaid `flowchart` with one `subgraph` per module, its seam functions in the subgraph title. Mark each node with two classes in two statements, `class Api new` and `class Api suggested`: Mermaid reads `class Api new,suggested` as one class name and styles nothing. Use these classes, and a `Legend` subgraph that shows each one the diagram uses:

```mermaid
flowchart LR
  classDef new fill:#dcfce7
  classDef changed fill:#fef9c3
  classDef removed fill:#f8fafc,stroke-dasharray:4 4,color:#94a3b8
  classDef followUp stroke:#ea580c,stroke-dasharray:6 4
  classDef suggested stroke:#7c3aed,stroke-dasharray:6 4,stroke-width:2px
  classDef fork stroke:#7c3aed,stroke-dasharray:2 3,stroke-width:2px
```

Draw a leak as a red edge with its counts, `A -- "30 symbols, 9 files" --> B` plus `linkStyle <n> stroke:#dc2626`, and a suggested or alternative edge as `-. "Q3 A: calls" .->`.
