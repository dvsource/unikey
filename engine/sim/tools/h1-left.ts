// Per persona: height-2 close cards, and how many height-1 cards were unseen in the last 14 days when each was served.
// Usage: npx tsx sim/tools/h1-left.ts runs/<dir>
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { loadFromRepo } from "../../src/node/load.js";
const c = loadFromRepo(resolve(dirname(fileURLToPath(import.meta.url)), "../../.."));
const h1 = Object.values(c.cards).filter((x) => x.height === 1 && c.skills[x.skill]).map((x) => x.id);
const dir = process.argv[2];
let tot = { h2close: 0, h2closeWithH1Left: 0, h1leftAtH2close: [] as number[] };
for (const f of readdirSync(dir).filter((f) => f.endsWith(".log.jsonl")).sort()) {
  const L = readFileSync(join(dir, f), "utf8").trim().split("\n").map((l) => JSON.parse(l));
  const last = new Map<string, number>();
  let n2 = 0, n2l = 0; const lefts: number[] = [];
  for (const l of L) {
    if (!l.served || !["card", "skip", "quit"].includes(l.kind)) continue;
    if (l.kind === "card" && l.served.reason === "close:winnable" && l.served.height === 2) {
      const left = h1.filter((id) => !(last.has(id) && l.day - last.get(id)! < 14)).length;
      n2++; if (left > 0) n2l++; lefts.push(left);
    }
    last.set(l.served.card, l.day);
  }
  tot.h2close += n2; tot.h2closeWithH1Left += n2l;
  const used = h1.filter((id) => last.has(id)).length;
  console.log(f.replace(".log.jsonl", "").padEnd(26), `h2 close ${n2}, with some h1 unseen in 14d ${n2l}, median h1 left ${lefts.sort((a, b) => a - b)[lefts.length >> 1] ?? "-"}, distinct h1 ever served ${used}/${h1.length}`);
}
console.log(JSON.stringify(tot));
