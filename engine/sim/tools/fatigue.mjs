// Per persona: days with a card past the hidden stamina, by the reason of those cards; and slow answers when fatigued or not.
// Usage: node sim/tools/fatigue.mjs runs/<dir>
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
const dir = process.argv[2];
const med = (xs) => { const s = xs.slice(-20).sort((a, b) => a - b); const m = s.length >> 1; return s.length < 5 ? null : s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
for (const f of readdirSync(dir).filter((x) => x.endsWith(".log.jsonl")).sort()) {
  const L = readFileSync(join(dir, f), "utf8").trim().split("\n").map((l) => JSON.parse(l));
  const hist = { 1: [], 2: [], 3: [] }; const why = {}; const days = new Set(); let sf = 0, fc = 0, snf = 0, nf = 0;
  for (const l of L) {
    if (["card", "skip", "quit"].includes(l.kind) && l.served && l.hiddenFatigued) { const k = l.served.reason.split(":")[0]; why[k] = (why[k] ?? 0) + 1; days.add(l.day); }
    if (l.kind === "card") {
      const u = med(hist[l.served.height]); const slow = u !== null && l.ms > 2 * u;
      if (l.hiddenFatigued) { fc++; if (slow) sf++; } else { nf++; if (slow) snf++; }
      hist[l.served.height].push(l.ms);
    }
  }
  const played = new Set(L.filter((l) => l.kind === "start").map((l) => l.day)).size;
  console.log(f.replace(".log.jsonl", "").padEnd(26), `fatigued days ${days.size}/${played}`, JSON.stringify(why), `slow|fatigued ${sf}/${fc}`, `slow|not fatigued ${snf}/${nf}`);
}
