import { AnswerClock } from "../src/engine/answerClock";
import { cancelSkip } from "../src/engine/presentation";
import { withStudyAnswers, today, type AnswerProgress } from "../src/state/answerProgress";
import { answer, buildContent, endSession, extend, migrate, newState, setCurrentTopic, skip, startSession, type Choice } from "../../engine/src/index";
import { StudySession, STUDY_KEY, recapText, studyContent } from "../src/engine/study";
import { packs as v2Packs } from "../assets/content/index-v2";
import { packs, type Pack } from "../src/content/pack";

const editions: [string, Pack[], number][] = [
  ["v1", packs, 241], ["v2", v2Packs, 257],
];

it.each(editions)("maps each %s item, primary skill, note and variant in source order", (_edition, data, count) => {
  const content = studyContent(data);
  const items = data.flatMap(p => p.items);
  expect(items).toHaveLength(count);
  expect(Object.keys(content.cards)).toHaveLength(count - 1);
  for (const item of items) {
    if (item.id === "phy.therm.c043") {
      expect(content.cards[item.id]).toBeUndefined();
      continue;
    }
    const card = content.cards[item.id];
    expect(card).toMatchObject({ skill: item.skills[0], noteRef: item.note_ref });
    expect(card.height).toBe(item.layer === "L4" ? 3 : item.layer === "L1" || item.layer === "L2" && item.form === "F10" ? 1 : 2);
    expect(card.variants).toEqual(item.variants.map(v => v.options.map(({ correct, tag }) => tag ? { correct, tag } : { correct })));
  }
});

function memory(initial: string | null = null) {
  const values = new Map(initial === null ? [] : [[STUDY_KEY, initial]]);
  return {
    getItem: jest.fn(async (key: string) => values.get(key) ?? null),
    setItem: jest.fn(async (key: string, value: string) => { values.set(key, value); }),
  };
}

const now = Date.UTC(2026, 10, 20, 12);
const content = studyContent(packs);

it("matches direct public calls for a scripted day, including an adapter reload", async () => {
  const notes = Object.fromEntries(packs.flatMap(p => p.items.map(i => [i.id, i.note_ref!])));
  const direct = buildContent(packs, notes);
  const storage = memory();
  let app = new StudySession(content, storage, 42);
  const topic = Object.keys(content.topics)[0];
  let expected = startSession(setCurrentTopic(newState("local", 42), topic, "student"), direct, now);
  expect(await app.start(now, topic)).toEqual(expected);
  const events = [...expected.events];
  let clock = now;
  let n = 0;
  while (expected.next.kind === "card" && n < 40) {
    const { card, variant } = expected.next.card;
    const opts = direct.cards[card].variants[variant];
    const choice: Choice = n === 2 ? "dont-know" : opts.findIndex(o => o.correct === (n !== 1));
    const ms = 8000 + n * 100;
    clock += ms;
    expected = answer(expected.state, direct, { card, choice, ms }, clock);
    expect(await app.answer(card, choice, ms, clock)).toEqual(expected);
    events.push(...expected.events);
    if (n === 1) {
      app = new StudySession(content, storage, 999);
      expect(await app.load()).toEqual({ state: migrate(expected.state), events, legacyEvents: 0 });
    }
    n++;
  }
  expect(n).toBeGreaterThanOrEqual(3);
  if (expected.next.kind === "offer-extend") {
    expected = endSession(expected.state, direct, clock);
    expect(await app.end(clock)).toEqual(expected);
    events.push(...expected.events);
  }
  expect(expected.next.kind).toBe("end");
  expect(JSON.parse((await storage.getItem(STUDY_KEY))!)).toEqual({ state: expected.state, events, legacyEvents: 0 });
});

it("starts with a missing key and migrates a legacy raw v1 state", async () => {
  for (const raw of [null, "{}"]) {
    expect((await new StudySession(content, memory(raw), 3).load()).state).toEqual(migrate(newState("local", 3)));
  }
  const { pendingMoments, ladder, ...old } = newState("learner", 18);
  expect((await new StudySession(content, memory(JSON.stringify(old)), 3).load()).state).toEqual(migrate(old));
});

