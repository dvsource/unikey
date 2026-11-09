import { fireEvent, screen, waitFor } from "@testing-library/react-native";
import { router } from "expo-router";
import LearnScreen from "../src/app/(tabs)/learn";
import TodayScreen from "../src/app/(tabs)/index";
import SessionScreen from "../src/app/session";
import { getPack, packs, tags } from "../src/content/pack";
import { buildSession } from "../src/state/session";
import { mark, renderWithStore, savedState } from "./helpers";

const params: Record<string, string> = {};
jest.mock("expo-router", () => ({
  useLocalSearchParams: () => params,
  router: { back: jest.fn(), replace: jest.fn(), push: jest.fn(), navigate: jest.fn(), dismissTo: jest.fn() },
}));
beforeEach(() => {
  jest.clearAllMocks();
  for (const k of Object.keys(params)) delete params[k];
});

const settings = (over = {}) => ({ showEnglish: false, reviewerMode: true, reviewerName: "", unit: "", ...over });
const thermal = getPack("thermal-physics-20")!;
const elec = getPack("current-electricity-20")!;

describe("Units: queues (UNIT-01, UNIT-02)", () => {
  it("builds Today and review queues from one unit only", () => {
    const q = buildSession("today", { pack: thermal.id, cursor: 0, reviews: {} });
    expect(q.every((it) => it.pack === thermal.id)).toBe(true);
    expect(q[0].id).toBe(thermal.items[0].id);
    const reviews = { [`${elec.items[0].id}|-`]: mark(elec.items[0].id) };
    expect(buildSession("review", { pack: elec.id, cursor: 0, reviews })[0].id).toBe(elec.items[1].id);
  });
});

describe("Units: Today (UNIT-03, UNIT-04)", () => {
  it("switches the Today card, review count and Sigiriya with the unit chips", async () => {
    await renderWithStore(<TodayScreen />, { settings: settings(), reviews: { "phy.mech.c001|-": mark("phy.mech.c001") } });
    expect(packs.map((p) => screen.getByTestId(`unit-${p.id}`))).toHaveLength(3);
    expect(screen.getByTestId("unit-mechanics-20")).toBeSelected();
    expect(screen.getByTestId("reviewed-count")).toHaveTextContent("Reviewed 1 of 91");
    expect(screen.getByTestId("reviewed-total")).toHaveTextContent("all units: 1 of 241", { exact: false });

    await fireEvent.press(screen.getByTestId(`unit-${thermal.id}`));
    expect(screen.getByTestId(`unit-${thermal.id}`)).toBeSelected();
    expect(screen.getByTestId("reviewed-count")).toHaveTextContent("Reviewed 0 of 68");
    expect(screen.getAllByText(thermal.unit.name_si, { exact: false }).length).toBeGreaterThanOrEqual(2); // chip + unit section
    expect(screen.getByTestId("today-skill")).toHaveTextContent(thermal.skills.find((s) => s.id === thermal.items[0].skills[0])!.name.si!);
    await fireEvent.press(screen.getByTestId("review-next"));
    expect(router.push).toHaveBeenCalledWith({ pathname: "/session", params: { mode: "review", pack: thermal.id } });
    await waitFor(async () => expect((await savedState()).settings.unit).toBe(thermal.id));
  });
});

describe("Units: Learn (UNIT-05)", () => {
  it("lists only the picked unit's skills", async () => {
    await renderWithStore(<LearnScreen />, { settings: settings({ unit: elec.id }) });
    expect(screen.getByTestId(`skill-${elec.skills[0].id}`)).toBeOnTheScreen();
    expect(screen.queryByTestId("skill-phy.mech.vec.resultant-range")).toBeNull();
    await fireEvent.press(screen.getByTestId("unit-mechanics-20"));
    expect(screen.getByTestId("skill-phy.mech.vec.resultant-range")).toBeOnTheScreen();
    expect(screen.queryByTestId(`skill-${elec.skills[0].id}`)).toBeNull();
  });
});

describe("Units: session (UNIT-06, UNIT-07)", () => {
  it("plays the picked unit and keeps a separate Today cursor per unit", async () => {
    params.mode = "today";
    await renderWithStore(<SessionScreen />, { settings: settings({ unit: thermal.id }), progress: { cursors: { "mechanics-20": 7 }, days: {}, answers: {} } });
    expect(screen.getByTestId("item-meta")).toHaveTextContent(new RegExp(`^${thermal.items[0].id.replace(/\./g, "\\.")} `));
    await fireEvent.press(screen.getByTestId("option-0"));
    await waitFor(async () => expect((await savedState()).progress.cursors).toEqual({ "mechanics-20": 7, [thermal.id]: 1 }));
  });

  it("says when a mistake message comes from a proposed tag (UNIT-08)", async () => {
    const proposed = new Set(Object.entries(tags).filter(([, t]) => t.proposed).map(([k]) => k));
    const item = thermal.items.find((it) => it.kind === "card" && it.variants[0].options.some((o) => o.tag && proposed.has(o.tag) && !o.detail))!;
    const i = item.variants[0].options.findIndex((o) => o.tag && proposed.has(o.tag) && !o.detail);
    Object.assign(params, { mode: "skill", skill: item.skills[0], start: item.id });
    await renderWithStore(<SessionScreen />, { settings: settings() });
    await fireEvent.press(screen.getByTestId(`option-${i}`));
    expect(screen.getByTestId("tag-note")).toHaveTextContent(new RegExp(`Proposed tag \\(${item.variants[0].options[i].tag}\\)`));
  });
});
