import { answer, buildContent, endSession, migrate, newState, setCurrentTopic, startSession, type Choice } from "../../engine/src/index";
import { StudySession, STUDY_KEY, recapText, studyContent } from "../src/engine/study";
import { packs, type Pack } from "../src/content/pack";

const editions: [string, Pack[], number][] = [
  ["v1", packs, 241], ["v2", require("../assets/content/index-v2").packs, 257],
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
  let text = initial;
  return {
    getItem: jest.fn(async (_key: string) => text),
    setItem: jest.fn(async (_key: string, value: string) => { text = value; }),
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
      expect(await app.load()).toEqual({ state: migrate(expected.state), events });
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
  expect(JSON.parse((await storage.getItem(STUDY_KEY))!)).toEqual({ state: expected.state, events });
});

it("migrates an empty record and a legacy v1 state, and preserves unreadable saves", async () => {
  for (const raw of [null, "{}"]) {
    expect((await new StudySession(content, memory(raw), 3).load()).state).toEqual(migrate(newState("local", 3)));
  }
  const { pendingMoments, ladder, ...old } = newState("learner", 18);
  expect((await new StudySession(content, memory(JSON.stringify(old)), 3).load()).state).toEqual(migrate(old));
  const storage = memory('{"v":2}');
  await expect(new StudySession(content, storage, 3).start(now)).rejects.toThrow();
  expect(storage.setItem).not.toHaveBeenCalled();
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
