import AsyncStorage from "@react-native-async-storage/async-storage";
import { act, render } from "@testing-library/react-native";
import { ReactElement, ReactNode } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ReviewRecord, StoreProvider, useStore } from "../src/state/store";

export const STORE_KEY = "unikey/prototype/v1";
const metrics = { frame: { x: 0, y: 0, width: 390, height: 844 }, insets: { top: 0, left: 0, right: 0, bottom: 0 } };

// Like the root layout's Gate: screens mount only once the saved state has loaded.
function Ready({ children }: { children: ReactNode }) {
  return useStore().ready ? <>{children}</> : null;
}

// Seeds AsyncStorage, then renders inside the app's providers and lets the store load.
export async function renderWithStore(ui: ReactElement, saved?: object) {
  await AsyncStorage.clear();
  if (saved) await AsyncStorage.setItem(STORE_KEY, JSON.stringify(saved));
  await render(
    <SafeAreaProvider initialMetrics={metrics}>
      <StoreProvider>
        <Ready>{ui}</Ready>
      </StoreProvider>
    </SafeAreaProvider>,
  );
  await act(async () => {});
}

export async function savedState() {
  return JSON.parse((await AsyncStorage.getItem(STORE_KEY)) ?? "{}");
}

export function mark(item_id: string, over: Partial<ReviewRecord> = {}): ReviewRecord {
  return {
    item_id,
    variant_id: null,
    item_version: 1,
    spec_version: "0.5",
    pack: "mechanics-20",
    verdict: "ok",
    issues: [],
    distractors: [],
    note: "",
    reviewer: "Test Reviewer",
    timestamp: "2026-11-07T10:00:00Z",
    ...over,
  };
}
