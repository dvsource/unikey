import { actionToken, present, type SessionOwner } from "./presentation";
import { decodeStudy, type SavedStudy } from "./savedStudy";
import {
  answer, buildContent, endSession, extend, newState, setCurrentTopic, skip, startSession,
  type Choice, type Content, type EndInfo, type SkipReason, type State, type Step,
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
type Saved = SavedStudy;
type Guard = symbol | SessionOwner;

export class StudySession {
  private queue: Promise<unknown> = Promise.resolve();
  private listeners = new Set<(snapshot: Saved) => void>();
  private saved?: Saved;
  private owners = new WeakMap<State, SessionOwner>();

  present(step: Step) {
    return present(step, this.owners.get(step.state));
  }

  subscribe(listener: (snapshot: Saved) => void) {
    this.listeners.add(listener);
    if (this.saved) listener(this.saved);
    return () => { this.listeners.delete(listener); };
  }

  private publish(saved: Saved) {
    const id = saved.state.session?.id;
    if (id) {
      const previous = this.saved && this.owners.get(this.saved.state);
      this.owners.set(saved.state, previous?.id === id ? previous : { id });
    }
    this.saved = saved;
    for (const listener of this.listeners) listener(saved);
    return saved;
  }

  constructor(readonly content: Content, private storage: Storage, private seed: number) {}

  private async read(): Promise<Saved> {
    if (this.saved) return this.saved;
    const text = await this.storage.getItem(STUDY_KEY);
    if (text === null) return this.publish(this.fresh());
    let decoded: Saved;
    try {
      decoded = decodeStudy(text);
    } catch {
      const prefix = STUDY_KEY + ".corrupt-" + Date.now();
      let backup = prefix;
      for (let i = 1; await this.storage.getItem(backup) !== null; i++) backup = prefix + "-" + i;
      await this.storage.setItem(backup, text);
      decoded = this.fresh();
      await this.save(decoded);
      return decoded;
    }
    return this.publish(decoded);
  }

  private fresh(): Saved {
    return { state: newState("local", this.seed), events: [], legacyEvents: 0 };
  }

  load(): Promise<Saved> {
    return this.serialize(() => this.read());
  }

  private serialize<T>(task: () => Promise<T>): Promise<T> {
    const work = this.queue.then(task);
    this.queue = work.then(() => undefined, () => undefined);
    return work;
  }

  private async save(saved: Saved) {
    await this.storage.setItem(STUDY_KEY, JSON.stringify(saved));
    this.publish(saved);
  }

  reset() {
    return this.serialize(async () => {
      await this.read(); // Preserve a corrupt cold save before an explicit reset, too.
      await this.save(this.fresh());
    });
  }

  private change(run: (state: State) => Step, guard?: Guard): Promise<Step> {
    return this.serialize(async () => {
      const previous = await this.read();
      if (typeof guard === "symbol" && guard !== actionToken(previous.state)) throw new Error("This presentation has changed.");
      if (typeof guard === "object" && this.owners.get(previous.state) !== guard) throw new Error("This study session has already closed.");
      const step = run(previous.state);
      if (step.state !== previous.state || step.events.length) {
        await this.save({ ...previous, state: step.state, events: previous.events.concat(step.events) });
      }
      return step;
    });
  }

  start(now: number, topic?: string) {
    return this.change(state => startSession(topic ? setCurrentTopic(state, topic, "student") : state, this.content, now));
  }

  answer(card: string, choice: Choice, ms: number, now: number, guard?: Guard) {
    return this.change(state => answer(state, this.content, { card, choice, ms }, now), guard);
  }

  skip(card: string, now: number, reason?: SkipReason, confirmed = false, guard?: Guard) {
    return this.change(state => skip(state, this.content, { card, reason, confirmed }, now), guard);
  }

  extend(now: number, guard?: Guard) {
    return this.change(state => extend(state, this.content, now), guard);
  }

  end(now: number, guard?: Guard) {
    return this.change(state => endSession(state, this.content, now), guard);
  }
}
