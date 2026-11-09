import AsyncStorage from "@react-native-async-storage/async-storage";
import { act, render, screen } from "@testing-library/react-native";
import { Text } from "react-native";
import { StoreProvider, useStore } from "../src/state/store";
import { mark, STORE_KEY } from "./helpers";

function Probe() {
  const s = useStore();
  return <Text testID="probe">{JSON.stringify({ ready: s.ready, settings: s.settings, cursors: s.progress.cursors, reviews: Object.keys(s.reviews) })}</Text>;
}
const read = () => JSON.parse(String(screen.getByTestId("probe").props.children));

async function mount(raw: string | null) {
  await AsyncStorage.clear();
  if (raw != null) await AsyncStorage.setItem(STORE_KEY, raw);
  await render(
    <StoreProvider>
      <Probe />
    </StoreProvider>,
  );
  await act(async () => {});
}

describe("Store persistence", () => {
  it("loads a saved state and defaults missing keys (PER-03)", async () => {
    await mount(JSON.stringify({ settings: { reviewerName: "Test Reviewer", showEnglish: true }, reviews: { "phy.mech.c001|-": mark("phy.mech.c001") } }));
    expect(read()).toEqual({
      ready: true,
      settings: { showEnglish: true, reviewerMode: true, reviewerName: "Test Reviewer", unit: "" },
      cursors: {},
      reviews: ["phy.mech.c001|-"],
    });
  });

  it("starts with defaults when the saved state is corrupt (PER-04)", async () => {
    await mount("{not json");
    expect(read()).toEqual({ ready: true, settings: { showEnglish: false, reviewerMode: true, reviewerName: "", unit: "" }, cursors: {}, reviews: [] });
  });

  it("moves a pre-units single cursor to the Mechanics pack (PER-05)", async () => {
    await mount(JSON.stringify({ progress: { cursor: 12, days: {}, answers: {} } }));
    expect(read().cursors).toEqual({ "mechanics-20": 12 });
  });

  it("starts with defaults on a fresh install", async () => {
    await mount(null);
    expect(read().ready).toBe(true);
    expect(read().reviews).toEqual([]);
  });
});
