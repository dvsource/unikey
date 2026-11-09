"use client";
// S2 Topics: one bar per topic, worst first. Tap a topic for its skills.
import Link from "next/link";
import { useEffect, useState } from "react";
import { AssignButton } from "@/components/assign";
import { DistBar, Legend, Page, SkillLabel } from "@/components/ui";
import { badness, skillDist, skills, topErrorsForSkill, topicDist, topics, tags, unitName, skillHref } from "@/lib/data";
import { useStore } from "@/lib/store";

export default function Topics() {
  const { teachingNow, week1 } = useStore();
  const [open, setOpen] = useState<string | null>(null);
  useEffect(() => {
    const h = decodeURIComponent(window.location.hash.slice(1));
    setOpen(h || teachingNow);
  }, [teachingNow]);

  const sorted = [...topics]
    .map((t) => ({ t, d: topicDist(t.id) }))
    .sort((a, b) => badness(b.d) - badness(a.d));

  if (week1) {
    return (
      <Page>
        <h1>Topics</h1>
        <div className="card empty">
          <div className="title" style={{ fontSize: 16 }}>Topic bars appear once 5 students have practised</div>
          <div className="body">Until then, the starting quick check is on This week.</div>
        </div>
      </Page>
    );
  }

  return (
    <Page>
      <h1>Topics</h1>
      <p className="lead">{unitName}, all students in the class. Worst first.</p>
      <Legend />
      <div className="list">
        {sorted.map(({ t, d }) => (
          <div key={t.id} id={t.id}>
            <button className="row" onClick={() => setOpen(open === t.id ? null : t.id)}>
              <span className="grow">
                <span className="name">{t.ref} {t.en}</span>
                {t.id === teachingNow && <span className="chip lav" style={{ marginLeft: 8, fontSize: 11 }}>teaching now</span>}
                <DistBar d={d} />
              </span>
              <span className="end">{open === t.id ? "▾" : "›"}</span>
            </button>
            {open === t.id && <TopicSkills topicId={t.id} />}
          </div>
        ))}
      </div>
      <p className="note">Bars count every student, including those who share effort only (anonymous class totals). Topic names are in English until the Sinhala names are added to the skill graph.</p>
    </Page>
  );
}

function TopicSkills({ topicId }: { topicId: string }) {
  const list = skills
    .filter((s) => s.topic === topicId && s.mastery === "practised")
    .map((s) => ({ s, d: skillDist(s.id) }))
    .sort((a, b) => badness(b.d) - badness(a.d));
  return (
    <div style={{ background: "#FAFBFF", padding: "4px 16px 14px", borderTop: "1px solid var(--hairline)" }}>
      {list.map(({ s, d }) => {
        const errs = topErrorsForSkill(s.id);
        return (
          <Link key={s.id} href={skillHref(s.id)} style={{ display: "block", padding: "10px 0", borderBottom: "1px solid var(--hairline)" }}>
            <div style={{ fontSize: 14 }}><SkillLabel id={s.id} /></div>
            <DistBar d={d} />
            {errs[0] && <div className="meta" style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>Top mistake: {tags[errs[0].tag]?.meaning} ({errs[0].students} students)</div>}
          </Link>
        );
      })}
      <div className="actions"><AssignButton topicId={topicId} label="Assign from this topic" /></div>
    </div>
  );
}
