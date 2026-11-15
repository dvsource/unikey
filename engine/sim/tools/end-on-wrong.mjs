// Classifies every engine-ended session that ended right after a wrong answer (the no-end-on-wrong check), and the close loop.
// Usage: node sim/tools/end-on-wrong.mjs runs/<dir> [show N sessions]
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
const dir = process.argv[2]; const show = Number(process.argv[3] ?? 0);
let n = 0, sessions = 0, withClose = 0, firstWrong = 0; const kinds = {}, byPersona = {}, lastHeight = {};
for (const f of readdirSync(dir).filter((x) => x.endsWith(".log.jsonl")).sort()) {
  const id = f.replace(".log.jsonl", "");
  const lines = readFileSync(join(dir, f), "utf8").trim().split("\n").map((l) => JSON.parse(l));
  let sess = [];
  for (const l of lines) {
    if (l.kind === "start") sess = [l]; else sess.push(l);
    // the same exclusions as the no-end-on-wrong check: the student's own ends and a start-time daily cap (0 cards)
    if (l.kind !== "end" || ["left", "interrupted"].includes(l.end.kind) || (l.end.kind === "daily-cap" && l.end.cards === 0)) continue;
    sessions++;
    const closes = sess.filter((x) => x.kind === "card" && x.served.reason === "close:winnable");
    if (closes.length) withClose++;
    if (closes.length && !closes[0].right) firstWrong++;
    const last = [...sess].reverse().find((x) => x.kind === "card" || x.kind === "skip");
    if (last?.kind !== "card" || last.right !== false) continue;
    n++;
    const key = `${l.end.kind}, ${closes.length} close cards, last ${last.served.reason}`;
    kinds[key] = (kinds[key] ?? 0) + 1;
    byPersona[id] = (byPersona[id] ?? 0) + 1;
    const hs = closes.map((c) => `h${c.served.height}`).join("+");
    lastHeight[hs] = (lastHeight[hs] ?? 0) + 1;
    if (n <= show) {
      console.log(`--- ${id} day ${l.day} session ${l.session} budget ${sess[0].budget}`);
      for (const x of sess.slice(1)) if (x.kind !== "moment") console.log(`  ${x.kind} ${x.served?.card ?? ""} h${x.served?.height ?? ""} ${x.served?.reason ?? ""} ${x.choice ?? ""} ${x.right ?? ""} ${x.end ? JSON.stringify(x.end) : ""}`);
    }
  }
}
console.log(JSON.stringify({ violations: n, engineEndedSessions: sessions, withCloseCard: withClose, firstCloseWrong: firstWrong, kinds, byPersona, closeHeights: lastHeight }));
