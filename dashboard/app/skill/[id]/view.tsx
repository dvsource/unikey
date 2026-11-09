"use client";
// Skill detail (from "Open the skill"): class bar, what it needs, what it opens, top mistakes.
import Link from "next/link";
import { AssignButton } from "@/components/assign";
import { DistBar, Legend, Page, SkillLabel, STATE_LABEL } from "@/components/ui";
import { requiresOf, skillById, skillDist, tags, topErrorsForSkill, topicById, unlocksOf, type SkillState, skillHref } from "@/lib/data";

export default function SkillView({ id }: { id: string }) {
  const s = skillById[id];
  if (!s) return <Page><p>Unknown skill.</p></Page>;
  const d = skillDist(id);
  const needs = requiresOf(id).filter((x) => skillById[x]);
  const opens = unlocksOf(id).filter((x) => skillById[x]);
  const errs = topErrorsForSkill(id);
  return (
    <Page>
      <Link href="/" className="back">‹ This week</Link>
      <h1><SkillLabel id={id} /></h1>
      <p className="lead">{s.en} · {topicById[s.topic]?.ref} {topicById[s.topic]?.en}</p>
      <div className="card">
        <DistBar d={d} />
        <div className="kv" style={{ marginTop: 12 }}>
          {(Object.keys(STATE_LABEL) as SkillState[]).map((k) => (
            <span key={k} style={{ display: "contents" }}>
              <span className="k">{STATE_LABEL[k]}</span><span>{d[k]}</span>
            </span>
          ))}
        </div>
        <div className="actions"><AssignButton skillIds={[id]} primary /></div>
      </div>
      <Legend />
      {errs.length > 0 && (
        <>
          <h2>Most common mistakes</h2>
          <div className="list">
            {errs.map((e) => (
              <div key={e.tag} className="row">
                <span className="grow">
                  <span className="name">{tags[e.tag]?.meaning}</span>
                  <div className="meta">Say: “{tags[e.tag]?.message}”</div>
                </span>
                <span className="chip">{e.students} students</span>
              </div>
            ))}
          </div>
        </>
      )}
      {needs.length > 0 && (
        <>
          <h2>Needs first</h2>
          <div className="list">
            {needs.map((x) => (
              <Link key={x} href={skillHref(x)} className="row">
                <span className="grow"><SkillLabel id={x} /><DistBar d={skillDist(x)} /></span>
                <span className="end">›</span>
              </Link>
            ))}
          </div>
        </>
      )}
      {opens.length > 0 && (
        <>
          <h2>Opens up</h2>
          <div className="list">
            {opens.map((x) => (
              <Link key={x} href={skillHref(x)} className="row">
                <span className="grow"><SkillLabel id={x} /></span>
                <span className="end">›</span>
              </Link>
            ))}
          </div>
        </>
      )}
    </Page>
  );
}
