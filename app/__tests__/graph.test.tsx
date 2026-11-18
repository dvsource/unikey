import fs from "node:fs";
import path from "node:path";
import { fireEvent, screen } from "@testing-library/react-native";
import { router } from "expo-router";
import ProgressScreen from "../src/app/(tabs)/progress";
import TodayScreen from "../src/app/(tabs)/index";
import SkillScreen from "../src/app/skill/[id]";
import {
  bestLever,
  graphFor,
  mixedUpWith,
  node,
  opens,
  pastPaperCount,
  prerequisites,
  readiness,
  skillName,
  skillState,
  standsOn,
  trail,
} from "../src/content/graph";
import { itemsForSkill, packs } from "../src/content/pack";
import { buildSession } from "../src/state/session";
import { renderWithStore } from "./helpers";

const params: Record<string, string> = {};
jest.mock("expo-router", () => ({
  useLocalSearchParams: () => params,
  router: { back: jest.fn(), replace: jest.fn(), push: jest.fn(), navigate: jest.fn(), dismissTo: jest.fn() },
}));
jest.mock("../src/state/exportReviews", () => ({ shareExportFile: jest.fn(), shareExportText: jest.fn() }));
beforeEach(() => {
  jest.clearAllMocks();
  for (const k of Object.keys(params)) delete params[k];
});

const REPO = path.resolve(__dirname, "../..");
const config = JSON.parse(fs.readFileSync(path.join(__dirname, "../content-packs.json"), "utf8"));
const right = (ids: string[]) => Object.fromEntries(ids.map((id) => [id, { correct: true, at: "x" }]));
const wrong = (ids: string[]) => Object.fromEntries(ids.map((id) => [id, { correct: false, at: "x" }]));

describe("Bundled skill graphs (GRF-01)", () => {
  it.each(config.packs.map((p: { id: string; graph: string }) => [p.id, p.graph]) as [string, string][])("%s matches %s", (id, file) => {
    const src = JSON.parse(fs.readFileSync(path.join(REPO, file), "utf8"));
    const g = graphFor(id)!;
    expect(g.skills.map((s) => s.id)).toEqual(src.skills.map((s: { id: string }) => s.id));
    expect(g.topics).toHaveLength(src.topics.length);
    // Every sample skill is in the graph and keeps its Sinhala name.
    for (const s of packs.find((p) => p.id === id)!.skills) expect(node(s.id)?.name.si).toBe(s.name.si);
    // Exam weights sum to 1 per unit.
    expect(g.skills.reduce((n, s) => n + s.weight, 0)).toBeCloseTo(1, 2);
  });
});

describe("Graph queries (GRF-02)", () => {
  const nl = "phy.mech.newton.second-law";
  it("walks requires edges both ways", () => {
    for (const id of opens(nl)) expect(prerequisites(id)).toContain(nl);
    const up = standsOn(nl);
    expect(up.length).toBeGreaterThanOrEqual(opens(nl).length);
    expect(new Set(up).size).toBe(up.length);
    expect(up).not.toContain(nl);
  });
  it("lists confusable skills from either end", () => {
    const g = graphFor("mechanics-20")!;
    const e = g.edges.find((x) => x.type === "confusable")!;
    expect(mixedUpWith(e.from)).toContain(e.to);
    expect(mixedUpWith(e.to)).toContain(e.from);
  });
  it("names skills in Sinhala when known, English otherwise", () => {
    expect(skillName("phy.mech.vec.resultant-range").si).toBeTruthy();
    expect(skillName("phy.mech.kin.suvat")).toEqual({ en: "Equations of motion for constant acceleration" });
    expect(pastPaperCount("phy.mech.kin.suvat")).toBe(1);
  });
});

describe("Skill state and readiness (GRF-03)", () => {
  const skill = "phy.mech.vec.resultant-range";
  const ids = itemsForSkill(skill).map((it) => it.id);
  it("moves from new to practising, mastered and refresh", () => {
    expect(skillState(skill, {})).toBe("new");
    expect(skillState(skill, right(ids.slice(0, 1)))).toBe("practising");
    expect(skillState(skill, right(ids))).toBe("mastered");
    expect(skillState(skill, { ...right(ids), ...wrong(ids.slice(0, 1)) })).toBe("refresh");
    expect(skillState("phy.mech.kin.suvat", {})).not.toBe("new"); // no questions in the sample
  });
  it("weights readiness by exam share", () => {
    const all = graphFor("mechanics-20")!.skills.map((s) => s.id);
    expect(readiness(all, {})).toBe(0);
    expect(readiness([skill], right(ids))).toBe(100);
    const partial = readiness(all, right(ids));
    expect(partial).toBe(Math.round(100 * node(skill)!.weight));
  });
});

