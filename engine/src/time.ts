import { defaultConfig } from "./config.js";

export const DAY_MS = 86_400_000;

/** Day number in Sri Lanka time (UTC+5:30). `now` is epoch ms. */
export function dayOf(now: number): number {
  return Math.floor((now + defaultConfig.tzOffsetMinutes * 60_000) / DAY_MS);
}
