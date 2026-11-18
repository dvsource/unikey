import { router } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Svg, { Circle, Text as SvgText } from "react-native-svg";
import { readiness, skillState, topicsWithSkills } from "../content/graph";
import { pick } from "../content/pack";
import { color, font } from "../theme";
import { STATE } from "./skillStates";
import { Txt } from "./Txt";

// A, "rings then chips": one readiness ring per syllabus topic of the unit; tap a
// ring to list that topic's skills as chips, grouped by subtopic and coloured by state.

const R = 26;
const C = 2 * Math.PI * R;

export function SkillRings({ packId, answers }: { packId: string; answers: Record<string, { correct: boolean }> }) {
  const topics = topicsWithSkills(packId);
  const [picked, setPicked] = useState(0);
  if (!topics.length) return null;
  const sel = topics[Math.min(picked, topics.length - 1)];
  const all = topics.flatMap((t) => t.skills.map((s) => s.id));

  const groups: { sub: string; ids: string[] }[] = [];
  for (const s of sel.skills) {
    let g = groups.find((x) => x.sub === s.subtopic);
    if (!g) groups.push((g = { sub: s.subtopic, ids: [] }));
    g.ids.push(s.id);
  }
  const mastered = sel.skills.filter((s) => skillState(s.id, answers) === "mastered").length;

  return (
    <View style={{ gap: 12 }}>
      <View style={styles.headline}>
        <Txt testID="readiness" size={48} weight="light" style={{ lineHeight: 52 }}>
          {String(readiness(all, answers))}
        </Txt>
        <Txt size={15} tone="muted" style={{ marginBottom: 8 }}>
          readiness · estimate from this phone's answers
        </Txt>
      </View>

      <View style={styles.rings}>
        {topics.map((t, i) => {
          const pct = readiness(t.skills.map((s) => s.id), answers);
          const on = i === picked;
          return (
            <Pressable
              key={t.id}
              testID={`ring-${t.ref}`}
              accessibilityRole="button"
              accessibilityState={{ selected: on }}
              accessibilityLabel={`${t.ref} ${t.name.en}, ${pct} percent ready`}
              onPress={() => setPicked(i)}
              style={[styles.ring, on && styles.ringOn]}
            >
              <Svg width={56} height={56} viewBox="0 0 64 64">
                <Circle cx={32} cy={32} r={R} fill="none" stroke={color.trackSoft} strokeWidth={7} />
                {pct > 0 && (
                  <Circle
                    cx={32}
                    cy={32}
                    r={R}
                    fill="none"
                    stroke={color.lavender}
                    strokeWidth={7}
                    strokeLinecap="round"
                    strokeDasharray={`${(C * pct) / 100} ${C}`}
                    transform="rotate(-90 32 32)"
                  />
                )}
                <SvgText x={32} y={37} textAnchor="middle" fontSize={15} fontFamily={font.regular} fill={color.ink}>
                  {String(pct)}
                </SvgText>
              </Svg>
              <Txt size={11} numberOfLines={2} style={{ textAlign: "center" }}>
                {`${t.ref} ${t.name.en.split(/[:,(]/)[0].trim()}`}
              </Txt>
            </Pressable>
          );
        })}
      </View>

      <View testID="chip-panel" style={styles.panel}>
        <View style={styles.panelHead}>
          <Txt testID="chip-panel-title" size={17} weight="medium" style={{ flex: 1 }}>
            {`${sel.ref} ${sel.name.en}`}
          </Txt>
          <Txt size={13} tone="muted">{`${mastered} of ${sel.skills.length} mastered`}</Txt>
        </View>
        {groups.map((g) => (
          <View key={g.sub} style={{ gap: 8 }}>
            <Txt size={12} weight="semibold" tone="muted" style={{ letterSpacing: 0.5 }}>
              {g.sub.toUpperCase()}
            </Txt>
            <View style={styles.chips}>
              {g.ids.map((id) => {
                const state = skillState(id, answers);
                const look = STATE[state];
                const s = sel.skills.find((x) => x.id === id)!;
                return (
                  <Pressable
                    key={id}
                    testID={`chip-${id}`}
                    accessibilityRole="button"
                    accessibilityLabel={`${s.name.en}, ${look.label}`}
                    onPress={() => router.push({ pathname: "/skill/[id]", params: { id } })}
                    style={[styles.chip, { backgroundColor: look.bg }, state === "none" && styles.chipQuiet]}
                  >
                    <View style={[styles.dot, { backgroundColor: look.dot }]} />
                    <Txt size={13} tone={state === "none" ? "muted" : "ink"}>
                      {pick(s.name)}
                    </Txt>
                    {state === "refresh" && (
                      <Txt size={13} weight="medium" tone={color.terracottaInk}>
                        · refresh
                      </Txt>
                    )}
                  </Pressable>
                );
              })}
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headline: { flexDirection: "row", alignItems: "flex-end", gap: 8, flexWrap: "wrap" },
  rings: { flexDirection: "row", flexWrap: "wrap", gap: 4 },
  ring: { width: "23.5%", alignItems: "center", gap: 2, paddingTop: 6, paddingBottom: 8, paddingHorizontal: 2, borderRadius: 18, borderWidth: 1, borderColor: "transparent", minHeight: 96 },
  ringOn: { backgroundColor: color.surface, borderColor: color.hairline },
  panel: { backgroundColor: color.surface, borderWidth: 1, borderColor: color.hairline, borderRadius: 26, padding: 16, gap: 14 },
  panelHead: { flexDirection: "row", alignItems: "baseline", gap: 8 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  chip: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 11, paddingVertical: 7, borderRadius: 999, maxWidth: "100%" },
  chipQuiet: { opacity: 0.8 },
  dot: { width: 9, height: 9, borderRadius: 5 },
});
