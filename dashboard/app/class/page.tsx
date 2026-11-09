"use client";
// S5 Class setup: code + QR, share text, "Teaching now", roster. Plus prototype controls.
import Link from "next/link";
import qrcode from "qrcode-generator";
import { useMemo, useState } from "react";
import { Page } from "@/components/ui";
import { klass, students, teacher, topics } from "@/lib/data";
import { useStore } from "@/lib/store";

const joinUrl = `https://unikey.example/join/${klass.code}`;
const shareText = `Physics practice for our class 📘\nIf you'd like a short daily practice plan, join with my class code: ${klass.code}\n${joinUrl}\nOptional. You choose what I can see.`;

export default function ClassSetup() {
  const st = useStore();
  const [copied, setCopied] = useState(false);
  const qr = useMemo(() => {
    const q = qrcode(0, "M");
    q.addData(joinUrl);
    q.make();
    return q.createSvgTag({ cellSize: 4, margin: 0, scalable: true });
  }, []);
  const roster = students.filter((s) => !st.removed.includes(s.id));

  return (
    <Page>
      <h1>Class setup</h1>
      <p className="lead">{teacher.name} · {teacher.school}</p>

      <div className="card" style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
        <div className="qr" dangerouslySetInnerHTML={{ __html: qr }} />
        <div style={{ flex: 1, minWidth: 160 }}>
          <div className="kicker">Class code</div>
          <div className="code">{klass.code}</div>
          <div className="actions">
            <a className="btn primary" href={`https://wa.me/?text=${encodeURIComponent(shareText)}`} target="_blank" rel="noreferrer">Share on WhatsApp</a>
            <button className="btn small ghost" onClick={async () => { try { await navigator.clipboard.writeText(shareText); setCopied(true); } catch {} }}>
              {copied ? "Copied" : "Copy text"}
            </button>
          </div>
        </div>
      </div>

      <h2>Teaching now</h2>
      <div className="card">
        <div className="body" style={{ marginBottom: 8 }}>Students' daily practice leans toward this topic. Change it when you move on.</div>
        <select aria-label="Teaching now" value={st.teachingNow} onChange={(e) => { st.set({ teachingNow: e.target.value }); st.showToast("Teaching now updated"); }}>
          {topics.map((t) => <option key={t.id} value={t.id}>{t.ref} {t.en}</option>)}
        </select>
      </div>

      <h2>Students who joined ({roster.length})</h2>
      <div className="list">
        {roster.map((s) => (
          <div key={s.id} className="row">
            <span className="grow">
              <span className="name">{s.name}</span>
              <div className="meta">
                Joined {s.joined} · {s.sharing === "effort+skills" ? "shares effort + skills" : s.sharing === "effort" ? "shares effort only" : "waiting for parent consent"}
              </div>
            </span>
            <button className="btn small ghost" onClick={() => { if (confirm(`Remove ${s.name} from this class? (prototype only)`)) st.set({ removed: [...st.removed, s.id] }); }}>Remove</button>
          </div>
        ))}
      </div>
      <p className="note">Students give the name you know them by when they join. They see exactly what you can see.</p>

      <h2>Prototype controls</h2>
      <div className="card">
        <label className="check" style={{ borderTop: 0 }}>
          <input type="checkbox" checked={st.week1} onChange={(e) => st.set({ week1: e.target.checked })} />
          <span>Preview week 1 (only 3 students have practised)</span>
        </label>
        <div className="actions">
          <Link className="btn small" href="/signin/">Sign-in flow</Link>
          <Link className="btn small" href="/digest/">Sunday digest</Link>
          <Link className="btn small" href="/feedback/">Your feedback ({st.feedback.length})</Link>
          <button className="btn small ghost" onClick={() => { st.reset(); st.showToast("Prototype reset"); }}>Reset</button>
        </div>
      </div>
    </Page>
  );
}
