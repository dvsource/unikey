"use client";
// S4 Student detail: only what the student shares (DR-0039). No skills before parent consent.
import Link from "next/link";
import { DistBar, Page, SkillLabel, Trend } from "@/components/ui";
import { sharesSkills, skillStates, skills, studentById, tags, topics, type Dist, skillHref } from "@/lib/data";

export default function StudentView({ id }: { id: string }) {
  const s = studentById[id];
  if (!s) return <Page><p>Unknown student.</p></Page>;
  const states = skillStates[id];
  const weak = skills.filter((k) => k.mastery === "practised" && states[k.id] === "learning").slice(0, 4);
  const fading = skills.filter((k) => states[k.id] === "fading").slice(0, 4);
  return (
    <Page>
      <Link href="/students/" className="back">‹ Students</Link>
      <h1>{s.name} <Trend t={s.trend} /></h1>
      <p className="lead">Joined {s.joined}</p>

      <div className="card">
        <div className="kicker">Effort</div>
        <div className="kv" style={{ marginTop: 8 }}>
          <span className="k">Practice days, last 4 weeks</span><span>{s.last28} of 28</span>
          <span className="k">Streak</span><span>{s.streak ? `${s.streak} days` : "—"}</span>
          <span className="k">Last practised</span><span>{s.lastSeenDays === 0 ? "today" : `${s.lastSeenDays} days ago`}</span>
        </div>
      </div>

      {!sharesSkills(s) ? (
        <div className="card empty">
          <div className="body">
            {s.sharing === "awaiting-consent"
              ? `${s.name}'s skills show here once a parent confirms consent. Until then you see practice days only.`
              : `${s.name} shares practice days only. They can change this in their app settings.`}
          </div>
        </div>
      ) : (
        <>
          <h2>Mechanics by topic</h2>
          <div className="list">
            {topics.map((t) => {
              const d: Dist = { "not-started": 0, learning: 0, practising: 0, mastered: 0, fading: 0 };
              skills.filter((k) => k.topic === t.id).forEach((k) => d[states[k.id]]++);
              return (
                <div key={t.id} className="row" style={{ display: "block" }}>
                  <div style={{ fontSize: 14 }}>{t.ref} {t.en}</div>
                  <DistBar d={d} />
                </div>
              );
            })}
          </div>
          {weak.length > 0 && (<><h2>Stuck on</h2><div className="list">{weak.map((k) => (
            <Link key={k.id} href={skillHref(k.id)} className="row"><span className="grow"><SkillLabel id={k.id} /></span><span className="end">›</span></Link>
          ))}</div></>)}
          {fading.length > 0 && (<><h2>Fading</h2><div className="names">{fading.map((k) => (
            <span key={k.id} className="chip warn"><SkillLabel id={k.id} /></span>
          ))}</div></>)}
          {s.topError && (
            <div className="card" style={{ marginTop: 14 }}>
              <div className="kicker">Mistake pattern</div>
              <div className="body" style={{ marginTop: 4 }}>
                {s.topError.share}% of {s.name}'s recent mistakes: <b style={{ color: "var(--ink)", fontWeight: 500 }}>{tags[s.topError.tag]?.meaning.toLowerCase()}</b>
              </div>
            </div>
          )}
        </>
      )}
      <p className="note">No marks or individual answers are shown, only patterns.</p>
    </Page>
  );
}
