import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { Board, Store, applyOps, brief, formatItem, next, parseFilter, parseLine, query, run } from "../src/core.ts";

const NOW = new Date("2026-11-23T10:00:00");
const tmpStore = () => new Store(fs.mkdtempSync(path.join(os.tmpdir(), "pm-test-")));
const board = (...lines: string[]) => new Board(lines.map((l) => parseLine(l)!));

test("parse and format round-trip every field", () => {
  const line = "- T42 ip p1 @viraj ^P3 #eng,app g:pre s:2026-11-20 d:2026-12-06 <T40,T41 ~T7 =B3 &docs/x.md &https://a.b/c zz:1 | Wire | resume";
  const it = parseLine(line)!;
  assert.equal(it.id, "T42");
  assert.equal(it.st, "ip");
  assert.equal(it.pri, 1);
  assert.equal(it.owner, "viraj");
  assert.equal(it.parent, "P3");
  assert.deepEqual(it.tags, ["eng", "app"]);
  assert.deepEqual(it.deps, ["T40", "T41"]);
  assert.deepEqual(it.refs, ["docs/x.md", "https://a.b/c"]);
  assert.deepEqual(it.extra, ["zz:1"]);
  assert.equal(it.title, "Wire | resume");
  assert.equal(`- ${formatItem(it)}`, line.replace("#eng,app", "#eng #app"));
  assert.equal(parseLine("# heading"), null);
  assert.equal(parseLine("- X1 td | bad kind"), null);
});

test("ops: add, set, removal tokens, auto dates, $n references", () => {
  const b = board("- P1 td | Root");
  const r = applyOps(b, ["+T ^P1 p1 #a d:+3d | First", "+S ^$1 <$1 | Child", "T1 ip -#a #b", "S1 dn -<T1"], "me", NOW);
  assert.deepEqual(r.errors, []);
  assert.deepEqual(r.ids, ["T1", "S1", "T1", "S1"]);
  const t1 = b.byId.get("T1")!, s1 = b.byId.get("S1")!;
  assert.equal(t1.due, "2026-11-26");
  assert.equal(t1.start, "2026-11-23"); // ip sets start
  assert.deepEqual(t1.tags, ["b"]);
  assert.equal(s1.parent, "T1");
  assert.deepEqual(s1.deps, []);
  assert.equal(s1.done, "2026-11-23"); // dn sets done
  assert.equal(r.log[0], "2026-11-23T10:00 me T1 + First");
  assert.equal(r.log[2], "2026-11-23T10:00 me T1 ip -#a #b");
});

test("ops: errors for unknown ids, bad tokens, missing title, dep cycles", () => {
  const b = board("- T1 td | a", "- T2 td <T1 | b");
  assert.match(applyOps(b, ["T9 dn"], "me").errors[0], /no T9/);
  assert.match(applyOps(b, ["T1 <T99"], "me").errors[0], /no T99/);
  assert.match(applyOps(b, ["T1 wat"], "me").errors[0], /bad token/);
  assert.match(applyOps(b, ["+T p1"], "me").errors[0], /title/);
  assert.match(applyOps(b, ["+Q | x"], "me").errors[0], /bad kind/);
  assert.match(applyOps(board("- T1 td | a", "- T2 td <T1 | b"), ["T1 <T2"], "me").errors[0], /cycle/);
});

test("store: batch write is atomic and logged", () => {
  const s = tmpStore();
  assert.equal(s.write(["+P | Root", "+T ^P1 | A", "+T ^P1 <T1 | B"], "me", NOW), "ok P1 T1 T2");
  assert.match(s.write(["T1 dn", "T7 dn"], "me", NOW), /^err 2: no T7/);
  assert.equal(s.load().byId.get("T1")!.st, "td"); // nothing applied
  assert.equal(s.readLog().length, 3);
  assert.equal(s.write(["T1 dn"], "me", NOW), "ok T1");
  assert.equal(s.readLog().at(-1), "2026-11-23T10:00 me T1 dn");
  assert.match(fs.readFileSync(s.itemsFile, "utf8"), /^- T1 dn \^P1 x:2026-11-23 \| A$/m);
});

