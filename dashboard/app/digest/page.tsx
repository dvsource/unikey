"use client";
// S8 Sunday digest, as it would arrive on WhatsApp (sent by hand in the pilot).
import Link from "next/link";
import { classReadiness, activeThisWeek, insights, klass, quietStudents, skillName, students } from "@/lib/data";

export default function Digest() {
  const rc = insights.rootCause;
  const mc = insights.misconception;
  return (
    <div className="shell" style={{ paddingTop: 16 }}>
      <Link href="/" className="back">‹ Dashboard</Link>
      <h1>Sunday digest</h1>
      <p className="lead" style={{ marginLeft: 0 }}>Sent every Sunday evening on WhatsApp. In the pilot it's sent by hand.</p>
      <div className="wa-ground">
        <div className="wa">
{`☀️ UniKey · ${klass.name}
${activeThisWeek.length} of ${students.length} practised this week · practice readiness ${classReadiness}%

This week:
1️⃣ Reteach ${skillName(rc.root)}: it's why ${rc.stuck} students are stuck on ${skillName(rc.bottleneck)}
2️⃣ ${mc.students} students think "${mc.trap}"
3️⃣ ${quietStudents.length} quiet students: ${quietStudents.map((s) => s.name).join(", ")}

`}<Link href="/">Open your class →</Link>{`

Quick check-in: did you use anything last week? What was missing? Just reply here 🙏`}
        </div>
      </div>
    </div>
  );
}
