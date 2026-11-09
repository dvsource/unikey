import { fireEvent, screen, waitFor } from "@testing-library/react-native";
import { router } from "expo-router";
import SessionScreen from "../src/app/session";
import { getItem, items, tags } from "../src/content/pack";
import { color } from "../src/theme";
import { renderWithStore, savedState } from "./helpers";

const params: Record<string, string> = {};
jest.mock("expo-router", () => ({
  useLocalSearchParams: () => params,
  router: { back: jest.fn(), replace: jest.fn(), push: jest.fn(), navigate: jest.fn(), dismissTo: jest.fn() },
}));

const setParams = (p: Record<string, string>) => {
  for (const k of Object.keys(params)) delete params[k];
  Object.assign(params, p);
};
beforeEach(() => jest.clearAllMocks());

const c001 = items[0].variants[0].options;
const right = c001.findIndex((o) => o.correct);
const wrong = c001.findIndex((o) => !o.correct);

describe("Session player", () => {
  it("shows Correct in green with the explanation and no mistake message (FB-04, DS-01)", async () => {
    setParams({ mode: "today" });
    await renderWithStore(<SessionScreen />);
    await fireEvent.press(screen.getByTestId(`option-${right}`));
    expect(screen.getByTestId("feedback-title")).toHaveTextContent("Correct");
    expect(screen.getByTestId("feedback-title")).toHaveStyle({ color: color.green });
    expect(screen.getByTestId(`option-${right}`)).toHaveStyle({ backgroundColor: color.greenSoft, borderColor: color.greenEdge });
    expect(screen.queryByTestId("mistake-message")).toBeNull();
    expect(screen.getByTestId("explanation")).toBeOnTheScreen();
  });

  it("marks a wrong pick in terracotta, shows tags and the no-Sinhala note (DS-01, FB-05, FB-06)", async () => {
    setParams({ mode: "today" });
    await renderWithStore(<SessionScreen />);
    await fireEvent.press(screen.getByTestId(`option-${wrong}`));
    expect(screen.getByTestId(`option-${wrong}`)).toHaveStyle({ backgroundColor: color.terracottaSoft, borderColor: color.terracotta });
    expect(screen.getByTestId("feedback-title")).toHaveStyle({ color: color.terracotta });
    expect(screen.getByTestId("feedback-title")).toHaveTextContent("Concept trap");
    expect(screen.getAllByText(c001[wrong].tag!).length).toBeGreaterThan(0);
    expect(tags[c001[wrong].tag!].message.si).toBeUndefined();
    expect(screen.getByText("Tag message has no Sinhala yet")).toBeOnTheScreen();
  });

  it("locks the answer once given (SES-13)", async () => {
    setParams({ mode: "today" });
    await renderWithStore(<SessionScreen />);
    await fireEvent.press(screen.getByTestId(`option-${wrong}`));
    await fireEvent.press(screen.getByTestId(`option-${right}`));
    expect(screen.getByTestId("feedback-title")).toHaveTextContent("Concept trap");
    expect((await savedState()).progress.answers["phy.mech.c001"].correct).toBe(false);
  });

  it("shows English under the Sinhala with EN on (LANG-02)", async () => {
    setParams({ mode: "today" });
    await renderWithStore(<SessionScreen />);
    expect(screen.queryByText(items[0].variants[0].stem.en)).toBeNull();
    await fireEvent.press(screen.getByTestId("toggle-english"));
    expect(screen.getByText(items[0].variants[0].stem.en)).toBeOnTheScreen();
    await waitFor(async () => expect((await savedState()).settings.showEnglish).toBe(true));
  });

  it("steps through a template's examples (SES-06, SES-07)", async () => {
    setParams({ mode: "skill", skill: "phy.mech.vec.resultant-range", start: "phy.mech.t01" });
    await renderWithStore(<SessionScreen />);
    const t01 = getItem("phy.mech.t01")!;
    expect(screen.getByTestId("item-meta")).toHaveTextContent(/Example 1 of 3 \(v1\)/);
    expect(screen.getByText(t01.variants[1].stem.si!)).toBeOnTheScreen();
    await fireEvent.press(screen.getByTestId("option-0"));
    await fireEvent.press(screen.getByTestId("variant-next"));
    expect(screen.getByTestId("item-meta")).toHaveTextContent(/Example 2 of 3 \(v56\)/);
    expect(screen.getByText(t01.variants[56].stem.si!)).toBeOnTheScreen();
    expect(screen.queryByTestId("feedback")).toBeNull();
    await fireEvent.press(screen.getByTestId("variant-prev"));
    await fireEvent.press(screen.getByTestId("variant-prev"));
    expect(screen.getByTestId("item-meta")).toHaveTextContent(/Example 3 of 3 \(v289\)/);
  });

  it("ends the last item with Finish and opens Done with the score (SES-02, EDGE-05)", async () => {
    setParams({ mode: "skill", skill: "phy.mech.rot.moi-factors", start: "phy.mech.b02" });
    await renderWithStore(<SessionScreen />);
    expect(screen.getByTestId("session-counter")).toHaveTextContent("1 / 1");
    const b02 = getItem("phy.mech.b02")!.variants[getItem("phy.mech.b02")!.examples![0]].options;
    await fireEvent.press(screen.getByTestId(`option-${b02.findIndex((o) => o.correct)}`));
    expect(screen.getByTestId("continue")).toHaveTextContent("Finish");
    await fireEvent.press(screen.getByTestId("continue"));
    expect(router.replace).toHaveBeenCalledWith({
      pathname: "/done",
      params: expect.objectContaining({ mode: "skill", right: "1", total: "1", skill: "phy.mech.rot.moi-factors" }),
    });
  });

  it("moves Today's cursor with every answer, so a killed session resumes (EDGE-02)", async () => {
    setParams({ mode: "today" });
    await renderWithStore(<SessionScreen />);
    for (let i = 0; i < 3; i++) {
      await fireEvent.press(screen.getByTestId("option-0"));
      await fireEvent.press(screen.getByTestId("continue"));
    }
    await waitFor(async () => expect((await savedState()).progress.cursors).toEqual({ "mechanics-20": 3 }));
  });

  it("hides reviewer controls with reviewer mode off (PRG-02)", async () => {
    setParams({ mode: "today" });
    await renderWithStore(<SessionScreen />, { settings: { reviewerMode: false, showEnglish: false, reviewerName: "" } });
    expect(screen.queryByTestId("review-open")).toBeNull();
    expect(screen.queryByTestId("item-meta")).toBeNull();
    await fireEvent.press(screen.getByTestId(`option-${wrong}`));
    expect(screen.queryByTestId("review-open-sheet")).toBeNull();
    expect(screen.queryByText("Tag message has no Sinhala yet")).toBeNull();
  });

  it("handles an empty queue (EDGE-06)", async () => {
    setParams({ mode: "skill", skill: "no.such.skill" });
    await renderWithStore(<SessionScreen />);
    expect(screen.getByText("Nothing left to play here.")).toBeOnTheScreen();
  });
});
