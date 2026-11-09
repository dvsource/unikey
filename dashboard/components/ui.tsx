"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  activeThisWeek, classReadiness, klass, skillName, skillById, students, type Dist, type SkillState,
} from "@/lib/data";
import { useStore } from "@/lib/store";

export function Toast() {
  const { toast } = useStore();
  return toast ? <div className="toast">{toast}</div> : null;
}

export function Tabs() {
  const p = usePathname();
  const tab = (href: string, label: string, match: (p: string) => boolean) => (
    <Link href={href} className={match(p) ? "on" : ""}>
      <span className="dot" />
      {label}
    </Link>
  );
  return (
    <nav className="tabs">
      {tab("/", "This week", (p) => p === "/" || p.startsWith("/skill"))}
      {tab("/topics/", "Topics", (p) => p.startsWith("/topics"))}
      {tab("/students/", "Students", (p) => p.startsWith("/students"))}
    </nav>
  );
}

export function Header() {
  const { week1, removed } = useStore();
  const joined = week1 ? 11 : students.length - removed.length;
  const active = week1 ? 3 : activeThisWeek.length;
  return (
    <header className="head">
      <div>
        <Link href="/class/" className="cls">{klass.name}</Link>
        <div className="sub">
          {joined} joined · {active} active this week
        </div>
      </div>
      <div className="ready">
        {week1 ? (
          <div className="num" style={{ color: "var(--faint)" }}>—</div>
        ) : (
          <div className="num">{classReadiness}%</div>
        )}
        <div className="lbl">practice readiness · Mechanics</div>
      </div>
    </header>
  );
}

export function Page({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="shell">
        <Header />
        {children}
      </div>
      <Tabs />
    </>
  );
}

export function SkillLabel({ id }: { id: string }) {
  const s = skillById[id];
  const hasSi = !!s?.si;
  return (
    <span className={hasSi ? "si" : ""} title={s?.en}>
      {skillName(id)}
    </span>
  );
}

const ORDER: SkillState[] = ["mastered", "practising", "learning", "fading", "not-started"];
export const STATE_LABEL: Record<SkillState, string> = {
  mastered: "Mastered",
  practising: "Practising",
  learning: "Stuck / learning",
  fading: "Fading",
  "not-started": "Not started",
};

export function DistBar({ d }: { d: Dist }) {
  const n = Object.values(d).reduce((a, b) => a + b, 0) || 1;
  return (
    <div className="bar" role="img" aria-label={ORDER.map((k) => `${STATE_LABEL[k]} ${d[k]}`).join(", ")}>
      {ORDER.map((k) => (d[k] ? <span key={k} className={`c-${k}`} style={{ width: `${(d[k] / n) * 100}%` }} /> : null))}
    </div>
  );
}

export function Legend() {
  return (
    <div className="legend">
      {ORDER.map((k) => (
        <span key={k}>
          <i className={`c-${k}`} />
          {STATE_LABEL[k]}
        </span>
      ))}
    </div>
  );
}

export function Days({ days }: { days: boolean[] }) {
  return (
    <span className="days" role="img" aria-label={`${days.filter(Boolean).length} of 7 days`}>
      {days.map((on, i) => (
        <i key={i} className={on ? "on" : ""} />
      ))}
    </span>
  );
}

export function Trend({ t }: { t: "up" | "flat" | "down" }) {
  return <span className={`trend-${t}`}>{t === "up" ? "↗" : t === "down" ? "↘" : "→"}</span>;
}

/** "Useful / Not right?" on every insight card. Logged locally as insight_feedback. */
export function Feedback({ cardId }: { cardId: string }) {
  const { feedback, set, showToast } = useStore();
  const mine = feedback.filter((f) => f.cardId === cardId).at(-1);
  const [asking, setAsking] = useState(false);
  const [note, setNote] = useState("");
  const log = (verdict: "useful" | "not-right", n?: string) => {
    set({ feedback: [...feedback, { cardId, verdict, note: n, at: new Date().toISOString() }] });
  };
  return (
    <div className="fb" style={asking ? { flexWrap: "wrap" } : undefined}>
      <span className="sp">Is this right for your class?</span>
      <button className={mine?.verdict === "useful" ? "on" : ""} onClick={() => { log("useful"); setAsking(false); showToast("Thanks. Marked useful."); }}>
        Useful
      </button>
      <button className={mine?.verdict === "not-right" ? "on" : ""} onClick={() => setAsking(true)}>
        Not right?
      </button>
      {asking && (
        <div style={{ width: "100%", marginTop: 8 }}>
          <textarea rows={2} placeholder="What's wrong? (optional) e.g. 'they can do this, the question was confusing'" value={note} onChange={(e) => setNote(e.target.value)} />
          <div className="actions" style={{ marginTop: 8 }}>
            <button className="btn small primary" onClick={() => { log("not-right", note || undefined); setAsking(false); setNote(""); showToast("Thanks. We'll check this insight."); }}>
              Send
            </button>
            <button className="btn small ghost" onClick={() => setAsking(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
