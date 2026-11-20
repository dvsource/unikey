import AsyncStorage from "@react-native-async-storage/async-storage";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import SessionScreen from "../src/app/session";
import { StoreProvider } from "../src/state/store";
import { STUDY_KEY } from "../src/engine/study";
import { adaptiveToday } from "../src/engine/enabled";

jest.mock("expo-router", () => ({
  useLocalSearchParams: () => ({ mode: "today" }), router: { back: jest.fn() },
}));

async function open() {
  await render(<SafeAreaProvider initialMetrics={{
    frame: { x: 0, y: 0, width: 390, height: 844 }, insets: { top: 0, left: 0, bottom: 0, right: 0 },
  }}><StoreProvider><SessionScreen /></StoreProvider></SafeAreaProvider>);
  await act(async () => {});
}

const original = process.env.EXPO_PUBLIC_STUDY_ENGINE;
afterEach(() => {
  if (original === undefined) delete process.env.EXPO_PUBLIC_STUDY_ENGINE;
  else process.env.EXPO_PUBLIC_STUDY_ENGINE = original;
});

it("defaults to the prototype queue and leaves the adaptive store unused", async () => {
  delete process.env.EXPO_PUBLIC_STUDY_ENGINE;
  await open();
  expect(screen.getByText("1 / 10")).toBeTruthy();
  expect(screen.queryByTestId("engine-question")).toBeNull();
  expect(await AsyncStorage.getItem(STUDY_KEY)).toBeNull();
});

it("runs Today through the engine and reveals the IDK explanation before the next step", async () => {
  process.env.EXPO_PUBLIC_STUDY_ENGINE = "1";
  expect(adaptiveToday("review")).toBe(false);
  expect(adaptiveToday("skill")).toBe(false);
  await open();
  await screen.findByTestId("engine-question");
  await fireEvent.press(screen.getByTestId("engine-idk"));
  expect(await screen.findByTestId("engine-explanation")).toBeTruthy();
  expect(screen.queryByText("Not quite")).toBeNull();
  const saved = JSON.parse((await AsyncStorage.getItem(STUDY_KEY))!);
  expect(saved.state.answered).toBe(1);
  expect(saved.events).toContainEqual(expect.objectContaining({ type: "answer", data: expect.objectContaining({ choice: "dont-know" }) }));
  await fireEvent.press(screen.getByTestId("engine-continue"));
  await screen.findByTestId("engine-stop");
  await fireEvent.press(screen.getByTestId("engine-stop"));
  await waitFor(async () => expect(JSON.parse((await AsyncStorage.getItem(STUDY_KEY))!).state.lastEnd.kind).toBe("left"));
});
