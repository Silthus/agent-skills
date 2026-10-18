const strokes = {
  call: { color: "#334155", width: 1.7 },
  bus: { color: "#475569", width: 1.5 },
  leak: { color: "#dc2626", width: 2.2 },
  added: { color: "#15803d", width: 2.2 },
  changed: { color: "#ca8a04", width: 2.2 },
  followUp: { color: "#ea580c", dash: "6 4", width: 2 },
  ask: { color: "#7c3aed", dash: "6 4", width: 2 },
  fork: { color: "#7c3aed", dash: "2 3", width: 2 },
  removed: { color: "#94a3b8", dash: "4 4", width: 1.6, cross: true, strike: true },
};

function strokeOf(wire, view) {
  if (wire.change === "removed" && view === "removed") return "removed";
  if (wire.q && view !== "today") return wire.fork ? "fork" : "ask";
  if (wire.followUp) return "followUp";
  if (wire.kind === "leak") return "leak";
  if (wire.change === "added" || wire.change === "changed") return wire.change;
  return wire.kind ?? "call";
}

function shownIn(wire, view) {
  if (wire.change === "added") return view !== "today";
  if (wire.change === "removed") return view !== "target";
  if (wire.change === "todayOnly") return view === "today";
  return true;
}

function anchorOf(element, side, at, root) {
  const box = element.getBoundingClientRect(), origin = root.getBoundingClientRect();
  const x = box.left - origin.left, y = box.top - origin.top, along = at ?? 0.5;
  if (side === "top") return { x: x + box.width * along, y, nx: 0, ny: -1 };
  if (side === "bottom") return { x: x + box.width * along, y: y + box.height, nx: 0, ny: 1 };
  if (side === "left") return { x, y: y + box.height * along, nx: -1, ny: 0 };
  return { x: x + box.width, y: y + box.height * along, nx: 1, ny: 0 };
}

function svgElement(name, attributes) {
  const element = document.createElementNS("http://www.w3.org/2000/svg", name);
  for (const [key, value] of Object.entries(attributes)) element.setAttribute(key, value);
  return element;
}

function drawLabel(svg, point, text, stroke, align) {
  const label = svgElement("text", { x: point.x, y: point.y, "text-anchor": align ?? "middle", "dominant-baseline": "middle", "font-size": "10", "font-weight": "600", fill: stroke.color });
  if (stroke.strike) label.setAttribute("text-decoration", "line-through");
  label.textContent = text;
  svg.appendChild(label);
  const box = label.getBBox();
  svg.insertBefore(svgElement("rect", { x: box.x - 3, y: box.y - 1, width: box.width + 6, height: box.height + 2, rx: 3, fill: "#ffffff", opacity: "0.95" }), label);
  return { text, box };
}

function drawCross(svg, at, name) {
  const radius = 7.5;
  svg.appendChild(svgElement("circle", { cx: at.x, cy: at.y, r: radius, fill: "#ffffff", stroke: "#64748b", "stroke-width": 1.5 }));
  svg.appendChild(svgElement("path", { d: `M${at.x - 3.5},${at.y - 3.5}L${at.x + 3.5},${at.y + 3.5}M${at.x + 3.5},${at.y - 3.5}L${at.x - 3.5},${at.y + 3.5}`, stroke: "#475569", "stroke-width": 2 }));
  return { text: `✕ on ${name}`, box: { x: at.x - radius, y: at.y - radius, width: radius * 2, height: radius * 2 } };
}

function apart(a, b) {
  return a.x + a.width < b.x || b.x + b.width < a.x || a.y + a.height < b.y || b.y + b.height < a.y;
}

function textBoxes(root) {
  const origin = root.getBoundingClientRect();
  return [...root.querySelectorAll(".seam, .name, .chip, .rail")].filter((element) => element.getClientRects().length).map((element) => {
    const box = element.getBoundingClientRect();
    return { text: element.innerText.replace(/\s+/g, " ").trim().slice(0, 40), box: { x: box.left - origin.left, y: box.top - origin.top, width: box.width, height: box.height } };
  });
}

