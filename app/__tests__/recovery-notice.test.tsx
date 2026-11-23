import AsyncStorage from "@react-native-async-storage/async-storage";
import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import SessionScreen from "../src/app/session";
import { StoreProvider } from "../src/state/store";
import { STUDY_KEY } from "../src/engine/study";

jest.mock("expo-router", () => ({
  useIsFocused: () => true, useLocalSearchParams: () => ({ mode: "today" }), router: { back: jest.fn() },
}));

const original = process.env.EXPO_PUBLIC_STUDY_ENGINE;
afterEach(() => {
  if (original === undefined) delete process.env.EXPO_PUBLIC_STUDY_ENGINE;
  else process.env.EXPO_PUBLIC_STUDY_ENGINE = original;
});

it("tells the student once when an unreadable save was replaced", async () => {
  process.env.EXPO_PUBLIC_STUDY_ENGINE = "1";
  await AsyncStorage.setItem(STUDY_KEY, "{");
  await render(<SafeAreaProvider initialMetrics={{
    frame: { x: 0, y: 0, width: 390, height: 844 }, insets: { top: 0, left: 0, bottom: 0, right: 0 },
  }}><StoreProvider><SessionScreen /></StoreProvider></SafeAreaProvider>);
  await act(async () => {});
  await screen.findByTestId("engine-question");
  expect(screen.getByTestId("engine-recovered")).toBeTruthy();
  const keys = await AsyncStorage.getAllKeys();
  expect(keys.some(k => k.startsWith(STUDY_KEY + ".corrupt-"))).toBe(true);
  await fireEvent.press(screen.getByTestId("engine-idk"));
  await fireEvent.press(await screen.findByTestId("engine-continue"));
  expect(screen.queryByTestId("engine-recovered")).toBeNull();
});
