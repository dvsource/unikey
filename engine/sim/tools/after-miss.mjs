// Final review F8 (after changes 1-7): what follows a miss, beyond what the repair-steps-down check sees.
// Usage: node sim/tools/after-miss.mjs runs/<dir> [show N]
//   sameSkillNext: misses (wrong or "I don't know") whose next answered card in the session (skips are not answers) is
//                  on the same skill at or above the missed level, any reason; byReason splits them by that card's
//                  reason and the missed level (a level-1 miss may get a level-1 missing-piece card on another card of
//                  its skill, by design).
//   returns:       repair:return cards; early = fewer than 4 other cards (answered or skipped) between the last miss on
//                  its skill in the session and the return; right rate for early and on-time returns.
//   recaps:        recap ends; how many have an empty fixedSkills list, and how many of those had a skill answered
//                  right in the session (from the log, so it works on runs from before EndInfo.rightSkills existed).
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const dir = process.argv[2];
const show = Number(process.argv[3] ?? 0);
const AFTER = 4;
const out = {
  misses: 0, sameSkillNext: 0, byReason: {},
  returns: 0, early: 0, earlyRight: 0, onTime: 0, onTimeRight: 0,
  recaps: 0, recapEmptyFixed: 0, recapEmptyFixedRightToday: 0,
};
let shown = 0;
for (const f of readdirSync(dir).filter((x) => x.endsWith(".log.jsonl")).sort()) {
  const id = f.replace(".log.jsonl", "");
  const lines = readFileSync(join(dir, f), "utf8").trim().split("\n").map((l) => JSON.parse(l));
  let sess = [];
  const flush = () => {
    const items = sess.filter((x) => x.kind === "card" || x.kind === "skip");
    const answered = items.filter((x) => x.kind === "card");
    answered.forEach((c, i) => {
      if (c.right !== false) return;
      out.misses++;
      const nx = answered[i + 1];
      if (nx && nx.served.skill === c.served.skill && nx.served.height >= c.served.height) {
        out.sameSkillNext++;
        const k = `${nx.served.reason}@missed-h${c.served.height}`;
        out.byReason[k] = (out.byReason[k] ?? 0) + 1;
      }
    });
    items.forEach((c, i) => {
      if (c.kind !== "card" || c.served.reason !== "repair:return") return;
      let m = i - 1;
      while (m >= 0 && !(items[m].kind === "card" && items[m].served.skill === c.served.skill && items[m].right === false)) m--;
      const between = m < 0 ? Infinity : i - m - 1;
      out.returns++;
      if (between < AFTER) {
        out.early++;
        if (c.right) out.earlyRight++;
        if (shown < show) {
          shown++;
          console.log(`--- ${id} day ${c.day} session ${c.session}: return #${c.n} after ${between} other cards`);
          for (const x of items.slice(Math.max(0, m), i + 1)) console.log(`  #${x.n} ${x.kind} ${x.served.skill} h${x.served.height} ${x.served.reason} ${x.right ?? ""}`);
        }
      } else {
        out.onTime++;
        if (c.right) out.onTimeRight++;
      }
    });
    const end = sess.find((x) => x.kind === "end");
    if (end?.end.recap) {
      out.recaps++;
      if (end.end.fixedSkills.length === 0) {
        out.recapEmptyFixed++;
        if (answered.some((c) => c.right === true)) out.recapEmptyFixedRightToday++;
      }
    }
  };
  for (const l of lines) {
    if (l.kind === "start") {
      if (sess.length) flush();
      sess = [l];
    } else sess.push(l);
  }
  if (sess.length) flush();
}
const pct = (a, b) => (b ? `${Math.round((100 * a) / b)}%` : "-");
console.log(JSON.stringify({
  ...out, earlyShare: pct(out.early, out.returns), earlyRightRate: pct(out.earlyRight, out.early), onTimeRightRate: pct(out.onTimeRight, out.onTime),
}));