function collisions(root, labels) {
  const hits = [];
  labels.forEach((a, i) => labels.slice(i + 1).forEach((b) => { if (!apart(a.box, b.box)) hits.push(`"${a.text}" overlaps "${b.text}"`); }));
  const boxes = textBoxes(root);
  for (const label of labels) for (const text of boxes) if (!apart(label.box, text.box)) hits.push(`"${label.text}" covers "${text.text}"`);
  const page = root.getBoundingClientRect();
  for (const { text, box } of labels) if (box.x < 0 || box.x + box.width > page.width) hits.push(`"${text}" runs off the page`);
  return hits;
}

function drawWire(svg, root, wire, view) {
  const from = root.querySelector(`[id="${wire.from}"]`), to = root.querySelector(`[id="${wire.to}"]`);
  if (!from?.getClientRects().length || !to?.getClientRects().length) return;
  const strokeName = strokeOf(wire, view), stroke = strokes[strokeName];
  const a = anchorOf(from, wire.fromSide ?? "bottom", wire.fromAt, root), z = anchorOf(to, wire.toSide ?? "top", wire.toAt, root), bend = wire.bend ?? 40;
  if (wire.straight === "from") z.x = a.x;
  if (wire.straight === "to") a.x = z.x;
  const c1 = { x: a.x + a.nx * bend, y: a.y + a.ny * bend }, c2 = { x: z.x + z.nx * bend, y: z.y + z.ny * bend };
  const path = svgElement("path", { d: `M${a.x},${a.y} C${c1.x},${c1.y} ${c2.x},${c2.y} ${z.x},${z.y}`, fill: "none", stroke: stroke.color, "stroke-width": stroke.width, "marker-end": `url(#arrow-${strokeName})` });
  if (stroke.dash) path.setAttribute("stroke-dasharray", stroke.dash);
  svg.appendChild(path);
  const pointAt = (t) => { const u = 1 - t; return { x: u * u * u * a.x + 3 * u * u * t * c1.x + 3 * u * t * t * c2.x + t * t * t * z.x, y: u * u * u * a.y + 3 * u * u * t * c1.y + 3 * u * t * t * c2.y + t * t * t * z.y }; };
  const labelAt = wire.labelAt ?? 0.5, [dx, dy] = wire.labelOffset ?? [0, 0];
  const marks = stroke.cross ? [drawCross(svg, pointAt(wire.crossAt ?? Math.min(labelAt + 0.25, 0.85)), wire.label ?? `${wire.from} → ${wire.to}`)] : [];
  const text = [view !== "today" && wire.q, (view === "today" && wire.todayLabel) || wire.label].filter(Boolean).join(": ");
  if (!text) return marks;
  const at = pointAt(labelAt);
  return [...marks, drawLabel(svg, { x: at.x + dx, y: at.y + dy }, text, stroke, wire.labelAlign)];
}

function drawWires(root, wires) {
  const svg = root.querySelector("svg.wires"), box = root.getBoundingClientRect(), view = root.dataset.view;
  svg.setAttribute("width", box.width);
  svg.setAttribute("height", box.height);
  svg.innerHTML = "<defs>" + Object.entries(strokes).map(([name, { color }]) => `<marker id="arrow-${name}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="${color}"/></marker>`).join("") + "</defs>";
  const labels = wires.filter((wire) => shownIn(wire, view)).flatMap((wire) => drawWire(svg, root, wire, view) ?? []);
  root.dataset.collisions = JSON.stringify(collisions(root, labels));
}

function connect(root, wires) {
  const redraw = () => drawWires(root, wires);
  redraw();
  new ResizeObserver(redraw).observe(root);
  for (const button of root.querySelectorAll("[data-view-to]")) button.addEventListener("click", () => {
    root.dataset.view = button.dataset.viewTo;
    for (const other of root.querySelectorAll("[data-view-to]")) other.setAttribute("aria-pressed", String(other === button));
    redraw();
  });
  const toggle = root.querySelector("[data-untouched-toggle]");
  toggle?.addEventListener("click", () => {
    const on = root.dataset.untouched !== "on";
    root.dataset.untouched = on ? "on" : "off";
    toggle.setAttribute("aria-pressed", String(on));
    redraw();
  });
}
