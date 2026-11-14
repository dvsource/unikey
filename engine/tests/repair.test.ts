import { test, expect } from "vitest";
import { dayOf } from "../src/time.js";
import { answer, startSession } from "../src/session.js";
import { nextRepairCard } from "../src/repair.js";
import { defaultConfig as cfg } from "../src/config.js";
import type { Served } from "../src/types.js";
import type { Content, SkillRec, State, Step } from "../src/types.js";
import { fixture } from "./fixture.js";
import { T0, atts, choiceFor, rec, run, section, served, startedState, withProfile } from "./helpers.js";

const C = fixture();
const D0 = dayOf(T0);

/** `lead` at height 3 and sure to be served first (section A liked most); b1, b2 started at height 2. */
function leadState(lead: "a1" | "a2", stamina = 30): State {
  const skills: Record<string, SkillRec> = {
    [lead]: rec(3, atts(3, 10, 0, D0 - 2), { nextReviewDay: D0 + 20 }),
    b1: rec(2, atts(2, 3, 0, D0 - 2), { nextReviewDay: D0 + 20, noFullUntilDay: D0 + 20 }),
    b2: rec(2, atts(2, 3, 0, D0 - 2), { nextReviewDay: D0 + 20, noFullUntilDay: D0 + 20 }),
  };
  const s = startedState(skills, { sections: { "u.t1/A": section({ liking: 2 }), "u.t1/B": section() } });
  return withProfile(s, { stamina });
}

function card(st: Step): Served {
  if (st.next.kind !== "card") throw new Error(`expected a card, got ${st.next.kind}`);
  return st.next.card;
}
const say = (content: Content, st: Step, choice: number | "dont-know", now: number) =>
  answer(st.state, content, { card: card(st).card, choice, ms: 8000 }, now);
const right = (content: Content, st: Step, now: number) => say(content, st, choiceFor(content, card(st), "r"), now);
const wrong = (content: Content, st: Step, now: number) => say(content, st, choiceFor(content, card(st), "w"), now);

test("wrong on a1.h3 picking option 1 (sign-error) → next is a1.h1.2 repair:missing-piece → then a1 h2 repair:confidence → then other skill", () => {
  const s0 = startSession(leadState("a1"), C, T0);
  expect(card(s0)).toMatchObject({ card: "a1.h3", reason: "open:liked" });
  const s1 = say(C, s0, 1, T0 + 10_000);
  expect(s1.feedback).toEqual({ right: false, correctIndex: 0, tag: "sign-error" });
  expect(s1.state.session!.repair).toEqual({ skill: "a1", failedHeight: 3, tag: "sign-error", stage: "piece" });
  expect(card(s1)).toMatchObject({ card: "a1.h1.2", skill: "a1", height: 1, reason: "repair:missing-piece" });
  const s2 = right(C, s1, T0 + 20_000);
  expect(s2.state.session!.repair!.stage).toBe("confidence");
  expect(card(s2)).toMatchObject({ skill: "a1", height: 2, reason: "repair:confidence" });
  const s3 = right(C, s2, T0 + 30_000);
  expect(s3.state.session!.repair).toBeNull();
  expect(s3.state.session!.returns).toEqual([{ skill: "a1", afterCard: 3 + cfg.session.returnAfterCards }]);
  expect(card(s3).skill).not.toBe("a1");
});

test("wrong on a2.h3 (note n1, tag recall-gap) → piece is a2.h2.2 (note match)", () => {
  const s0 = startSession(leadState("a2"), C, T0);
  expect(card(s0).card).toBe("a2.h3");
  const s1 = wrong(C, s0, T0 + 10_000);
  expect(s1.state.session!.repair).toEqual({ skill: "a2", failedHeight: 3, tag: "recall-gap", note: "n1", stage: "piece" });
  expect(card(s1)).toMatchObject({ card: "a2.h2.2", height: 2, reason: "repair:missing-piece" });
  // "I don't know" runs the same repair, with no tag
  const d1 = say(C, s0, "dont-know", T0 + 10_000);
  expect(d1.state.session!.repair).toEqual({ skill: "a2", failedHeight: 3, note: "n1", stage: "piece" });
  expect(card(d1).card).toBe("a2.h2.2");
});

