// Per-persona summary of a run folder (days, quit day, sessions, cards and effort per session, success, knowledge, final profile).
// Usage: node sim/tools/personas.mjs runs/<dir> [md]
// usage: node stats.mjs runs/dir
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
const dir = process.argv[2];
const files = readdirSync(dir).filter((f) => f.endsWith(".log.jsonl")).sort();
const rows = [];
let closeH = {1:[0,0],2:[0,0],3:[0,0]}, mec = 0, ends = {};
for (const f of files) {
  const id = f.replace(".log.jsonl", "");
  const lines = readFileSync(join(dir, f), "utf8").trim().split("\n").map((l) => JSON.parse(l));
  const sum = JSON.parse(readFileSync(join(dir, id + ".summary.json"), "utf8"));
  const days = new Set(lines.filter((l) => l.kind === "start").map((l) => l.day)).size;
  const endsL = lines.filter((l) => l.kind === "end" && l.end.kind !== "daily-cap");
  const sess = endsL.length;
  const cards = lines.filter((l) => l.kind === "card");
  const right = cards.filter((l) => l.right).length;
  const meanCards = endsL.reduce((a, l) => a + l.end.cards, 0) / Math.max(1, sess);
  const meanEff = endsL.reduce((a, l) => a + l.end.effort, 0) / Math.max(1, sess);
  const skips = lines.filter((l) => l.kind === "skip").length;
  const fat = new Set(lines.filter((l) => l.hiddenFatigued).map((l) => l.day)).size;
  const p = sum.profileByDay.at(-1);
  const ek = {}; for (const l of endsL) ek[l.end.kind] = (ek[l.end.kind] ?? 0) + 1;
  for (const l of cards) if (l.served.reason === "close:winnable") { closeH[l.served.height][1]++; if (l.right) closeH[l.served.height][0]++; }
  // maxExtraClose exhaustion: session in which 3 close cards answered and last not right
  const quits = lines.filter((l) => l.kind === "quit").map((l) => l.quitReason);
  const qr = {}; for (const q of quits) qr[q] = (qr[q] ?? 0) + 1;
  rows.push({ id, days, quit: sum.quitAppDay, sess, meanCards: meanCards.toFixed(1), meanEff: meanEff.toFixed(1),
    succ: (100 * right / Math.max(1, cards.length)).toFixed(0) + "%", k: `${sum.knowledge.day0.toFixed(3)}→${sum.knowledge.dayEnd.toFixed(3)}`,
    prof: `c${p.comfort.toFixed(2)} m${p.memory.toFixed(2)} h3 ${p.h3Share.toFixed(2)} st ${p.stamina.toFixed(1)}`, hidSt: sum.traits.stamina,
    CE: sum.contentExhausted, skips, fat, ends: JSON.stringify(ek), quits: JSON.stringify(qr) });
}
const md = process.argv[3] === "md";
if (md) {
  console.log("| persona | days | quit day | sess | cards/s | effort/s | success | k day0→end | final profile (comfort, memory, h3Share, stamina) | hidden stamina | fatigued days | CE | skips |");
  console.log("|---|---|---|---|---|---|---|---|---|---|---|---|---|");
  for (const r of rows) console.log(`| ${r.id} | ${r.days} | ${r.quit ?? "-"} | ${r.sess} | ${r.meanCards} | ${r.meanEff} | ${r.succ} | ${r.k} | ${r.prof} | ${r.hidSt} | ${r.fat} | ${r.CE} | ${r.skips} |`);
} else {
  for (const r of rows) console.log(`${r.id.padEnd(26)} d${String(r.days).padStart(3)} q${String(r.quit ?? "-").padStart(3)} s${String(r.sess).padStart(3)} c/s ${r.meanCards.padStart(4)} e/s ${r.meanEff.padStart(5)} ${r.succ.padStart(4)} k ${r.k} ${r.prof} hid ${r.hidSt} fat ${r.fat} CE ${r.CE} sk ${r.skips} ${r.ends} ${r.quits}`);
  console.log("close cards right by height:", JSON.stringify(closeH));
}
