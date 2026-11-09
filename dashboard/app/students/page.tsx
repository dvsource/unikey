"use client";
// S3 Students: quiet ones on top, the rest by name. Never sorted by score.
import Link from "next/link";
import { Days, Page, Trend } from "@/components/ui";
import { students, type Student } from "@/lib/data";
import { useStore } from "@/lib/store";

function SharingChip({ s }: { s: Student }) {
  if (s.sharing === "awaiting-consent") return <span className="chip">waiting for parent consent</span>;
  if (s.sharing === "effort") return <span className="chip">shares effort only</span>;
  return null;
}

export default function Students() {
  const { removed } = useStore();
  const list = students.filter((s) => !removed.includes(s.id));
  const quiet = list.filter((s) => s.lastSeenDays >= 7);
  const rest = list.filter((s) => s.lastSeenDays < 7).sort((a, b) => a.name.localeCompare(b.name));
  const row = (s: Student) => (
    <Link key={s.id} href={`/students/${s.id}/`} className="row">
      <span className="grow">
        <span className="name">{s.name}</span> <Trend t={s.trend} />
        <div className="meta">
          {s.lastSeenDays >= 7 ? `Quiet for ${s.lastSeenDays} days` : s.streak ? `${s.streak}-day streak` : `Last practised ${s.lastSeenDays} days ago`}
          {" "}<SharingChip s={s} />
        </div>
      </span>
      <Days days={s.daysThisWeek} />
      <span className="end">›</span>
    </Link>
  );
  return (
    <Page>
      <h1>Students</h1>
      <p className="lead">Bars show practice days this week, Monday to Sunday.</p>
      {quiet.length > 0 && (<><h2>Quiet · a word in class helps</h2><div className="list">{quiet.map(row)}</div></>)}
      <h2>Everyone else</h2>
      <div className="list">{rest.map(row)}</div>
    </Page>
  );
}
