// T126: why a card was picked, in words, for logs and the engine playground. The student never sees it.
import { gradeOf } from "./skill.js";
import type { Content, Served, State } from "./types.js";

const cap = (x: string) => x.charAt(0).toUpperCase() + x.slice(1);
const ago = (n: number) => (n <= 0 ? "today" : n === 1 ? "1 day ago" : `${n} days ago`);

/**
 * The reason for `sv`, read from the state it is served from (`s.session.repair` for a repair card) on day `day`.
 * One short line, such as "due: Good 3 days ago" or "repair after Again on Newton's 2nd law: an easier piece".
 */
export function whyOf(s: State, content: Content, sv: Served, day: number): string {
  const name = (id: string) => content.skills[id]?.name ?? id;
  const rep = s.session?.repair ?? null;
  switch (sv.reason) {
    case "repair:missing-piece": {
      if (!rep) return "repair: an easier piece";
      const from = rep.carried ? " (carried from the last session)" : "";
      return rep.skill === sv.skill
        ? `repair after Again on ${name(rep.skill)}: an easier piece${from}`
        : `repair after Again on ${name(rep.skill)}: ${name(sv.skill)}, a piece it builds on${from}`;
    }
    case "repair:confidence": return `repair: an easy card on ${name(sv.skill)} to rebuild confidence`;
    case "repair:return": return `return: ${name(sv.skill)} went wrong earlier; checking it is fixed`;
    case "due-review": {
      const rec = s.skills[sv.skill];
      const last = rec?.attempts.at(-1);
      if (!last) return "due: back for review";
      return `due: ${cap(gradeOf(last))} ${ago(day - last.day)}`;
    }
    case "new:exam-weight": return `new: exam weight ${content.skills[sv.skill]?.weight ?? "?"}`;
    case "new:class-topic": return "new: the class is on this topic";
    case "side-door": return "side door: a skipped section comes back gently";
    case "skipped-drip": return "drip: one very easy card from a skipped section";
    case "comfort-correction": return "easier: recent answers went worse than planned";
    case "stretch:up": return "stretch: today is going well, one level up";
    case "open:liked": return "opening: a section that goes well for you";
    case "open:easy": return "opening easy: the last session had few right answers";
    case "close:winnable": return "closing: an easy card to end on";
    case "extend:liked": return "one of the \"5 more\" cards";
    case "comeback:solid": return "comeback: a skill you were solid on";
    case "fallback:any": return "fallback: nothing planned was left";
  }
}
