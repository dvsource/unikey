// Does one distracted (slow, not fatigued) answer shorten later sessions? Per persona: sessions with exactly one slow
// answer and no card past the hidden stamina, and how the engine's stamina moved across them (next start − this start).
// "slow" is approximated from the log as over 2× the median of the last 20 answer times at that height.
// Usage: node sim/tools/distraction.mjs runs/<dir>
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
const dir = process.argv[2];
const med = (xs) => { const s = xs.slice(-20).sort((a, b) => a - b); const m = s.length >> 1; return s.length < 5 ? null : s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
const all = { one: 0, down: 0, two: 0, twoDown: 0 };
for (const f of readdirSync(dir).filter((x) => x.endsWith(".log.jsonl")).sort()) {
  const L = readFileSync(join(dir, f), "utf8").trim().split("\n").map((l) => JSON.parse(l));
  const hist = { 1: [], 2: [], 3: [] }; const sess = [];
  let cur = null;
  for (const l of L) {
    if (l.kind === "start") { cur = { st: l.profile.stamina, slow: 0, fat: false }; sess.push(cur); }
    if (!cur) continue;
    if (l.hiddenFatigued) cur.fat = true;
    if (l.kind === "card") { const u = med(hist[l.served.height]); if (u !== null && l.ms > 2 * u) cur.slow++; hist[l.served.height].push(l.ms); }
  }
  let one = 0, down = 0, two = 0, twoDown = 0;
  for (let i = 0; i + 1 < sess.length; i++) {
    const s = sess[i]; if (s.fat) continue;
    const d = sess[i + 1].st - s.st;
    if (s.slow === 1) { one++; if (d < -1e-9) down++; }
    if (s.slow >= 2) { two++; if (d < -1e-9) twoDown++; }
  }
  all.one += one; all.down += down; all.two += two; all.twoDown += twoDown;
  console.log(f.replace(".log.jsonl", "").padEnd(26), `1 slow answer, not fatigued: ${one} sessions, stamina lowered after ${down}; ≥2 slow: ${two}, lowered ${twoDown}`);
}
console.log(JSON.stringify(all));
