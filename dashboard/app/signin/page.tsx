"use client";
// S9 Sign-in / onboarding (fake): phone OTP → details → first class → code.
import Link from "next/link";
import { useState } from "react";
import { klass } from "@/lib/data";

export default function SignIn() {
  const [step, setStep] = useState(0);
  const [phone, setPhone] = useState("");
  const [className, setClassName] = useState("Grade 13 · 2027 batch");
  const next = () => setStep((s) => s + 1);
  return (
    <div className="shell" style={{ paddingTop: 30 }}>
      <div style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--yellow)", boxShadow: "0 0 30px var(--yellow)", margin: "10px 0 18px" }} />
      {step === 0 && (
        <>
          <h1>UniKey for teachers</h1>
          <p className="lead" style={{ marginLeft: 0 }}>See what your class needs this week. Free for teachers.</p>
          <div className="card">
            <label className="note" style={{ margin: 0 }}>Mobile number</label>
            <input inputMode="tel" placeholder="07X XXX XXXX" value={phone} onChange={(e) => setPhone(e.target.value)} style={{ marginTop: 6 }} />
            <div className="actions"><button className="btn primary" disabled={phone.length < 9} onClick={next}>Send code by SMS</button></div>
          </div>
        </>
      )}
      {step === 1 && (
        <div className="card">
          <div className="title">Enter the 6-digit code</div>
          <p className="note" style={{ margin: "4px 0 10px" }}>Prototype: any 6 digits work.</p>
          <input inputMode="numeric" maxLength={6} placeholder="••••••" onChange={(e) => e.target.value.length === 6 && next()} />
        </div>
      )}
      {step === 2 && (
        <div className="card">
          <div className="title">About you</div>
          <input placeholder="Your name" style={{ marginTop: 10 }} />
          <input placeholder="School or tuition class" style={{ marginTop: 10 }} />
          <select style={{ marginTop: 10 }} defaultValue="Sinhala"><option>Sinhala</option><option>Tamil</option><option>English</option></select>
          <div className="actions"><button className="btn primary" onClick={next}>Next</button></div>
        </div>
      )}
      {step === 3 && (
        <div className="card">
          <div className="title">Name your first class</div>
          <input value={className} onChange={(e) => setClassName(e.target.value)} style={{ marginTop: 10 }} />
          <p className="note" style={{ margin: "8px 0 0" }}>You can add more classes or batches later.</p>
          <div className="actions"><button className="btn primary" onClick={next}>Create class</button></div>
        </div>
      )}
      {step === 4 && (
        <div className="card">
          <div className="kicker">{className}</div>
          <div className="title">Your class code</div>
          <div className="code">{klass.code}</div>
          <div className="body" style={{ marginTop: 6 }}>Share it in your class WhatsApp group. Joining is optional for students, and they choose what you see.</div>
          <div className="actions"><Link className="btn primary" href="/class/">Share class code</Link><Link className="btn" href="/">Go to This week</Link></div>
        </div>
      )}
    </div>
  );
}
