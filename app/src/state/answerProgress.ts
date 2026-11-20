import type { SavedStudy } from "../engine/savedStudy";

export type AnswerProgress = {
  days: Record<string, number>;
  answers: Record<string, { correct: boolean; at: string }>;
};

export function today(d = new Date()) {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

// Old releases also counted adaptive answers in the prototype's daily total.
// Keep that total (or the journal count if a write was lost). New journal
// entries have exactly one owner and add to it, including repeat attempts.
export function withStudyAnswers<T extends AnswerProgress>(prototype: T, study?: SavedStudy): T {
  if (!study?.events.length) return prototype;
  const days = { ...prototype.days };
  const answers = { ...prototype.answers };
  const mirrored: Record<string, number> = {};
  study.events.forEach((event, index) => {
    if (event.type !== "answer") return;
    const card = event.data.card as string;
    const at = new Date(event.at);
    const day = today(at);
    if (index < study.legacyEvents) {
      mirrored[day] = (mirrored[day] ?? 0) + 1;
      days[day] = Math.max(days[day] ?? 0, mirrored[day]);
    } else {
      days[day] = (days[day] ?? 0) + 1;
    }
    const timestamp = at.toISOString();
    if (!prototype.answers[card] || prototype.answers[card].at <= timestamp) {
      answers[card] = { correct: event.data.right as boolean, at: timestamp };
    }
  });
  return { ...prototype, days, answers };
}
