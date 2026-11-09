import { figureSvg } from "../src/content/figureEngines";
import { constantsLine, getItem, items, mistakeMessage, pick, tags } from "../src/content/pack";
import { buildSession, masteredSkills, SESSION_SIZE } from "../src/state/session";
import { ReviewRecord, reviewedItemIds, reviewKey, streak, today } from "../src/state/store";

const mark = (item_id: string, variant_id: string | null = null): ReviewRecord => ({
  item_id,
  variant_id,
  item_version: 1,
  spec_version: "0.5",
  pack: "mechanics-20",
  verdict: "ok",
  issues: [],
  distractors: [],
  note: "",
  reviewer: "T",
  timestamp: "2026-11-07T10:00:00Z",
});
const ids = (list: { id: string }[]) => list.map((it) => it.id);

describe("Today queue (HOME-06, EDGE-03)", () => {
  it("plays the next 10 items in order from the cursor", () => {
    expect(ids(buildSession("today", { cursor: 0, reviews: {} }))).toEqual(ids(items.slice(0, SESSION_SIZE)));
    expect(ids(buildSession("today", { cursor: 10, reviews: {} }))[0]).toBe("phy.mech.c008");
  });

  it("wraps around after the last item", () => {
    const q = buildSession("today", { cursor: items.length - 3, reviews: {} });
    expect(q).toHaveLength(10);
    expect(ids(q).slice(2, 4)).toEqual([items[items.length - 1].id, items[0].id]);
  });

  it("honours a smaller size for '5 more'", () => {
    expect(buildSession("today", { cursor: 0, reviews: {}, size: 5 })).toHaveLength(5);
  });
});

describe("Review queue (REV-13, EDGE-04)", () => {
  it("skips reviewed items", () => {
    const reviews = { [reviewKey("phy.mech.c001", null)]: mark("phy.mech.c001") };
    expect(ids(buildSession("review", { cursor: 0, reviews }))[0]).toBe("phy.mech.c002");
  });

  it("counts an item once however many variants are marked", () => {
    const reviews = {
      [reviewKey("phy.mech.t01", "v1")]: mark("phy.mech.t01", "v1"),
      [reviewKey("phy.mech.t01", "v56")]: mark("phy.mech.t01", "v56"),
    };
    expect(reviewedItemIds(reviews).size).toBe(1);
  });

  it("is empty when everything is reviewed", () => {
    const reviews = Object.fromEntries(items.map((it) => [reviewKey(it.id, null), mark(it.id)]));
    expect(buildSession("review", { cursor: 0, reviews })).toHaveLength(0);
  });
});

describe("Skill queue (LRN-03)", () => {
  it("plays from the chosen item to the end of the skill", () => {
    const q = buildSession("skill", { cursor: 0, reviews: {}, skill: "phy.mech.vec.resultant-range", start: "phy.mech.c002" });
    expect(ids(q)).toEqual(["phy.mech.c002", "phy.mech.t01"]);
  });

  it("counts a skill as mastered only when every item was last answered right", () => {
    const skill = "phy.mech.vec.resultant-range";
    const all = { "phy.mech.c001": { correct: true }, "phy.mech.c002": { correct: true }, "phy.mech.t01": { correct: true } };
    expect(masteredSkills([skill], all)).toEqual([skill]);
    expect(masteredSkills([skill], { ...all, "phy.mech.t01": { correct: false } })).toEqual([]);
  });
});

describe("Streak (EDGE-08)", () => {
  const day = (offset: number) => {
    const d = new Date();
    d.setDate(d.getDate() - offset);
    return today(d);
  };
  it("counts consecutive days ending today", () => {
    expect(streak({ [day(0)]: 3, [day(1)]: 1, [day(2)]: 4, [day(4)]: 1 })).toBe(3);
  });
  it("keeps yesterday's streak before today's session", () => {
    expect(streak({ [day(1)]: 1, [day(2)]: 1 })).toBe(2);
  });
  it("is 0 after a missed day", () => {
    expect(streak({ [day(2)]: 1 })).toBe(0);
  });
});

describe("Mistake messages (FB-03, FB-07)", () => {
  const c006 = getItem("phy.mech.c006")!.variants[0].options;

  it("prefers the option's own detail", () => {
    const o = c006.find((x) => x.detail)!;
    expect(mistakeMessage(o)!.text).toEqual(o.detail);
    expect(mistakeMessage(o)!.group).toBe(tags[o.tag!].group);
  });

  it("falls back to the tag's student message", () => {
    const o = c006.find((x) => x.tag === "sign")!;
    expect(mistakeMessage(o)!.text.en).toBe("Pick a positive direction and stick to it.");
  });

  it("returns null for a correct option or an unknown tag", () => {
    expect(mistakeMessage(c006.find((x) => x.correct)!)).toBeNull();
    expect(mistakeMessage({ text: { en: "x" }, correct: false, tag: "no-such-tag" })).toBeNull();
  });
});

describe("Display helpers", () => {
  it("formats constants", () => {
    expect(constantsLine({ g: 10 })).toBe("g = 10 m s⁻²");
    expect(constantsLine({ g: 10, pi: 3 })).toBe("g = 10 m s⁻² · π ≈ 3");
  });
  it("falls back to English when Sinhala is missing", () => {
    expect(pick({ en: "a", si: "ආ" })).toBe("ආ");
    expect(pick({ en: "a" })).toBe("a");
    expect(pick({ en: "a", si: "ආ" }, "en")).toBe("a");
  });
  it("returns null for an unknown figure engine, and passes SVG through", () => {
    expect(figureSvg({ engine: "nope", params: {} })).toBeNull();
    expect(figureSvg(null)).toBeNull();
    expect(figureSvg({ svg: "<svg/>" })).toBe("<svg/>");
  });
});
