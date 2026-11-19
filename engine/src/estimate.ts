import { defaultConfig, type Config } from "./config.js";
import type { Height, State } from "./types.js";

export function priorOf(height: Height, cfg: Config): number {
  return height === 1 ? cfg.priors.h1 : height === 2 ? cfg.priors.h2 : cfg.priors.h3;
}

/**
 * The student's own success rate at `height` over their last `window.cards` attempts across all skills,
 * when there are at least `estimate.minOwnPrior` of them; otherwise the configured prior.
 */
export function ownPrior(state: State, height: Height, cfg: Config): number {
  const all = Object.keys(state.skills).sort()
    .flatMap((k) => state.skills[k].attempts.filter((a) => a.height === height))
    .sort((x, y) => x.seq - y.seq); // stable: ties keep skill-id order
  const last = all.slice(-cfg.window.cards);
  if (last.length >= cfg.estimate.minOwnPrior) return last.filter((a) => a.right).length / last.length;
  return priorOf(height, cfg);
}

/** Laplace-style estimate: (right + w·prior) / (n + w) over the skill's kept attempts at `height`. */
export function expectedSuccess(state: State, skill: string, height: Height, cfg: Config): number {
  const at = (state.skills[skill]?.attempts ?? []).filter((a) => a.height === height);
  const right = at.filter((a) => a.right).length;
  const w = cfg.estimate.priorWeight;
  return (right + w * ownPrior(state, height, cfg)) / (at.length + w);
}

/** Median of the student's recent answer times at `height`, or null with fewer than `estimate.minMsSamples`. */
export function usualMs(state: State, height: Height, cfg: Config = defaultConfig): number | null {
  const xs = [...(state.profile.msByHeight[height] ?? [])].sort((a, b) => a - b);
  if (xs.length < cfg.estimate.minMsSamples) return null;
  const m = xs.length >> 1;
  return xs.length % 2 ? xs[m] : (xs[m - 1] + xs[m]) / 2;
}

/**
 * A guess: a wrong answer (not "I don't know") faster than the larger of the height's floor and a fraction of the
 * student's usual time there. Right answers are never guesses here.
 */
export function isGuess(state: State, height: Height, right: boolean, choice: number | "dont-know", ms: number, cfg: Config = defaultConfig): boolean {
  if (right || choice === "dont-know") return false;
  return isUnderGuessLine(state, height, ms, cfg);
}

/**
 * A fast right answer (rule 1): a right answer under the same line as a guess. It is weak evidence of knowing, so it
 * does not count toward stepping up (see `recordAttempt`), the ladder run, the record raise or the stretch guard.
 */
export function isFastRight(state: State, height: Height, right: boolean, ms: number, cfg: Config = defaultConfig): boolean {
  return right && isUnderGuessLine(state, height, ms, cfg);
}

/** The one line: faster than the larger of the height's floor and a fraction of the student's usual time there. */
function isUnderGuessLine(state: State, height: Height, ms: number, cfg: Config): boolean {
  return ms < Math.max(cfg.guess.floorMs[height], (usualMs(state, height, cfg) ?? 0) * cfg.guess.fraction);
}
