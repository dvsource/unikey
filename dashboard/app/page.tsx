"use client";
// S1 This week (home): up to 3 action cards, then the fading line.
import Link from "next/link";
import { AssignButton } from "@/components/assign";
import { Feedback, Page, SkillLabel } from "@/components/ui";
import { insights, quietStudents, tags, topicById, week1, skillHref } from "@/lib/data";
import { useStore } from "@/lib/store";

export default function ThisWeek() {
  const { week1: early, assignments, teachingNow } = useStore();
  if (early) return <Week1 />;
  const rc = insights.rootCause;
  const mc = insights.misconception;
  const last = assignments.at(-1);
  const t = topicById[teachingNow];

  return (
    <Page>
      <h1>This week</h1>
      <p className="lead">
        Teaching now: <Link href="/class/" style={{ textDecoration: "underline" }}>{t?.ref} {t?.en}</Link>
      </p>

      {last && (
        <div className="card" style={{ background: "var(--lavender-soft)", borderColor: "transparent" }}>
          <div className="kicker">Assigned for the week of {last.week}</div>
          <div style={{ marginTop: 4 }}>
            {last.skillIds.map((id, i) => (
              <span key={id}>{i ? " · " : ""}<SkillLabel id={id} /></span>
            ))}
          </div>
        </div>
      )}

      <div className="card">
        <div className="kicker"><span className="n">1</span> Reteach the root cause</div>
        <div className="title"><SkillLabel id={rc.root} /></div>
        <div className="body">
          {rc.stuck} students are stuck on <SkillLabel id={rc.bottleneck} />. Their quick checks show
          the gap is one step earlier.
        </div>
        <div className="chain">
          <span className="node"><SkillLabel id={rc.root} /></span>
          <span className="arrow">→</span>
          <span className="node sym"><SkillLabel id={rc.bottleneck} /></span>
          <span className="arrow">→</span>
          <span className="who">{rc.stuck} students</span>
        </div>
        <div className="note" style={{ margin: "4px 0 0" }}>Based on prerequisite checks from {rc.activeChecked} students.</div>
        <div className="actions">
          <Link className="btn" href={skillHref(rc.root)}>Open the skill</Link>
          <AssignButton skillIds={[rc.root, rc.bottleneck]} primary />
        </div>
        <Feedback cardId={rc.id} />
      </div>

      <div className="card">
        <div className="kicker"><span className="n">2</span> Clear up a misconception</div>
        <div className="quote">{mc.trap}</div>
        <div className="body">
          <b style={{ color: "var(--ink)", fontWeight: 500 }}>{mc.students} students</b> chose this trap in the last {mc.days} days.
          The fix to say in class: “{tags[mc.tag].message}”
        </div>
        <div className="actions">
          <Link className="btn" href={skillHref(mc.skills[0])}>Where it shows up</Link>
          <AssignButton skillIds={mc.skills} />
        </div>
        <Feedback cardId={mc.id} />
      </div>

      <div className="card">
        <div className="kicker"><span className="n">3</span> Quiet students</div>
        <div className="title">{quietStudents.length} haven't practised for a week or more</div>
        <div className="names">
          {quietStudents.map((s) => (
            <Link key={s.id} href={`/students/${s.id}/`} className="chip warn">{s.name} · {s.lastSeenDays} days</Link>
          ))}
        </div>
        <div className="body" style={{ marginTop: 6 }}>A word in class usually works best. UniKey doesn't message them for you.</div>
        <div className="actions">
          <Link className="btn" href="/students/">See all students</Link>
        </div>
        <Feedback cardId={insights.quiet.id} />
      </div>

      <h2>Fading</h2>
      <div className="list">
        {insights.fading.map((f) => (
          <Link key={f.topic} href={`/topics/#${f.topic}`} className="row">
            <span className="grow">
              <span className="name">{topicById[f.topic].ref} {topicById[f.topic].en}</span>
              <div className="meta">{f.note} · the class is starting to forget it</div>
            </span>
            <span className="chip warn">fading</span>
          </Link>
        ))}
      </div>
      <p className="note">
        Sample digest: <Link href="/digest/" style={{ textDecoration: "underline" }}>what you'd get on WhatsApp every Sunday</Link>
      </p>
    </Page>
  );
}

function Week1() {
  return (
    <Page>
      <h1>This week</h1>
      <p className="lead">Week 1 preview: the class has only just joined.</p>
      <div className="card">
        <div className="kicker">From the starting quick check</div>
        <div className="title">Your class starts strongest in {topicById[week1.strongest].en}, weakest in {topicById[week1.weakest].en}</div>
        <div className="body">Every student does a short no-marks check when they join. This is the first picture of your class.</div>
        <div className="actions"><Link className="btn" href="/topics/">See topics</Link></div>
        <Feedback cardId="week1-placement" />
      </div>
      <div className="card empty">
        <div className="title" style={{ fontSize: 16 }}>Patterns appear once 5 students have practised</div>
        <div className="body">{week1.practised} of {week1.joined} have practised so far. Root causes, misconceptions and quiet students show up here after that.</div>
      </div>
      <div className="card">
        <div className="kicker">Get more students in</div>
        <div className="body">Share your class code in the class WhatsApp group.</div>
        <div className="actions"><Link className="btn primary" href="/class/">Share class code</Link></div>
      </div>
    </Page>
  );
}
