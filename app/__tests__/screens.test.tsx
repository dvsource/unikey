import { fireEvent, screen, waitFor } from "@testing-library/react-native";
import { router } from "expo-router";
import { Alert, StyleSheet } from "react-native";
import LearnScreen from "../src/app/(tabs)/learn";
import ProgressScreen from "../src/app/(tabs)/progress";
import TodayScreen from "../src/app/(tabs)/index";
import DoneScreen from "../src/app/done";
import { items } from "../src/content/pack";
import { shareExportFile, shareExportText } from "../src/state/exportReviews";
import { mark, renderWithStore, savedState } from "./helpers";

const params: Record<string, string> = {};
jest.mock("expo-router", () => ({
  useLocalSearchParams: () => params,
  router: { back: jest.fn(), replace: jest.fn(), push: jest.fn(), navigate: jest.fn(), dismissTo: jest.fn() },
}));
jest.mock("../src/state/exportReviews", () => ({ shareExportFile: jest.fn(), shareExportText: jest.fn() }));

beforeEach(() => jest.clearAllMocks());

const settings = (over = {}) => ({ showEnglish: false, reviewerMode: true, reviewerName: "", ...over });
const twoMarks = { "phy.mech.c001|-": mark("phy.mech.c001", { verdict: "issues", issues: ["other"] }), "phy.mech.c002|-": mark("phy.mech.c002") };

describe("Today", () => {
  it("shows the review count and opens a review session (HOME-03)", async () => {
    await renderWithStore(<TodayScreen />, { settings: settings(), reviews: twoMarks });
    expect(screen.getByTestId("reviewed-count")).toHaveTextContent("Reviewed 2 of 91");
    await fireEvent.press(screen.getByTestId("review-next"));
    expect(router.push).toHaveBeenCalledWith({ pathname: "/session", params: { mode: "review", pack: "mechanics-20" } });
  });

  it("hides the review card with reviewer mode off (HOME-05)", async () => {
    await renderWithStore(<TodayScreen />, { settings: settings({ reviewerMode: false }) });
    expect(screen.queryByTestId("reviewed-count")).toBeNull();
    expect(screen.getByTestId("start-today")).toBeOnTheScreen();
  });

  it("disables Review next when everything is reviewed (EDGE-04)", async () => {
    const all = Object.fromEntries(items.map((it) => [`${it.id}|-`, mark(it.id)]));
    await renderWithStore(<TodayScreen />, { settings: settings(), reviews: all });
    expect(screen.getByTestId("review-next")).toHaveTextContent("All reviewed");
    expect(screen.getByTestId("review-next")).toBeDisabled();
  });
});

describe("Session done", () => {
  beforeEach(() => Object.assign(params, { mode: "today", right: "7", total: "10", skill: "phy.mech.vec.resultant-range", skillName: "සම්ප්‍රයුක්ත බලයේ පරාසය" }));

  it("shows the score, review progress and two equal buttons (DONE-01, DONE-04, DONE-05, DS-02)", async () => {
    await renderWithStore(<DoneScreen />, { settings: settings(), reviews: twoMarks });
    expect(screen.getByTestId("done-score")).toHaveTextContent("7 of 10 right");
    expect(screen.getByText("Reviewed 2 of 91")).toBeOnTheScreen();
    const a = screen.getByTestId("done-for-today");
    const b = screen.getByTestId("five-more");
    // Same component, same kind: identical box, so neither choice outweighs the other.
    const box = (el: typeof a) => {
      const st = StyleSheet.flatten(el.props.style);
      return { height: st.height, borderWidth: st.borderWidth, borderColor: st.borderColor, borderRadius: st.borderRadius, flex: st.flex };
    };
    expect(box(a)).toEqual(box(b));
    expect(box(a)).toMatchObject({ borderWidth: 1.5, flex: 1 });
    expect(a).not.toHaveStyle({ backgroundColor: "#F6C453" });
    expect(b).not.toHaveStyle({ backgroundColor: "#F6C453" });
  });

  it("'Done for today' goes home and '5 more' starts 5 items (DONE-02, DONE-03)", async () => {
    await renderWithStore(<DoneScreen />, { settings: settings() });
    await fireEvent.press(screen.getByTestId("done-for-today"));
    expect(router.dismissTo).toHaveBeenCalledWith("/");
    await fireEvent.press(screen.getByTestId("five-more"));
    expect(router.replace).toHaveBeenCalledWith({ pathname: "/session", params: { mode: "today", pack: "mechanics-20", size: "5" } });
  });
});

