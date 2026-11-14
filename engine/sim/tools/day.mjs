// One day of one log, plus every serve of a section. Usage: node sim/tools/day.mjs runs/<dir>/<persona>.log.jsonl <day> [section substring]
// node day.mjs file.log.jsonl day [sectionSubstr]
import { readFileSync } from "node:fs";
const [f, d, sec] = process.argv.slice(2);
const L = readFileSync(f, "utf8").trim().split("\n").map((l) => JSON.parse(l));
if (sec) for (const l of L) if (l.served && l.served.section.includes(sec) && !(l.kind === "card" && l.served.reason.startsWith("open"))) console.log("S", l.day, l.session, l.kind, l.served.card, l.served.reason, l.right ?? "", l.remindDay ?? "", l.skipReason ?? "");
for (const l of L.filter((l) => String(l.day) === d)) console.log("   ", l.session, l.kind, l.served?.card ?? "", "h" + (l.served?.height ?? ""), l.served?.section ?? "", l.served?.reason ?? "", l.choice ?? "", l.right ?? "", l.budget ?? "", l.end ? JSON.stringify(l.end) : "", l.moment ? JSON.stringify(l.moment) : "", l.quitReason ?? "", l.comeback ?? "");