test("relations: blocks inverse, descendants, ancestors, progress", () => {
  const b = board("- P1 td | Root", "- P2 td ^P1 | Sub", "- T1 dn ^P2 | a", "- T2 td ^P2 <T1 | b",
    "- S1 td ^T2 | c", "- T3 dr ^P2 | d", "- M1 td ^P1 | ms");
  assert.deepEqual(b.blocks.get("T1"), ["T2"]);
  assert.deepEqual(b.under("P1").map((i) => i.id), ["P2", "T1", "T2", "S1", "T3", "M1"]);
  assert.deepEqual(b.ancestors(b.byId.get("S1")!).map((i) => i.id), ["T2", "P2", "P1"]);
  assert.deepEqual(b.progress("P1"), [1, 3]); // milestones, projects and dropped excluded
  assert.deepEqual(board("- T1 td ^T9 | a").check(), ["T1: no T9"]);
});

test("ready, waiting and blocked", () => {
  const b = board("- T1 dn | done", "- T2 dr | dropped", "- T3 td <T1,T2 | ready", "- T4 td <T3 | waiting",
    "- T5 ip <T4 | blocked by dep", "- T6 bl | blocked", "- T7 oh | held", "- P1 td | proj");
  const ids = (f: string) => query(b, parseFilter([f])).map((i) => i.id);
  assert.deepEqual(ids("ready"), ["T3"]);
  assert.deepEqual(ids("waiting"), ["T4"]);
  assert.deepEqual(ids("blocked"), ["T5", "T6"]);
  assert.deepEqual(next(b, parseFilter([])).map((i) => i.id), ["T3"]);
});

test("filters: status, priority, kind, tag, project, owner, text, overdue, limit", () => {
  const b = board("- P1 td | Root", "- P2 td ^P1 | App", "- T1 ip p0 @viraj ^P2 #app d:2026-11-01 | Build APK",
    "- B1 td p1 ^P2 #app | Crash on start", "- T2 dn ^P1 | Old", "- T3 td p3 ^P1 #biz | Name");
  const ids = (...f: string[]) => query(b, parseFilter(f), "2026-11-23").map((i) => i.id);
  assert.deepEqual(ids("ip"), ["T1"]);
  assert.deepEqual(ids("p0", "p1"), ["T1", "B1"]);
  assert.deepEqual(ids("B"), ["B1"]);
  assert.deepEqual(ids("#app"), ["T1", "B1"]);
  assert.deepEqual(ids("^P2"), ["T1", "B1"]);
  assert.deepEqual(ids("@viraj"), ["T1"]);
  assert.deepEqual(ids("crash"), ["B1"]);
  assert.deepEqual(ids("overdue"), ["T1"]);
  assert.deepEqual(ids("dn"), ["T2"]); // explicit status includes closed items
  assert.equal(ids("all").length, 6);
  assert.equal(ids("n:1").length, 1);
});

test("run: brief and terse output", () => {
  const s = tmpStore();
  s.write(["+P | Root", "+T ^P1 p0 @me | Do it", "+T ^P1 <T1 | Then"], "x", NOW);
  const out = brief(s.load(), parseFilter(["@me"]), "2026-11-23");
  assert.match(out, /^pm 2026-11-23 items 3:/);
  assert.match(out, /@me \(1\):\n T1 td p0 @me \^P1 Do it/);
  assert.match(run(s, ["ls", "waiting"]), /^T2 td \^P1 <T1 Then$/);
  assert.match(run(s, ["show", "T1"]), /blocks: T2/);
  assert.equal(run(s, ["set", "T1", "dn"], undefined, "x"), "ok T1");
  assert.match(run(s, ["next"]), /^T2 td/);
  assert.match(run(s, ["nope"]), /^err unknown command/);
});
