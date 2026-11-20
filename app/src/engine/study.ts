import {
  answer, buildContent, endSession, extend, migrate, newState, setCurrentTopic, skip, startSession,
  type Choice, type Content, type EngineEvent, type EndInfo, type SkipReason, type State, type Step,
} from "../../../engine/src/index";
import type { Pack } from "../content/pack";

export function studyContent(packs: Pack[]): Content {
  const notes: Record<string, string> = {};
  for (const pack of packs) {
    for (const item of pack.items) if (item.note_ref) notes[item.id] = item.note_ref;
  }
  return buildContent(packs, notes);
}

export function recapText(end: Pick<EndInfo, "fixedSkills" | "rightSkills">, name: (id: string) => string) {
  const names = (ids: string[]) => {
    const parts = ids.map(name);
    return parts.length > 1 ? parts.slice(0, -1).join(", ") + " and " + parts.at(-1) : parts[0];
  };
  if (end.fixedSkills?.length) return `Fixed today: ${names(end.fixedSkills)}.`;
  if (end.rightSkills?.length) return `You got ${names(end.rightSkills)} right today.`;
  return "Tomorrow starts easy.";
}

export const STUDY_KEY = "unikey/study/v1";
type Storage = {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
};
type Saved = { state: State; events: EngineEvent[] };

export class StudySession {
  private saved?: Saved;
  private queue: Promise<unknown> = Promise.resolve();

  constructor(readonly content: Content, private storage: Storage, private seed: number) {}

  private async read(): Promise<Saved> {
    if (this.saved) return this.saved;
    const text = await this.storage.getItem(STUDY_KEY);
    const raw = text === null ? null : JSON.parse(text);
    const empty = raw === null || (typeof raw === "object" && !Array.isArray(raw) && !Object.keys(raw).length);
    const state = migrate(empty ? newState("local", this.seed) : raw.state ?? raw);
    const events: EngineEvent[] = raw?.events ?? [];
    if (!Array.isArray(events)) throw new Error("Invalid saved study events");
    return this.saved = { state, events };
  }

  load(): Promise<Saved> {
    return this.queue.then(() => this.read());
  }

  private change(run: (state: State) => Step): Promise<Step> {
    const work = this.queue.then(async () => {
      const previous = await this.read();
      const step = run(previous.state);
      if (step.state !== previous.state || step.events.length) {
        const saved = { state: step.state, events: previous.events.concat(step.events) };
        await this.storage.setItem(STUDY_KEY, JSON.stringify(saved));
        this.saved = saved;
      }
      return step;
    });
    this.queue = work.then(() => undefined, () => undefined);
    return work;
  }

  start(now: number, topic?: string) {
    return this.change(state => startSession(topic ? setCurrentTopic(state, topic, "student") : state, this.content, now));
  }

  answer(card: string, choice: Choice, ms: number, now: number) {
    return this.change(state => answer(state, this.content, { card, choice, ms }, now));
  }

  skip(card: string, now: number, reason?: SkipReason, confirmed = false) {
    return this.change(state => skip(state, this.content, { card, reason, confirmed }, now));
  }

  extend(now: number) {
    return this.change(state => extend(state, this.content, now));
  }

  end(now: number) {
    return this.change(state => endSession(state, this.content, now));
  }
}
