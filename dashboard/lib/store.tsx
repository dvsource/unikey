"use client";
// Prototype state, kept in the browser only (localStorage). Nothing leaves the phone.
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { klass } from "./data";

export type Feedback = { cardId: string; verdict: "useful" | "not-right"; note?: string; at: string };
export type Assignment = { skillIds: string[]; label: string; week: string; at: string };

type State = {
  teachingNow: string;
  assignments: Assignment[];
  feedback: Feedback[];
  removed: string[];
  week1: boolean; // preview the empty "week 1" state
  signedIn: boolean;
};

const initial: State = {
  teachingNow: klass.defaultTeachingNow,
  assignments: [],
  feedback: [],
  removed: [],
  week1: false,
  signedIn: true,
};

const KEY = "unikey-dashboard-p0";

type Ctx = State & {
  set: (patch: Partial<State>) => void;
  reset: () => void;
  toast: string | null;
  showToast: (t: string) => void;
};
const StoreCtx = createContext<Ctx | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(initial);
  const [toast, setToast] = useState<string | null>(null);

  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setState({ ...initial, ...JSON.parse(raw) });
    } catch {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {}
  }, [state, loaded]);

  const showToast = (t: string) => {
    setToast(t);
    setTimeout(() => setToast(null), 2600);
  };

  return (
    <StoreCtx.Provider
      value={{
        ...state,
        set: (patch) => setState((s) => ({ ...s, ...patch })),
        reset: () => setState(initial),
        toast,
        showToast,
      }}
    >
      {children}
    </StoreCtx.Provider>
  );
}

export function useStore() {
  const c = useContext(StoreCtx);
  if (!c) throw new Error("useStore outside StoreProvider");
  return c;
}
