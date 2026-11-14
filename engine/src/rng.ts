export type Rng = { seed: number; n: number };

/** mulberry32 over seed + n. Returns a value in [0, 1) and the advanced state. */
export function next(rng: Rng): [number, Rng] {
  let t = (rng.seed + rng.n + 0x6d2b79f5) >>> 0;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  const value = ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  return [value, { seed: rng.seed, n: rng.n + 1 }];
}
