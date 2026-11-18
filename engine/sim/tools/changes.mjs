// Task 9 (after changes 1-7): per-persona numbers for a run folder, and a card-by-card dump of one persona.
// Usage:
//   node sim/tools/changes.mjs runs/<dir>              per-persona table (markdown)
//   node sim/tools/changes.mjs runs/<dir> cards <id>   every line of the first 4 sessions of persona <id>
//   node sim/tools/changes.mjs runs/<dir> week <id>    levels served per session in days 0-6 (x: missed, s: stretch)
//   node sim/tools/changes.mjs runs/c0 compare runs/c1  before → after per persona, seeds 1-3 (folders <prefix>-sN)
// The ladder level at the end of sessions 1 and 3 is replayed from the log: ladderAfterAnswer (up one after 2 right,
// down one after a miss) on cards whose reason is a ladder pick (open:liked, due-review, new:class-topic,
// new:exam-weight) in non-comeback sessions 1-3, reset to 1 when the session before had >= 3 cards and <= 2 right.
// It is an approximation (ramp cards and comfort-correction picks are not ladder picks and are left out).
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const dir = process.argv[2];
const dirRef = { d: dir };
const mode = process.argv[3] ?? "table";
const only = process.argv[4];
const LADDER = new Set(["open:liked", "due-review", "new:class-topic", "new:exam-weight"]);
const f2 = (x) => (x === null || x === undefined || Number.isNaN(x) ? "-" : x.toFixed(2));
const f1 = (x) => (x === null || x === undefined || Number.isNaN(x) ? "-" : x.toFixed(1));

function load(id) {
  const lines = readFileSync(join(dirRef.d, id + ".log.jsonl"), "utf8").trim().split("\n").map((l) => JSON.parse(l));
  const sum = JSON.parse(readFileSync(join(dirRef.d, id + ".summary.json"), "utf8"));
  return { lines, sum };
}

function ladderReplay(lines) {
  let lad = { level: 1, run: 0 };
  const out = {};
  let prev = null;
  for (let s = 1; s <= 3; s++) {
    const sl = lines.filter((l) => l.session === s);
    if (sl.length === 0) break;
    const start = sl.find((l) => l.kind === "start");
    if (prev && prev.cards >= 3 && prev.right <= 2) lad = { level: 1, run: 0 };
    if (!start?.comeback) for (const l of sl) {
      if (l.kind !== "card" || !LADDER.has(l.served.reason)) continue;
      if (!l.right) lad = { level: Math.max(1, lad.level - 1), run: 0 };
      else if (lad.run + 1 >= 2) lad = { level: Math.min(3, lad.level + 1), run: 0 };
      else lad = { level: lad.level, run: lad.run + 1 };
    }
    const end = sl.find((l) => l.kind === "end");
    prev = end ? end.end : null;
    out[s] = lad.level;
  }
  return out;
}

function stats(id) {
  const { lines, sum } = load(id);
  const starts = lines.filter((l) => l.kind === "start");
  const ends = lines.filter((l) => l.kind === "end" && l.end.kind !== "daily-cap");
  const cards = lines.filter((l) => l.kind === "card");
  const right = cards.filter((l) => l.right).length;
  const skips = lines.filter((l) => l.kind === "skip");
  const stretch = cards.filter((l) => l.served.reason === "stretch:up");
  const offers = lines.filter((l) => l.kind === "offer-extend");
  const extEnds = ends.filter((l) => l.end.kind === "extended-done");
  const lad = ladderReplay(lines);
  const p = sum.profileByDay.at(-1);
  const k = sum.knowledge;
  return {
    id, days: new Set(starts.map((l) => l.day)).size, quit: sum.quitAppDay, sess: ends.length,
    cps: ends.reduce((a, l) => a + l.end.cards, 0) / Math.max(1, ends.length),
    eps: ends.reduce((a, l) => a + l.end.effort, 0) / Math.max(1, ends.length),
    succ: right / Math.max(1, cards.length), k0: k.day0, k14: k.day14, kEnd: k.dayEnd, gain: k.dayEnd - k.day0,
    recap: ends.filter((l) => l.end.recap).length, badDay: ends.filter((l) => l.end.kind === "bad-day").length,
    left: ends.filter((l) => l.end.kind === "left").length,
    zero: ends.filter((l) => l.end.right === 0 && l.end.cards > 0).length,
    cardSkips: skips.filter((l) => l.scope === "card").length, sectionSkips: skips.filter((l) => l.scope !== "card").length,
    rejoins: lines.filter((l) => l.kind === "rejoin").length,
    stretchN: stretch.length, stretchR: stretch.filter((l) => l.right).length,
    offers: offers.length, taken: offers.filter((l) => l.accepted).length,
    extEff: extEnds.length ? extEnds.reduce((a, l) => a + l.end.effort, 0) / extEnds.length : null,
    lad1: lad[1], lad3: lad[3], prof: p, hidSt: sum.traits.stamina,
  };
}

