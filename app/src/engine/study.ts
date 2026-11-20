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
    const data = raw !== null && typeof raw === "object" && "state" in raw ? raw.state : raw;
    const empty = data === null || (typeof data === "object" && !Array.isArray(data) && !Object.keys(data).length);
    const state = migrate(empty ? newState("local", this.seed) : data);
    const events: EngineEvent[] = raw?.events ?? [];
    if (!Array.isArray(events)) throw new Error("Invalid saved study events");
    return this.saved = { state, events };
  }

  load(): Promise<Saved> {
    return this.queue.then(() => this.read());
  }

  private serialize<T>(task: () => Promise<T>): Promise<T> {
    const work = this.queue.then(task);
    this.queue = work.then(() => undefined, () => undefined);
    return work;
  }

  private async save(saved: Saved) {
    await this.storage.setItem(STUDY_KEY, JSON.stringify(saved));
    this.saved = saved;
  }

  reset() {
    return this.serialize(() => this.save({ state: newState("local", this.seed), events: [] }));
  }

  private change(run: (state: State) => Step, session?: string): Promise<Step> {
    return this.serialize(async () => {
      const previous = await this.read();
      if (session && previous.state.session?.id !== session) throw new Error("This study session has already closed.");
      const step = run(previous.state);
      if (step.state !== previous.state || step.events.length) {
        await this.save({ state: step.state, events: previous.events.concat(step.events) });
      }
      return step;
    });
  }

  start(now: number, topic?: string) {
    return this.change(state => startSession(topic ? setCurrentTopic(state, topic, "student") : state, this.content, now));
  }

  answer(card: string, choice: Choice, ms: number, now: number, session?: string) {
    return this.change(state => answer(state, this.content, { card, choice, ms }, now), session);
  }

  skip(card: string, now: number, reason?: SkipReason, confirmed = false, session?: string) {
    return this.change(state => skip(state, this.content, { card, reason, confirmed }, now), session);
  }

  extend(now: number, session?: string) {
    return this.change(state => extend(state, this.content, now), session);
  }

  end(now: number, session?: string) {
    return this.change(state => endSession(state, this.content, now), session);
  }
}
