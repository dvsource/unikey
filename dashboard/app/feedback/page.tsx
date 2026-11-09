"use client";
// Prototype only: the teacher's "Useful / Not right?" taps, to send back to us.
import Link from "next/link";
import { useStore } from "@/lib/store";

export default function FeedbackLog() {
  const { feedback } = useStore();
  const text = JSON.stringify(feedback, null, 1);
  return (
    <div className="shell" style={{ paddingTop: 16 }}>
      <Link href="/class/" className="back">‹ Class setup</Link>
      <h1>Your feedback</h1>
      <p className="lead" style={{ marginLeft: 0 }}>Your taps on “Useful” and “Not right?”, kept only on this phone. Send them to us on WhatsApp.</p>
      <div className="list">
        {feedback.length === 0 && <div className="row"><span className="meta">Nothing yet.</span></div>}
        {feedback.map((f, i) => (
          <div key={i} className="row">
            <span className="grow">
              <span className="name">{f.verdict === "useful" ? "Useful" : "Not right"}</span> · {f.cardId}
              {f.note && <div className="meta">“{f.note}”</div>}
            </span>
          </div>
        ))}
      </div>
      <div className="actions">
        <a className="btn primary" href={`https://wa.me/?text=${encodeURIComponent("UniKey dashboard feedback\n" + text)}`} target="_blank" rel="noreferrer">Send on WhatsApp</a>
      </div>
    </div>
  );
}
