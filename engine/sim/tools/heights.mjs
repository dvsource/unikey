// Per persona: heights served by reason group and by week, close-card accuracy by height, height-up moments.
// Usage: node sim/tools/heights.mjs runs/<dir> [persona]
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
const [dir, only] = process.argv.slice(2);
const tot = {};
for (const f of readdirSync(dir).filter((x) => x.endsWith(".log.jsonl")).sort()) {
  const id = f.replace(".log.jsonl", "");
  if (only && id !== only) continue;
  const L = readFileSync(join(dir, f), "utf8").trim().split("\n").map((l) => JSON.parse(l));
  const week = {}; const close = {}; let ups = 0;
  for (const l of L) {
    if (l.kind === "moment" && l.moment.type === "height-up") ups++;
    if (l.kind !== "card") continue;
    const w = `w${Math.floor(l.day / 7) + 1}`; week[w] = week[w] ?? { 1: 0, 2: 0, 3: 0 }; week[w][l.served.height]++;
    if (l.served.reason === "close:winnable") {
      const k = `h${l.served.height}`; close[k] = close[k] ?? [0, 0]; close[k][1]++; if (l.right) close[k][0]++;
      tot[k] = tot[k] ?? [0, 0]; tot[k][1]++; if (l.right) tot[k][0]++;
    }
  }
  console.log(id.padEnd(26), "cards by week h1/h2/h3", Object.entries(week).map(([w, v]) => `${w} ${v[1]}/${v[2]}/${v[3]}`).join(" "), "| close right/served", JSON.stringify(close), "| height-up moments", ups);
}
console.log("close right/served by height, all personas", JSON.stringify(tot));