describe("Learn", () => {
  it("lists skills in Sinhala with review counts (LRN-01, LRN-04)", async () => {
    await renderWithStore(<LearnScreen />, { settings: settings(), reviews: twoMarks });
    expect(screen.getByText("සම්ප්‍රයුක්ත බලයේ පරාසය")).toBeOnTheScreen();
    expect(screen.getByText("3 items · reviewed 2")).toBeOnTheScreen();
  });

  it("shows answer counts with reviewer mode off (LRN-05)", async () => {
    await renderWithStore(<LearnScreen />, {
      settings: settings({ reviewerMode: false }),
      progress: { cursor: 1, days: {}, answers: { "phy.mech.c001": { correct: true, at: "x" } } },
    });
    expect(screen.getByText("3 questions · 1 right")).toBeOnTheScreen();
  });
});

describe("Progress", () => {
  it("guards Send with no name, then with no marks (EXP-04, EXP-05, EDGE-01)", async () => {
    const alert = jest.spyOn(Alert, "alert").mockImplementation(() => {});
    await renderWithStore(<ProgressScreen />, { settings: settings() });
    await fireEvent.press(screen.getByTestId("send-results"));
    expect(alert).toHaveBeenLastCalledWith("Add your name first", expect.any(String));
    await fireEvent.changeText(screen.getByTestId("progress-name"), "Test Reviewer");
    await fireEvent.press(screen.getByTestId("send-results"));
    expect(alert).toHaveBeenLastCalledWith("Nothing to send yet", expect.any(String));
    expect(shareExportFile).not.toHaveBeenCalled();
  });

  it("sends the file or the text with the reviewer's name (EXP-01, EXP-03)", async () => {
    await renderWithStore(<ProgressScreen />, { settings: settings({ reviewerName: "Test Reviewer " }), reviews: twoMarks });
    expect(screen.getByTestId("progress-reviewed")).toHaveTextContent(`Reviewed 2 of ${items.length}`);
    expect(screen.getByTestId("progress-reviewed-mechanics-20")).toHaveTextContent("2 of 91");
    expect(screen.getByTestId("progress-reviewed-thermal-physics-20")).toHaveTextContent("0 of 68");
    expect(screen.getByTestId("progress-flagged")).toHaveTextContent("1 with issues");
    await fireEvent.press(screen.getByTestId("send-results"));
    await waitFor(() => expect(shareExportFile).toHaveBeenCalledWith(expect.objectContaining({ "phy.mech.c001|-": expect.anything() }), "Test Reviewer"));
    await fireEvent.press(screen.getByTestId("send-text"));
    await waitFor(() => expect(shareExportText).toHaveBeenCalled());
  });

  it("resets student progress but keeps review marks (PRG-05)", async () => {
    await renderWithStore(<ProgressScreen />, {
      settings: settings(),
      reviews: twoMarks,
      progress: { cursor: 12, days: { "2026-11-07": 4 }, answers: { "phy.mech.c001": { correct: true, at: "x" } } },
    });
    await fireEvent.press(screen.getByTestId("reset-progress"));
    await waitFor(async () => {
      const s = await savedState();
      expect(s.progress).toEqual({ cursors: {}, days: {}, answers: {} });
      expect(Object.keys(s.reviews)).toHaveLength(2);
    });
  });

  it("switches reviewer mode and English (PRG-02, LANG-03)", async () => {
    await renderWithStore(<ProgressScreen />, { settings: settings() });
    await fireEvent(screen.getByTestId("toggle-reviewer-mode"), "valueChange", false);
    await fireEvent(screen.getByTestId("toggle-show-english"), "valueChange", true);
    await waitFor(async () => expect((await savedState()).settings).toMatchObject({ reviewerMode: false, showEnglish: true }));
  });
});
