import { describe, expect, it, vi } from "vitest";
import graph from "@/data/skills.json";
import * as D from "@/lib/data";

describe("DATA: fake class and graph", () => {
  it("DATA-01 graph has 83 skills and 8 topics, every skill in a topic", () => {
    expect(D.skills).toHaveLength(83);
    expect(D.topics).toHaveLength(8);
    for (const s of D.skills) expect(D.topicById[s.topic]).toBeDefined();
  });

  it("DATA-02 ids unique, requires sources are Mechanics skills, slugs have no dots and round-trip", () => {
    const ids = D.skills.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const [from] of graph.requires) expect(D.skillById[from]).toBeDefined();
    for (const id of ids) {
      const href = D.skillHref(id);
      expect(href).toMatch(/^\/skill\/[^.]+\/$/);
      expect(D.skillIdFromSlug(href.split("/")[2])).toBe(id);
    }
  });

  it("DATA-03 24 students, unique, sharing 19 / 4 / 1", () => {
    expect(D.students).toHaveLength(24);
    expect(new Set(D.students.map((s) => s.id)).size).toBe(24);
    expect(new Set(D.students.map((s) => s.name)).size).toBe(24);
    const count = (k: D.Sharing) => D.students.filter((s) => s.sharing === k).length;
    expect([count("effort+skills"), count("effort"), count("awaiting-consent")]).toEqual([19, 4, 1]);
  });

  it("DATA-04 quiet students are Kasun, Dilan, Ishara with no days this week and 7+ days away", () => {
    expect(D.quietStudents.map((s) => s.name)).toEqual(["Kasun", "Dilan", "Ishara"]);
    for (const s of D.quietStudents) {
      expect(s.daysThisWeek.some(Boolean)).toBe(false);
      expect(s.lastSeenDays).toBeGreaterThanOrEqual(7);
    }
  });

  it("DATA-05 root-cause card agrees with the data and the graph, with evidence from 3+ students", () => {
    const rc = D.insights.rootCause;
    const stuck = D.students.filter((s) => D.skillStates[s.id][rc.bottleneck] === "learning");
    expect(stuck).toHaveLength(rc.stuck);
    expect(D.requiresOf(rc.bottleneck)).toContain(rc.root);
    expect(rc.activeChecked).toBeGreaterThanOrEqual(3);
    expect(D.skillById[rc.bottleneck].topic).toBe(D.klass.defaultTeachingNow);
  });

  it("DATA-06 misconception card uses a real tag, 3+ students, 14-day window", () => {
    const mc = D.insights.misconception;
    expect(D.tags[mc.tag]).toBeDefined();
    expect(mc.students).toBeGreaterThanOrEqual(3);
    expect(mc.days).toBe(14);
    for (const id of mc.skills) expect(D.skillById[id]).toBeDefined();
  });

  it("DATA-07 class distributions count every student", () => {
    for (const s of D.skills) {
      const d = D.skillDist(s.id);
      expect(Object.values(d).reduce((a, b) => a + b, 0)).toBe(24);
    }
    for (const t of D.topics) {
      const n = D.skills.filter((s) => s.topic === t.id).length;
      expect(Object.values(D.topicDist(t.id)).reduce((a, b) => a + b, 0)).toBe(24 * n);
    }
  });

  it("DATA-08 header numbers: 18 active, readiness 0-100", () => {
    expect(D.activeThisWeek).toHaveLength(18);
    expect(D.classReadiness).toBeGreaterThanOrEqual(0);
    expect(D.classReadiness).toBeLessThanOrEqual(100);
  });

  it("DATA-09 deterministic across re-imports", async () => {
    vi.resetModules();
    const again = await import("@/lib/data");
    expect(again.students).toEqual(D.students);
    expect(again.skillStates).toEqual(D.skillStates);
  });

  it("DATA-10 badness ranks stuck/fading worse than mastered", () => {
    const good: D.Dist = { "not-started": 0, learning: 1, practising: 3, mastered: 20, fading: 0 };
    const bad: D.Dist = { "not-started": 0, learning: 12, practising: 4, mastered: 2, fading: 6 };
    expect(D.badness(bad)).toBeGreaterThan(D.badness(good));
  });

  it("DATA-11 fading topics exist and have fading skills", () => {
    for (const f of D.insights.fading) {
      expect(D.topicById[f.topic]).toBeDefined();
      expect(D.topicDist(f.topic).fading).toBeGreaterThan(0);
    }
  });
});
