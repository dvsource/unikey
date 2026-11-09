"use client";
import { useState } from "react";
import { klass, skills, students, topicById } from "@/lib/data";
import { useStore } from "@/lib/store";
import { SkillLabel } from "./ui";

/** S6 Assign: a bottom sheet. Students see it as a recommendation in their queue and can skip it. */
export function AssignButton({ skillIds, topicId, label = "Assign as practice", primary }: {
  skillIds?: string[]; topicId?: string; label?: string; primary?: boolean;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button className={`btn ${primary ? "primary" : ""}`} onClick={() => setOpen(true)}>{label}</button>
      {open && <AssignSheet preset={skillIds} topicId={topicId} onClose={() => setOpen(false)} />}
    </>
  );
}

function AssignSheet({ preset, topicId, onClose }: { preset?: string[]; topicId?: string; onClose: () => void }) {
  const { teachingNow, assignments, removed, set, showToast } = useStore();
  const topic = topicId ?? teachingNow;
  // Suggested skills first, then the rest of the topic.
  const options = skills
    .filter((s) => s.topic === topic && s.mastery === "practised")
    .sort((a, b) => Number((preset ?? []).includes(b.id)) - Number((preset ?? []).includes(a.id)));
  const [picked, setPicked] = useState<string[]>(preset ?? []);
  const reach = students.length - removed.length;
  const toggle = (id: string) => setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  const extra = (preset ?? []).filter((id) => !options.some((o) => o.id === id));

  return (
    <div className="scrim" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <h3>This week's practice</h3>
        <p className="note" style={{ margin: "0 0 10px" }}>
          Week of {klass.weekOf}. It goes to the top of each student's daily queue as
          “This week in class”. No notification, and students can skip it.
        </p>
        {[...extra.map((id) => ({ id })), ...options].map((s) => (
          <label key={s.id} className="check">
            <input type="checkbox" checked={picked.includes(s.id)} onChange={() => toggle(s.id)} />
            <SkillLabel id={s.id} />
          </label>
        ))}
        <p className="note">Topic: {topicById[topic]?.ref} {topicById[topic]?.en}</p>
        <div className="actions">
          <button
            className="btn primary"
            disabled={!picked.length}
            onClick={() => {
              set({ assignments: [...assignments, { skillIds: picked, label: `${picked.length} skill${picked.length > 1 ? "s" : ""}`, week: klass.weekOf, at: new Date().toISOString() }] });
              showToast(`Assigned to ${reach} students for this week`);
              onClose();
            }}
          >
            Assign to {reach} students
          </button>
          <button className="btn ghost" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