test("skill with no h1/h2 → piece comes from weakest requires skill", () => {
  const thin = fixture({ drop: ["a2.h1.1", "a2.h1.2", "a2.h1.3", "a2.h2.1", "a2.h2.2", "a2.h2.3"] });
  const s0 = startSession(leadState("a2"), thin, T0);
  expect(card(s0).card).toBe("a2.h3");
  const s1 = wrong(thin, s0, T0 + 10_000);
  expect(card(s1)).toMatchObject({ skill: "a1", section: "u.t1/A", height: 1, reason: "repair:missing-piece" });
  // a2 has nothing at or below height 2: the confidence stage is skipped and the repair ends
  const s2 = right(thin, s1, T0 + 20_000);
  expect(s2.state.session!.repair).toBeNull();
  expect(card(s2).reason).not.toBe("repair:confidence");

  // direct: the weakest of several requires skills
  const two: Content = structuredClone(thin);
  two.skills["a2"].requires = ["b1", "a1"];
  const st = { ...s0.state, skills: { ...s0.state.skills, a1: rec(1, atts(1, 1, 4, D0 - 2)) } };
  const r = nextRepairCard(st, two, { skill: "a2", failedHeight: 3, stage: "piece" }, D0, cfg);
  expect(r!.served).toMatchObject({ skill: "a1", height: 1, reason: "repair:missing-piece" });
});

test("original skill returns after ≥ 4 other cards as a different variant, reason repair:return", () => {
  const s0 = startSession(leadState("a1"), C, T0);
  const orig = card(s0);
  const s1 = say(C, s0, 1, T0 + 10_000);
  const r = run(C, s1, T0 + 10_000, () => "r");
  const cards = [orig, ...served([s1, ...r.steps])];
  const conf = cards.findIndex((c) => c.reason === "repair:confidence");
  const ret = cards.findIndex((c) => c.reason === "repair:return");
  expect(conf).toBe(2);
  expect(ret).toBeGreaterThan(0);
  expect(ret - conf - 1).toBeGreaterThanOrEqual(cfg.session.returnAfterCards);
  expect(cards[ret].skill).toBe("a1");
  expect(cards[ret].height).toBe(3);
  expect(`${cards[ret].card}#${cards[ret].variant}`).not.toBe(`${orig.card}#${orig.variant}`);
  expect(cards.slice(conf + 1, ret).every((c) => c.skill !== "a1")).toBe(true);
  const end = r.steps[r.steps.length - 1].next;
  expect(end.kind === "end" || end.kind === "offer-extend").toBe(true);
  const after = r.steps.find((st) => st.state.session && st.state.session.fixed === 1);
  expect(after).toBeDefined();
  if (end.kind === "end") expect(end.end.fixed).toBe(1);
});

test("no room to return this session → nextReviewDay = tomorrow", () => {
  const s0 = startSession(leadState("a1", 13.34), C, T0);
  const s1 = say(C, s0, 1, T0 + 10_000);
  const r = run(C, s1, T0 + 10_000, () => "r");
  const steps = [s1, ...r.steps];
  expect(steps.some((st) => (st.state.session?.returns.length ?? 0) === 1)).toBe(true);
  expect(served(steps).some((c) => c.reason === "repair:return")).toBe(false);
  expect(r.state.session).toBeNull();
  expect(r.state.skills["a1"].nextReviewDay).toBe(D0 + 1);
});

test("wrong inside repair → no second repair; height drops; next card from another, liked section", () => {
  const s0 = startSession(leadState("a1"), C, T0);
  const s1 = say(C, s0, 1, T0 + 10_000);
  expect(card(s1).reason).toBe("repair:missing-piece");
  const s2 = wrong(C, s1, T0 + 20_000);
  const sess = s2.state.session!;
  expect(sess.repair).toBeNull();
  expect(sess.badMoments).toEqual([1]);
  expect(sess.history.map((h) => h.bad)).toEqual([false, true]);
  expect(s2.state.skills["a1"].height).toBe(2);
  expect(card(s2)).toMatchObject({ reason: "open:liked", section: "u.t1/B" });
  // a wrong on the first repair card of a confidence stage does the same
  const c1 = right(C, s1, T0 + 20_000);
  const c2 = wrong(C, c1, T0 + 30_000);
  expect(c2.state.session!.repair).toBeNull();
  expect(c2.state.session!.badMoments).toEqual([2]);
  expect(c2.state.session!.returns).toEqual([]);
  expect(card(c2)).toMatchObject({ reason: "open:liked", section: "u.t1/B" });
});
