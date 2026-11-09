import { getPack, Item, items as allItems, itemsForSkill } from "../content/pack";
import { ReviewRecord, reviewedItemIds } from "./store";

// No scheduler yet: sessions are slices of the fixed play order of one unit (pack).

export const SESSION_SIZE = 10;

export type SessionMode = "today" | "review" | "skill";

export function buildSession(
  mode: SessionMode,
  opts: { pack?: string; cursor: number; reviews: Record<string, ReviewRecord>; skill?: string; start?: string; size?: number },
): Item[] {
  const size = opts.size ?? SESSION_SIZE;
  const items = (opts.pack && getPack(opts.pack)?.items) || allItems;
  if (mode === "skill" && opts.skill) {
    const list = itemsForSkill(opts.skill);
    const from = Math.max(0, list.findIndex((it) => it.id === opts.start));
    return list.slice(from);
  }
  if (mode === "review") {
    const done = reviewedItemIds(opts.reviews);
    return items.filter((it) => !done.has(it.id)).slice(0, size);
  }
  const out: Item[] = [];
  for (let i = 0; i < Math.min(size, items.length); i++) out.push(items[(opts.cursor + i) % items.length]);
  return out;
}

// A skill counts as mastered in the prototype once every item in it was last answered correctly.
export function masteredSkills(skillIds: string[], answers: Record<string, { correct: boolean }>) {
  return skillIds.filter((id) => {
    const list = itemsForSkill(id);
    return list.length > 0 && list.every((it) => answers[it.id]?.correct);
  });
}
