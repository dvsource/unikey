import { SkillState } from "../content/graph";
import { color } from "../theme";

// One look per skill state, shared by skill detail and the Progress chips (design A/C).
export const STATE: Record<SkillState, { label: string; bg: string; dot: string; ink: string }> = {
  mastered: { label: "Mastered", bg: color.greenSoft, dot: color.green, ink: color.greenInk },
  practising: { label: "Practising", bg: "#EEECFA", dot: color.lavender, ink: "#4A3FB8" },
  refresh: { label: "Refresh", bg: color.terracottaSoft, dot: color.terracotta, ink: color.terracottaInk },
  new: { label: "Not started", bg: "#F3F5FA", dot: color.track, ink: color.muted },
  inferred: { label: "Checked through other skills", bg: "#F3F5FA", dot: color.green, ink: color.muted },
  none: { label: "No questions yet", bg: "#F3F5FA", dot: color.track, ink: color.muted },
};