it.each([
  "", "   ", "{", "null", "[]", "{}", '{"v":2}', '{"v":1}',
  JSON.stringify({ ...newState("local", 3), profile: {} }),
  JSON.stringify({ state: newState("local", 3), events: {} }),
  JSON.stringify({ state: newState("local", 3), events: [null] }),
])("backs up corrupt bytes and can study after a cold reload (%#)", async raw => {
  const storage = memory(raw);
  const app = new StudySession(content, storage, 3);
  const [a, b] = await Promise.all([app.load(), app.load()]);
  expect(a).toEqual(b);
  expect(a.state).toEqual(newState("local", 3));
  const [[backup, bytes], [key]] = storage.setItem.mock.calls;
  expect(backup).toMatch(/^unikey\/study\/v1\.corrupt-\d+$/);
  expect(bytes).toBe(raw);
  expect(key).toBe(STUDY_KEY);
  const restarted = new StudySession(content, storage, 9);
  expect((await restarted.start(now)).next.kind).toBe("card");
  expect(await storage.getItem(backup)).toBe(raw);
});

it("retries a failed atomic save without adding a second start event", async () => {
  const storage = memory();
  storage.setItem.mockRejectedValueOnce(new Error("full"));
  const app = new StudySession(content, storage, 3);
  await expect(app.start(now)).rejects.toThrow("full");
  expect((await app.load()).events).toEqual([]);
  const started = await app.start(now);
  expect((await app.load()).events).toEqual(started.events);
});

it("uses all three recap lines in priority order", () => {
  const name = (id: string) => id.toUpperCase();
  expect(recapText({ fixedSkills: ["x", "y"], rightSkills: ["z"] }, name)).toBe("Fixed today: X and Y.");
  expect(recapText({ fixedSkills: [], rightSkills: ["x", "y"] }, name)).toBe("You got X and Y right today.");
  expect(recapText({ fixedSkills: [], rightSkills: [] }, name)).toBe("Tomorrow starts easy.");
});

it("starts a new local day after a cold load and prevents stale screens ending the replacement session", async () => {
  const storage = memory();
  const before = new StudySession(content, storage, 2);
  const first = await before.start(now);
  const reloaded = new StudySession(content, storage, 99);
  expect((await reloaded.load()).state.session?.served).toEqual(first.state.session?.served);
  const tomorrow = now + 86_400_000;
  const second = await reloaded.start(tomorrow);
  expect(second).toEqual(startSession(migrate(first.state), content, tomorrow));
  expect(second.events).toContainEqual(expect.objectContaining({ type: "session_end", data: expect.objectContaining({ kind: "interrupted" }) }));
  expect(second.state.day!.day).toBe(first.state.day!.day + 1);
  await expect(reloaded.end(tomorrow, before.present(first).owner)).rejects.toThrow("already closed");
  expect((await reloaded.load()).state.session?.id).toBe(second.state.session!.id);
  await reloaded.reset();
  const clean = await new StudySession(content, storage, 99).load();
  expect(clean.state.session).toBeNull();
  expect(clean.events).toEqual([]);
});

it("preserves the open card for skip confirmation and delegates the confirmed skip", async () => {
  const first = startSession(newState("local", 7), content, now);
  const served = first.state.session!.served!;
  const state = first.state;
  state.sections[served.section] = {
    skipCount: 1, skipTotal: 1, remindDay: null, lastReason: "later", dripStopped: false,
    liking: 0, returned: true, lastSkipSeq: 0, skippedLevel: served.height,
  };
  const storage = memory(JSON.stringify({ state, events: first.events }));
  const app = new StudySession(content, storage, 0);
  const pending = await app.skip(served.card, now, "later");
  expect(pending.next.kind).toBe("confirm-skip");
  expect(storage.setItem).not.toHaveBeenCalled();
  const view = app.present(pending);
  const cancelled = cancelSkip(view);
  expect(cancelled.next).toEqual({ kind: "card", card: served });
  expect(cancelled.token).toBe(view.token);
  let tick = 0;
  const clock = new AnswerClock(() => tick);
  clock.foreground(true);
  clock.show(view.token, true);
  tick += 8500;
  clock.show(view.token, false);
  tick += 60000;
  clock.show(cancelled.token, true);
  tick += 250;
  expect(clock.elapsed()).toBe(8750);
  expect(storage.setItem).not.toHaveBeenCalled();
  expect(await app.skip(served.card, now, "later", true)).toEqual(
    skip(migrate(state), content, { card: served.card, reason: "later", confirmed: true }, now));
});

