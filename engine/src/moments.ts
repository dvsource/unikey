// Moments (spec §9): the five progress moments the engine emits for the UI. Pure detection plus the
// bookkeeping (once per key, per-session maximum, holding the strongest for the next session).
import type { Config } from "./config.js";
import { isSolid } from "./skill.js";
import type { Content, Moment, Served, State } from "./types.js";

/** Strongest first: the order of the `Moment` union. */
const ORDER: Moment["type"][] = ["section-solid", "avoided-now-done", "then-wrong-now-right", "missing-piece-fixed", "height-up"];
/** Moments worth keeping for the next session when this one is full. */
const HELD: Moment["type"][] = ["section-solid", "avoided-now-done"];

/** Once per (type, skill or section); a height-up once per skill and height reached. */
export const momentKey = (m: Moment): string =>
  m.type === "height-up" ? `height-up:${m.skill}:${m.to}` : `${m.type}:${"skill" in m ? m.skill : m.section}`;

/**
 * Moments the answer just given (`answered`, `right`) caused: `before` / `after` are the state around it and
 * `after.session.confident` says which repairs ended with the confidence card right. Strongest first;
 * moments already in `after.momentsDone` are left out. Does not change its inputs.
 */
export function detectMoments(
  before: State, after: State, content: Content, answered: Served, right: boolean, day: number, cfg: Config,
): Moment[] {
  if (!right) return [];
  const out: Moment[] = [];
  const def = content.skills[answered.skill];
  const rec = after.skills[answered.skill];
  const sec = content.sections[answered.section];
  if (sec) {
    const defs = sec.skills.filter((id) => after.skills[id] && content.skills[id]);
    const solid = defs.map((id) => isSolid(after.skills[id], content.skills[id], cfg));
    if (solid.length > 0 && solid.every(Boolean)) out.push({ type: "section-solid", section: sec.id });
    const rs = after.sections[sec.id];
    if (rs && rs.skipTotal >= cfg.moments.avoidedMinSkips) {
      const last = sec.skills.flatMap((id) => after.skills[id]?.attempts ?? []).filter((a) => a.seq > (rs.lastSkipSeq ?? -1)).sort((a, b) => a.seq - b.seq).slice(-cfg.moments.avoidedOf);
      if (last.length >= cfg.moments.avoidedOf && last.filter((a) => a.right).length >= cfg.moments.avoidedRight) {
        out.push({ type: "avoided-now-done", section: sec.id });
      }
    }
  }
  if (rec && rec.firstFailedDay !== null && rec.firstFailedHeight !== null
    && answered.height >= rec.firstFailedHeight && day - rec.firstFailedDay >= cfg.moments.thenNowMinDays) {
    out.push({ type: "then-wrong-now-right", skill: answered.skill, thenDay: rec.firstFailedDay, nowDay: day });
  }
  if (answered.reason === "repair:return" && after.session?.confident.includes(answered.skill)) {
    out.push({ type: "missing-piece-fixed", skill: answered.skill });
  }
  const was = before.skills[answered.skill];
  if (def && rec && was && rec.height > was.height) out.push({ type: "height-up", skill: answered.skill, from: was.height, to: rec.height });
  const done = new Set(after.momentsDone);
  return out.filter((m) => !done.has(momentKey(m))).sort((a, b) => ORDER.indexOf(a.type) - ORDER.indexOf(b.type));
}

/**
 * Applies `found` (strongest first) to `s`, the caller's own copy: emits up to `session.maxMoments` per
 * session (counting held ones released at session start), marks them done, and holds a dropped
 * section-solid / avoided-now-done in `pendingMoments`. Returns the moments to emit now.
 */
export function recordMoments(s: State, found: Moment[], cfg: Config): Moment[] {
  const ss = s.session!;
  const room = Math.max(0, cfg.session.maxMoments - ss.moments.length);
  const emitted = found.slice(0, room);
  const held = found.slice(room).filter((m) => HELD.includes(m.type));
  ss.moments = [...ss.moments, ...emitted];
  s.pendingMoments = [...s.pendingMoments, ...held];
  s.momentsDone = [...s.momentsDone, ...[...emitted, ...held].map(momentKey)];
  return emitted;
}

/** Held moments the new session may emit first (at most the per-session maximum); the rest stay held. */
export function releasePending(s: State, cfg: Config): Moment[] {
  const ss = s.session!;
  const out = s.pendingMoments.slice(0, Math.max(0, cfg.session.maxMoments - ss.moments.length));
  s.pendingMoments = s.pendingMoments.slice(out.length);
  ss.moments = [...ss.moments, ...out];
  return out;
}
