// The pm web app (T125) and the engine playground (T126): pages, the read-only tracker, and the playground API on the
// real engine.
import { test, after } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import type { AddressInfo } from "node:net";
import { Store } from "../src/core.ts";
import { PAGES, serve, loadPlayground } from "../src/serve.ts";

const dir = fs.mkdtempSync(path.join(os.tmpdir(), "pm-serve-"));
fs.writeFileSync(path.join(dir, "items.md"), "- P1 td | Root || why\n");
const store = new Store(dir);
const server = serve(store, 0, { quiet: true });
await new Promise((ok) => server.once("listening", ok));
const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
after(() => new Promise((ok) => server.close(ok)));

const run = (sc: unknown) => fetch(`${base}/api/engine/run`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(sc) });
const snapshot = () => fs.readdirSync(dir).map((f) => f + ":" + fs.readFileSync(path.join(dir, f), "utf8")).join("\n");

test("every page is served with the site nav; the index links them all", async () => {
  const home = await (await fetch(base + "/")).text();
  for (const p of PAGES) {
    assert.ok(home.includes(`href="${p.path}"`), p.path);
    const r = await fetch(base + p.path);
    assert.equal(r.status, 200);
    const html = await r.text();
    assert.ok(html.includes('<nav class="site">') && html.includes(`href="${p.path}" class="on"`), `${p.path} has the nav, itself current`);
    assert.ok(!html.includes("<!--site-nav-->"));
  }
  assert.equal((await fetch(base + "/site.css")).status, 200);
  assert.equal((await fetch(base + "/nope")).status, 404);
});

test("the tracker stays read-only: only GET, and the playground never writes its data", async () => {
  const before = snapshot();
  for (const p of ["/data", "/tracker", "/", "/repo/pm/README.md"]) {
    assert.equal((await fetch(base + p, { method: "POST", body: "x" })).status, 405, p);
    assert.equal((await fetch(base + p, { method: "PUT", body: "x" })).status, 405, p);
  }
  const board = await (await fetch(base + "/data")).json() as { items: { id: string }[] };
  assert.deepEqual(board.items.map((i) => i.id), ["P1"]);
  assert.equal((await run({ pack: "mechanics-20-v2", seed: 1, deflt: "good", days: [[{ kind: "grade", grade: "again" }]] })).status, 200);
  assert.equal((await fetch(base + "/api/engine/run", { method: "DELETE" })).status, 405);
  assert.equal(snapshot(), before);
});

test("playground: today plus 6 days from the real engine, every card with a why; the same scenario gives the same answer", async () => {
  const sc = { pack: "mechanics-20-v2", seed: 3, deflt: "good", days: [[{ kind: "grade", grade: "good" }, { kind: "grade", grade: "hard" }]] };
  const a = await (await run(sc)).json();
  const b = await (await run(sc)).json();
  assert.deepEqual(a, b);
  assert.equal(a.today, 0);
  assert.equal(a.days.length, 7);
  const today = a.days[0];
  assert.deepEqual(today.rows.slice(0, 2).map((r: { source: string; did: string }) => [r.source, r.did]), [["you", "good"], ["you", "hard"]]);
  assert.equal(today.rows[2].open, true);
  assert.equal(today.pending, "card");
  for (const d of a.days) {
    assert.ok(d.end, `day ${d.day} ends`);
    for (const r of d.rows) assert.ok(r.why && r.why.length > 3, `${r.card} has a why`);
  }
  for (const d of a.days.slice(1)) for (const r of d.rows) assert.equal(r.source, "forecast");
});

test("playground: a grade changes the forecast; next day freezes today with the default", async () => {
  const good = await (await run({ pack: "mechanics-20-v2", seed: 1, deflt: "good", days: [[]] })).json();
  const again = await (await run({ pack: "mechanics-20-v2", seed: 1, deflt: "good", days: [[{ kind: "grade", grade: "again" }]] })).json();
  const cards = (r: { days: { rows: { card: string }[] }[] }) => r.days.map((d) => d.rows.map((x) => x.card).join(","));
  assert.notDeepEqual(cards(good), cards(again));
  // Next day: day 0 is played with its acts and the default; day 1 is today
  const next = await (await run({ pack: "mechanics-20-v2", seed: 1, deflt: "good", days: [[{ kind: "grade", grade: "again" }, { kind: "finish", with: "good" }], []] })).json();
  assert.equal(next.today, 1);
  assert.equal(next.days.length, 8);
  assert.equal(next.days[0].rows[0].source, "you");
  assert.ok(next.days[0].rows.slice(1).every((r: { source: string }) => r.source === "default"));
  // the past day as played equals the forecast it had (same default)
  assert.deepEqual(next.days[0].rows.map((r: { card: string }) => r.card), again.days[0].rows.map((r: { card: string }) => r.card));
  assert.deepEqual(next.days[1].rows.map((r: { card: string }) => r.card), again.days[1].rows.map((r: { card: string }) => r.card));
});

test("playground: a simulator persona as the default; bad scenarios are a 400", async () => {
  const p = await run({ pack: "thermal-physics-20-v2", seed: 2, deflt: "persona:weak-impatient", days: [[]] });
  assert.equal(p.status, 200);
  const j = await p.json();
  assert.ok(j.days.some((d: { rows: { did: string }[] }) => d.rows.some((r) => r.did === "again")));
  for (const bad of [
    { pack: "nope", seed: 1, deflt: "good", days: [[]] },
    { pack: "mechanics-20-v2", seed: 1, deflt: "meh", days: [[]] },
    { pack: "mechanics-20-v2", seed: 1, deflt: "good", days: [] },
    { pack: "mechanics-20-v2", seed: 1, deflt: "good", days: [[{ kind: "grade", grade: "great" }]] },
    { pack: "mechanics-20-v2", seed: 1, deflt: "good", days: [[], []] }, // a past day must end with finish
  ]) assert.equal((await run(bad)).status, 400, JSON.stringify(bad));
  const notJson = await fetch(`${base}/api/engine/run`, { method: "POST", headers: { "content-type": "application/json" }, body: "{" });
  assert.equal(notJson.status, 400);
});

test("playground: the packs, personas and a card's question and answer", async () => {
  const m = await (await fetch(base + "/api/engine/packs")).json();
  assert.ok(m.packs.some((p: { id: string; unit: string }) => p.id === "mechanics-20-v2" && p.unit === "Mechanics"));
  assert.ok(m.personas.some((p: { id: string; grading: string }) => p.id === "confident-misconceptions" && p.grading === "over"));
  const c = await (await fetch(base + "/api/engine/card?pack=mechanics-20-v2&id=phy.mech.c001&variant=0")).json();
  assert.ok(c.variant.stem.en && c.variant.options.some((o: { correct: boolean }) => o.correct));
  assert.equal((await fetch(base + "/api/engine/card?pack=mechanics-20-v2&id=nope")).status, 400);
  assert.equal(typeof (await loadPlayground()).run, "function");
});
