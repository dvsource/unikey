import { today, withStudyAnswers } from "./answerProgress";
import { deviceSession } from "../engine/device";
import { STUDY_KEY } from "../engine/study";
import type { SavedStudy } from "../engine/savedStudy";
import { studyEnabled } from "../engine/enabled";
export { today } from "./answerProgress";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

// Everything the prototype remembers, on this device only. No backend.

export type Issue = "wrong-physics" | "bad-sinhala" | "bad-distractor" | "other";

export type ReviewRecord = {
  item_id: string;
  variant_id: string | null;
  variant_values?: Record<string, number | string>;
  item_version: number;
  spec_version: string;
  pack: string;
  verdict: "ok" | "issues";
  issues: Issue[];
  distractors: { index: number; letter: string; text_en: string; text_si?: string; tag?: string }[];
  note: string;
  reviewer: string;
  timestamp: string;
};

type State = {
  settings: { showEnglish: boolean; reviewerMode: boolean; reviewerName: string; unit: string };
  progress: {
    cursors: Record<string, number>; // pack id → next item for Today in that unit
    days: Record<string, number>; // yyyy-mm-dd → items answered
    answers: Record<string, { correct: boolean; at: string }>;
  };
  reviews: Record<string, ReviewRecord>; // key: item_id|variant_id
};

const initial: State = {
  settings: { showEnglish: false, reviewerMode: true, reviewerName: "", unit: "" }, // unit "" = first pack
  progress: { cursors: {}, days: {}, answers: {} },
  reviews: {},
};

const KEY = "unikey/prototype/v1";
const LEGACY_PACK = "mechanics-20";

export const reviewKey = (itemId: string, variantId: string | null) => `${itemId}|${variantId ?? "-"}`;

type Store = State & {
  ready: boolean;
  setSettings: (s: Partial<State["settings"]>) => void;
  recordAnswer: (itemId: string, correct: boolean) => void;
  setCursor: (pack: string, n: number) => void;
  saveReview: (r: ReviewRecord) => void;
  clearReview: (key: string) => void;
  resetProgress: () => void;
};

const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(initial);
  const [ready, setReady] = useState(false);
  const loaded = useRef(false);

  const [study, setStudy] = useState<SavedStudy>();
  useEffect(() => {
    let mounted = true;
    let unsubscribe: (() => void) | undefined;
    async function observe() {
      // Show previous adaptive answers even when the next session uses the prototype.
      if (!studyEnabled() && await AsyncStorage.getItem(STUDY_KEY) === null) return;
      if (!mounted) return;
      const session = deviceSession();
      unsubscribe = session.subscribe(setStudy);
      await session.load();
    }
    void observe().catch(() => {});
    return () => { mounted = false; unsubscribe?.(); };
  }, []);
  const progress = useMemo(() => withStudyAnswers(state.progress, study), [state.progress, study]);

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((raw) => {
        if (raw) {
          const saved = JSON.parse(raw) as Partial<State> & { progress?: { cursor?: number } };
          const { cursor, ...progress } = (saved.progress ?? {}) as Partial<State["progress"]> & { cursor?: number };
          // Before units, one cursor walked the single Mechanics pack.
          const cursors = progress.cursors ?? (typeof cursor === "number" ? { [LEGACY_PACK]: cursor } : {});
          setState({
            settings: { ...initial.settings, ...saved.settings },
            progress: { ...initial.progress, ...progress, cursors },
            reviews: saved.reviews ?? {},
          });
        }
      })
      .catch(() => {})
      .finally(() => {
        loaded.current = true;
        setReady(true);
      });
  }, []);

  useEffect(() => {
    if (loaded.current) AsyncStorage.setItem(KEY, JSON.stringify(state)).catch(() => {});
  }, [state]);

  const setSettings = useCallback(
    (s: Partial<State["settings"]>) => setState((st) => ({ ...st, settings: { ...st.settings, ...s } })),
    [],
  );
  const recordAnswer = useCallback((itemId: string, correct: boolean) => {
    const at = new Date().toISOString();
    const day = today();
    setState((st) => ({
      ...st,
      progress: {
        ...st.progress,
        days: { ...st.progress.days, [day]: (st.progress.days[day] ?? 0) + 1 },
        answers: { ...st.progress.answers, [itemId]: { correct, at } },
      },
    }));
  }, []);
  const setCursor = useCallback(
    (pack: string, n: number) =>
      setState((st) => ({ ...st, progress: { ...st.progress, cursors: { ...st.progress.cursors, [pack]: n } } })),
    [],
  );
  const saveReview = useCallback(
    (r: ReviewRecord) =>
      setState((st) => ({ ...st, reviews: { ...st.reviews, [reviewKey(r.item_id, r.variant_id)]: r } })),
    [],
  );
  const clearReview = useCallback(
    (key: string) =>
      setState((st) => {
        const reviews = { ...st.reviews };
        delete reviews[key];
        return { ...st, reviews };
      }),
    [],
  );
  const resetProgress = useCallback(() => setState((st) => ({ ...st, progress: initial.progress })), []);

  const value = useMemo(
    () => ({ ...state, progress, ready, setSettings, recordAnswer, setCursor, saveReview, clearReview, resetProgress }),
    [state, progress, ready, setSettings, recordAnswer, setCursor, saveReview, clearReview, resetProgress],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const s = useContext(Ctx);
  if (!s) throw new Error("useStore outside StoreProvider");
  return s;
}

// Days in a row with at least one answer, ending today (or yesterday, so the
// streak isn't shown as lost before today's session).
export function streak(days: Record<string, number>) {
  const d = new Date();
  if (!days[today(d)]) d.setDate(d.getDate() - 1);
  let n = 0;
  while (days[today(d)]) {
    n++;
    d.setDate(d.getDate() - 1);
  }
  return n;
}

export function reviewedItemIds(reviews: Record<string, ReviewRecord>) {
  return new Set(Object.values(reviews).map((r) => r.item_id));
}