describe("Trail (D) and lever (T) (GRF-04)", () => {
  const queue = buildSession("today", { pack: "mechanics-20", cursor: 0, reviews: {} });
  it("lists today's skills in order with a reason each", () => {
    const stops = trail(queue, {});
    expect(stops.length).toBeGreaterThan(0);
    expect(stops.length).toBeLessThanOrEqual(5);
    const queueSkills = [...new Set(queue.map((it) => it.skills[0]))];
    expect(stops.filter((s) => s.kind !== "first").map((s) => s.skill)).toEqual(queueSkills.slice(0, stops.filter((s) => s.kind !== "first").length));
    for (const s of stops) expect(s.why.length).toBeGreaterThan(5);
  });
  it("marks a skill missed last time as refresh", () => {
    const first = queue[0];
    expect(trail(queue, wrong([first.id]))[0]).toMatchObject({ skill: first.skills[0], kind: "refresh" });
  });
  it("suggests a missing prerequisite with questions first", () => {
    // A queue that starts on a skill whose prerequisite has sample questions.
    const all = packs.flatMap((p) => p.items);
    const target = all.find((it) => prerequisites(it.skills[0]).some((p) => itemsForSkill(p).length > 0 && p !== it.skills[0]))!;
    const stops = trail([target], {});
    expect(stops[0].kind).toBe("first");
    expect(prerequisites(target.skills[0])).toContain(stops[0].skill);
    expect(stops[1].skill).toBe(target.skills[0]);
  });
  it("picks the skill most others stand on as the lever", () => {
    const ids = ["phy.mech.vec.resultant-range", "phy.mech.newton.second-law"];
    expect(bestLever(ids)).toEqual({ skill: "phy.mech.newton.second-law", count: standsOn("phy.mech.newton.second-law").length });
  });
});

describe("Screens (GRF-05..07)", () => {
  const settings = { showEnglish: false, reviewerMode: true, reviewerName: "", unit: "" };

  it("Today shows the trail and Start", async () => {
    await renderWithStore(<TodayScreen />, { settings });
    expect(screen.getByTestId("trail")).toBeOnTheScreen();
    expect(screen.getByTestId("today-skill")).toHaveTextContent(skillName("phy.mech.vec.resultant-range").si!);
    await fireEvent.press(screen.getByTestId("trail-stop-0"));
    expect(router.push).toHaveBeenCalledWith({ pathname: "/skill/[id]", params: { id: "phy.mech.vec.resultant-range" } });
  });

  it("skill detail shows needs, opens, what stands on it and starts the skill", async () => {
    params.id = "phy.mech.kin.graph-slope-area";
    await renderWithStore(<SkillScreen />, { settings });
    expect(screen.getByTestId("skill-graph")).toBeOnTheScreen();
    expect(screen.getByTestId("stands-on")).toHaveTextContent(String(standsOn(params.id).length));
    expect(screen.getByTestId("past-papers")).toHaveTextContent(String(pastPaperCount(params.id)));
    for (const o of opens(params.id)) expect(screen.getAllByText(skillName(o).si ?? skillName(o).en).length).toBeGreaterThan(0);
    await fireEvent.press(screen.getByTestId("start-skill"));
    expect(router.push).toHaveBeenCalledWith({
      pathname: "/session",
      params: { mode: "skill", skill: params.id, start: itemsForSkill(params.id)[0].id },
    });
  });

  it("skill detail works for a graph skill with no questions", async () => {
    params.id = "phy.mech.kin.suvat";
    await renderWithStore(<SkillScreen />, { settings });
    expect(screen.getByTestId("skill-title")).toHaveTextContent("Equations of motion for constant acceleration");
    expect(screen.getByTestId("no-questions")).toBeOnTheScreen();
    expect(screen.queryByTestId("start-skill")).toBeNull();
  });

  it("Progress shows a ring per topic and the picked topic's chips", async () => {
    const ids = itemsForSkill("phy.mech.vec.resultant-range").map((it) => it.id);
    await renderWithStore(<ProgressScreen />, { settings, progress: { cursors: {}, days: {}, answers: right(ids) } });
    const g = graphFor("mechanics-20")!;
    for (const t of g.topics) expect(screen.getByTestId(`ring-${t.ref}`)).toBeOnTheScreen();
    expect(screen.getByTestId("readiness")).toHaveTextContent(String(readiness(g.skills.map((s) => s.id), right(ids))));
    const topic = g.skills.find((s) => s.id === "phy.mech.vec.resultant-range")!.topic;
    const ref = g.topics.find((t) => t.id === topic)!.ref;
    await fireEvent.press(screen.getByTestId(`ring-${ref}`));
    expect(screen.getByTestId("chip-panel-title")).toHaveTextContent(new RegExp(`^${ref.replace(".", "\\.")} `));
    expect(screen.getByTestId("chip-phy.mech.vec.resultant-range")).toHaveAccessibleName(/Mastered/);
    await fireEvent.press(screen.getByTestId("chip-phy.mech.vec.resultant-range"));
    expect(router.push).toHaveBeenCalledWith({ pathname: "/skill/[id]", params: { id: "phy.mech.vec.resultant-range" } });
  });
});