it("takes or declines the same earned extension across independent reloads", async () => {
  const previous = newState("local", 7);
  for (const h of [1, 2, 3] as const) previous.profile.msByHeight[h] = Array(10).fill(20000);
  const app = new StudySession(content, memory(JSON.stringify(previous)), 7);
  let step = await app.start(now);
  let clock = now;
  for (let i = 0; step.next.kind === "card" && i < 40; i++) {
    const served = step.next.card;
    const choice = content.cards[served.card].variants[served.variant].findIndex(o => o.correct);
    clock += 9000;
    step = await app.answer(served.card, choice, 9000, clock);
  }
  expect(step.next.kind).toBe("offer-extend");
  const snapshot = JSON.stringify(await app.load());
  const accept = new StudySession(content, memory(snapshot), 1);
  expect(await accept.extend(clock)).toEqual(extend(step.state, content, clock));
  const decline = new StudySession(content, memory(snapshot), 1);
  expect((await decline.end(clock)).state.lastEnd?.kind).toBe("budget");
});

it.each(["before", "after"])("cold Progress and engine agree after a kill %s the answer write", async when => {
  const storage = memory();
  const app = new StudySession(content, storage, 7);
  const first = await app.start(now);
  if (first.next.kind !== "card") throw new Error("Expected first card");
  const { card } = first.next.card;
  const write = storage.setItem.getMockImplementation()!;
  storage.setItem.mockClear().mockImplementationOnce(async (key, value) => {
    if (when === "after") await write(key, value);
    throw new Error("process killed");
  });
  await expect(app.answer(card, "dont-know", 9000, now + 9000)).rejects.toThrow("process killed");
  expect(storage.setItem.mock.calls.map(([key]) => key)).toEqual([STUDY_KEY]);
  const snapshot = await new StudySession(content, storage, 8).load();
  const progress = withStudyAnswers({ days: {}, answers: {} } as AnswerProgress, snapshot);
  const expected = when === "after" ? 1 : 0;
  expect(snapshot.state.answered).toBe(expected);
  expect(Object.values(progress.days)).toEqual(expected ? [1] : []);
  expect(progress.answers[card]).toEqual(expected ? { correct: false, at: new Date(now + 9000).toISOString() } : undefined);
});

it("counts pre-upgrade mirrored answers once and adds new journal and prototype attempts", async () => {
  const storage = memory();
  const app = new StudySession(content, storage, 7);
  let step = await app.start(now);
  if (step.next.kind !== "card") throw new Error("Expected first card");
  const first = step.next.card.card;
  step = await app.answer(first, "dont-know", 9000, now + 9000);
  const { state, events } = await app.load();
  const upgraded = new StudySession(content, memory(JSON.stringify({ state, events })), 7);
  if (step.next.kind !== "card") throw new Error("Expected next card");
  await upgraded.answer(step.next.card.card, "dont-know", 9000, now + 18000);
  const day = today(new Date(now));
  const prototype = { days: { [day]: 2 }, answers: { fixed: { at: new Date(now).toISOString(), correct: true } } };
  const progress = withStudyAnswers(prototype, await upgraded.load());
  expect(progress.days[day]).toBe(3);
  expect(Object.keys(progress.answers).sort()).toEqual(["fixed", first, step.next.card.card].sort());
});

it("rejects an earlier token even when the replacement presents the very same card", async () => {
  const app = new StudySession(content, memory(), 7);
  const original = app.present(await app.start(now));
  await app.reset();
  const replacement = app.present(await app.start(now));
  expect(replacement.next).toEqual(original.next);
  expect(replacement.owner?.id).toBe(original.owner?.id);
  await expect(app.end(now, original.owner)).rejects.toThrow("already closed");
  if (replacement.next.kind !== "card") throw new Error("Expected first card");
  const id = replacement.next.card.card;
  await expect(app.answer(id, 0, 100, now, original.token)).rejects.toThrow("presentation has changed");
  await expect(app.skip(id, now, "later", false, original.token)).rejects.toThrow("presentation has changed");
  expect((await app.load()).state.answered).toBe(0);
  expect((await app.answer(id, 0, 100, now, replacement.token)).feedback).toBeDefined();
});
