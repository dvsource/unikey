// Figure engines for F44 templates (spec §4.5). A port of `draw()` in
// content/samples/mechanics-20/validate.py, so the app draws every variant
// exactly as the review doc does. Engines are shared and reviewed once.

type P = Record<string, number>;

// At most 3 significant figures, trailing zeros dropped (validate.py N()).
function N(x: number) {
  if (x === 0) return "0";
  const digits = 2 - Math.floor(Math.log10(Math.abs(x)));
  const r = Math.round(x * 10 ** digits) / 10 ** digits;
  return String(Number(r.toFixed(Math.max(0, digits))));
}

const ink = "#222";
const line = "#1a5fb4";

function axes(xlabel: string, ylabel: string, w = 240, h = 160) {
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" font-family="sans-serif" font-size="11">` +
    `<rect width="${w}" height="${h}" fill="white"/><line x1="35" y1="130" x2="225" y2="130" stroke="${ink}"/><line x1="35" y1="130" x2="35" y2="10" stroke="${ink}"/>` +
    `<text x="196" y="124" fill="${ink}">${xlabel}</text><text x="42" y="16" fill="${ink}">${ylabel}</text>`
  );
}
const tickX = (x: number, label: number) =>
  `<line x1="${x}" y1="130" x2="${x}" y2="134" stroke="${ink}"/><text x="${x - 3}" y="146" fill="${ink}">${N(label)}</text>`;
const tickY = (y: number, label: number) =>
  `<line x1="31" y1="${y}" x2="35" y2="${y}" stroke="${ink}"/><text x="12" y="${y + 4}" fill="${ink}">${N(label)}</text>`;
const f1 = (n: number) => n.toFixed(1);

const engines: Record<string, (p: P) => string> = {
  "vt-steps": (p) => {
    const total = p.t1 + p.t2;
    const x = (t: number) => 35 + (150 * t) / total;
    const y = (v: number) => 130 - (100 * v) / p.v1;
    const path = `${f1(x(0))},${f1(y(p.v1))} ${f1(x(p.t1))},${f1(y(p.v1))} ${f1(x(p.t1))},${f1(y(p.v2))} ${f1(x(total))},${f1(y(p.v2))}`;
    const ticks = tickX(Math.round(x(p.t1)), p.t1) + tickX(Math.round(x(total)), total) + tickY(Math.round(y(p.v1)), p.v1) + tickY(Math.round(y(p.v2)), p.v2);
    return axes("t / s", "v / m s⁻¹") + ticks + `<polyline points="${path}" fill="none" stroke="${line}" stroke-width="2"/></svg>`;
  },
  "ft-ramp": (p) => {
    const total = p.t1 + p.t2;
    const x = (t: number) => 35 + (150 * t) / total;
    const path = `35,130 ${f1(x(p.t1))},30 ${f1(x(total))},30`;
    const ticks = tickX(Math.round(x(p.t1)), p.t1) + tickX(Math.round(x(total)), total) + tickY(30, p.F);
    return axes("t / s", "F / N") + ticks + `<polyline points="${path}" fill="none" stroke="${line}" stroke-width="2"/></svg>`;
  },
  beam: (p) => {
    const x = (s: number) => 30 + (200 * s) / p.L;
    const px = f1(x(p.d));
    const mid = f1((30 + x(p.d)) / 2 - 8);
    return (
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 120" width="260" height="120" font-family="sans-serif" font-size="11"><rect width="260" height="120" fill="white"/>` +
      `<rect x="30" y="60" width="200" height="10" fill="#ddd" stroke="${ink}"/><path d="M30 70L22 90H38z" fill="#888"/><path d="M230 70L222 90H238z" fill="#888"/>` +
      `<text x="10" y="84" fill="${ink}">P</text><text x="242" y="84" fill="${ink}">Q</text>` +
      `<circle cx="${px}" cy="32" r="5" fill="${line}"/><line x1="${px}" y1="37" x2="${px}" y2="60" stroke="${line}" stroke-width="3"/>` +
      `<line x1="30" y1="112" x2="${px}" y2="112" stroke="${ink}"/><text x="${mid}" y="107" fill="${ink}">${N(p.d)} m</text>` +
      `<text x="108" y="16" fill="${ink}">L = ${N(p.L)} m</text></svg>`
    );
  },
};

export function figureSvg(fig: { svg?: string; engine?: string; params?: P } | null | undefined): string | null {
  if (!fig) return null;
  if (fig.svg) return fig.svg;
  const engine = fig.engine && engines[fig.engine];
  if (!engine || !fig.params) return null;
  return engine(fig.params);
}
