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
// Keep that total (or the mirrored count if a write was lost). Answers since
// then have exactly one owner and add to it, including repeat attempts.
export function withStudyAnswers<T extends AnswerProgress>(prototype: T, study?: SavedStudy): T {
  const tally = study?.tally;
  if (!tally || !Object.keys(tally.days).length) return prototype;
  const days = { ...prototype.days };
  for (const [day, { own, legacy }] of Object.entries(tally.days)) {
    days[day] = Math.max(days[day] ?? 0, legacy) + own;
  }
  const answers = { ...prototype.answers };
  for (const [card, latest] of Object.entries(tally.answers)) {
    if (!prototype.answers[card] || prototype.answers[card].at <= latest.at) answers[card] = latest;
  }
  return { ...prototype, days, answers };
}
