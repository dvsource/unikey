import AsyncStorage from "@react-native-async-storage/async-storage";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import SessionScreen from "../src/app/session";
import { items, mistakeMessage } from "../src/content/pack";
import { StoreProvider } from "../src/state/store";

jest.mock("expo-router", () => ({
  useLocalSearchParams: () => ({ mode: "today" }),
  router: { back: jest.fn(), replace: jest.fn(), push: jest.fn(), navigate: jest.fn() },
}));

const metrics = { frame: { x: 0, y: 0, width: 390, height: 844 }, insets: { top: 0, left: 0, right: 0, bottom: 0 } };

async function renderSession() {
  await render(
    <SafeAreaProvider initialMetrics={metrics}>
      <StoreProvider>
        <SessionScreen />
      </StoreProvider>
    </SafeAreaProvider>,
  );
  await act(async () => {}); // let the store load from AsyncStorage
}

beforeEach(async () => {
  await AsyncStorage.clear();
});

const first = items[0];
const options = first.variants[0].options;
const wrongIndex = options.findIndex((o) => !o.correct);

it("shows the mistake's student message after a wrong answer", async () => {
  await renderSession();
  expect(screen.queryByTestId("feedback")).toBeNull();

  await fireEvent.press(screen.getByTestId(`option-${wrongIndex}`));

  expect(screen.getByTestId("feedback")).toBeTruthy();
  const message = mistakeMessage(options[wrongIndex])!;
  expect(screen.getByText(message.text.si ?? message.text.en)).toBeTruthy();
  expect(screen.getByText(first.explanation.si!)).toBeTruthy();
});

it("saves a reviewer mark on the phone", async () => {
  await renderSession();
  await fireEvent.press(screen.getByTestId(`option-${wrongIndex}`));
  await fireEvent.press(screen.getByTestId("review-open-sheet"));

  await fireEvent.changeText(screen.getByTestId("review-name"), "Test Reviewer");
  await fireEvent.press(screen.getByTestId("review-bad-distractor"));
  await fireEvent.press(screen.getByTestId(`review-distractor-${wrongIndex}`));
  await fireEvent.changeText(screen.getByTestId("review-note"), "Too easy to rule out");
  await fireEvent.press(screen.getByTestId("review-save"));

  expect(await screen.findByText("Reviewed · issues")).toBeTruthy();
  await waitFor(async () => {
    const saved = JSON.parse((await AsyncStorage.getItem("unikey/prototype/v1")) ?? "{}");
    expect(saved.reviews?.[`${first.id}|-`]).toMatchObject({
      item_id: first.id,
      variant_id: null,
      spec_version: "0.5",
      verdict: "issues",
      issues: ["bad-distractor"],
      distractors: [expect.objectContaining({ index: wrongIndex, text_en: options[wrongIndex].text.en })],
      note: "Too easy to rule out",
      reviewer: "Test Reviewer",
    });
    expect(saved.settings.reviewerName).toBe("Test Reviewer");
  });
});
