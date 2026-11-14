import { buildContent, type RawPack } from "../src/content.js";
import type { Content } from "../src/types.js";

const SKILLS: [string, string, number, string[], string[]][] = [
  ["a1", "A", 0.1, [], []],
  ["a2", "A", 0.3, ["a1"], []],
  ["b1", "B", 0.2, [], []],
  ["b2", "B", 0.4, [], ["a1"]],
];

function options(tag1: string): { correct: boolean; tag?: string }[] {
  return [{ correct: true }, { correct: false, tag: tag1 }, { correct: false, tag: "recall-gap" }, { correct: false, tag: "recall-gap" }];
}

export function fixture(opts: { drop?: string[] } = {}): Content {
  const drop = new Set(opts.drop ?? []);
  const items: RawPack["items"] = [];
  const add = (id: string, skill: string, layer: "L1" | "L2" | "L4", nVariants: number) => {
    if (drop.has(id)) return;
    const tag1 = id === "a1.h3" || id === "a1.h1.2" ? "sign-error" : "recall-gap";
    items.push({ id, layer, form: "F00", skills: [skill], variants: Array.from({ length: nVariants }, () => ({ options: options(tag1) })) });
  };
  for (const [s] of SKILLS) {
    for (let i = 1; i <= 3; i++) add(`${s}.h1.${i}`, s, "L1", 1);
    for (let i = 1; i <= 3; i++) add(`${s}.h2.${i}`, s, "L2", 1);
    add(`${s}.h3`, s, "L4", 20);
  }
  const pack: RawPack = {
    id: "fx", unit: { id: "u" }, items,
    graph: {
      skills: SKILLS.map(([id, sub, weight]) => ({ id, topic: "u.t1", subtopic: sub, weight, name: { en: id } })),
      edges: [
        { type: "requires", from: "a2", to: "a1" },
        { type: "helps", from: "b2", to: "a1" },
      ],
    },
  };
  const c = buildContent([pack]);
  c.cards["a2.h3"].noteRef = "n1";
  if (c.cards["a2.h2.2"]) c.cards["a2.h2.2"].noteRef = "n1";
  return c;
}