const ids = mode === "compare" ? [] : readdirSync(dir).filter((f) => f.endsWith(".log.jsonl")).map((f) => f.replace(".log.jsonl", "")).sort();

if (mode === "compare") {
  // node sim/tools/changes.mjs <before-prefix> compare <after-prefix>: seeds 1-3 of each (prefix-s1 .. prefix-s3), per
  // persona "before → after" with the values of the three seeds separated by " / ".
  const before = dir, after = only;
  const seeds = [1, 2, 3];
  const statsIn = (prefix, s, id) => { const d = `${prefix}-s${s}`; const saved = dirRef.d; dirRef.d = d; const r = stats(id); dirRef.d = saved; return r; };
  const list = readdirSync(`${after}-s1`).filter((f) => f.endsWith(".log.jsonl")).map((f) => f.replace(".log.jsonl", "")).sort();
  const cols = [["quit day", (r) => r.quit ?? "-"], ["cards/s", (r) => f1(r.cps)], ["effort/s", (r) => f1(r.eps)],
    ["success", (r) => (100 * r.succ).toFixed(0) + "%"], ["gain", (r) => r.gain.toFixed(3)], ["bad-day ends", (r) => r.badDay],
    ["zero-right sessions", (r) => r.zero]];
  console.log(`| persona | ${cols.map((c) => c[0]).join(" | ")} |`);
  console.log(`|---|${cols.map(() => "---").join("|")}|`);
  for (const id of list) {
    const b = seeds.map((s) => statsIn(before, s, id)), a = seeds.map((s) => statsIn(after, s, id));
    console.log(`| ${id} | ${cols.map(([, fn]) => `${b.map(fn).join(" / ")} → ${a.map(fn).join(" / ")}`).join(" | ")} |`);
  }
} else if (mode === "table") {
  const rows = ids.map(stats);
  console.log("| persona | days | quit day | sess | cards/s | effort/s | success | k d0 → d14 → end | gain | recap | bad-day | left | zero-right | card skips | section skips | rejoins | stretch served/right | 5 more offered/taken | extended effort | ladder s1/s3 | end profile c / m / h3 / st | hidden st |");
  console.log("|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|");
  for (const r of rows) {
    const pr = r.prof;
    console.log(`| ${r.id} | ${r.days} | ${r.quit ?? "-"} | ${r.sess} | ${f1(r.cps)} | ${f1(r.eps)} | ${(100 * r.succ).toFixed(0)}% | ${f2(r.k0)} → ${f2(r.k14)} → ${f2(r.kEnd)} | ${r.gain >= 0 ? "+" : ""}${r.gain.toFixed(3)} | ${r.recap} | ${r.badDay} | ${r.left} | ${r.zero} | ${r.cardSkips} | ${r.sectionSkips} | ${r.rejoins} | ${r.stretchN}/${r.stretchR} | ${r.offers}/${r.taken} | ${f1(r.extEff)} | ${r.lad1 ?? "-"}/${r.lad3 ?? "-"} | ${f2(pr.comfort)} / ${f2(pr.memory)} / ${f2(pr.h3Share)} / ${f1(pr.stamina)} | ${r.hidSt} |`);
  }
} else if (mode === "cards") {
  const { lines } = load(only);
  for (const l of lines.filter((x) => x.session <= 4)) {
    const sv = l.served;
    const what = l.kind === "card" ? (l.choice === "dont-know" ? "I don't know" : l.right ? "right" : "wrong")
      : l.kind === "end" ? `${l.end.kind}, ${l.end.cards} cards, ${l.end.right} right, effort ${l.end.effort}${l.end.recap ? ", recap" : ""}`
      : l.kind === "start" ? `budget ${l.budget}${l.comeback ? ", comeback" : ""}`
      : l.kind === "quit" ? `quit (${l.quitReason})` : l.kind === "skip" ? `skip ${l.skipReason ?? ""} ${l.scope ?? ""}` : "";
    const card = sv ? `${sv.card} L${sv.height} [${sv.reason}] ${sv.skill}` : "";
    const kk = l.kind === "card" ? ` k ${f2(l.kBefore)}→${f2(l.kAfter)}` : "";
    console.log(`D${l.day} S${l.session} #${l.n} ${l.kind} ${card} ${what}${kk}`);
  }
} else if (mode === "week") {
  const { lines } = load(only);
  const bySess = new Map();
  for (const l of lines.filter((x) => x.day <= 6)) {
    if (!bySess.has(l.session)) bySess.set(l.session, { day: l.day, items: [] });
    if (l.kind === "card") bySess.get(l.session).items.push(`${l.served.height}${l.right ? "" : "x"}${l.served.reason === "stretch:up" ? "s" : ""}`);
    if (l.kind === "offer-extend") bySess.get(l.session).items.push(l.accepted ? "+5" : "-5");
  }
  for (const [s, v] of bySess) console.log(`D${v.day} S${s}: ${v.items.join(" ")}`);
}
