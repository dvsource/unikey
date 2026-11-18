import { router } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";
import { bestLever, opensNext, skillName, trail, TrailStop } from "../content/graph";
import { Item, pick } from "../content/pack";
import { color } from "../theme";
import { Txt } from "./Txt";

// D, "next-steps trail": today's path as stops on a line, each with one reason
// from the skill graph; plus T's lever and "after today" as single lines.

const KIND: Record<TrailStop["kind"], { tag: string; tone: string; dot: object }> = {
  refresh: { tag: "Refresh", tone: color.terracottaInk, dot: { backgroundColor: color.terracotta } },
  keep: { tag: "Keep going", tone: "#4A3FB8", dot: { backgroundColor: "#C9C3F0" } },
  new: { tag: "New", tone: color.muted, dot: { backgroundColor: color.trackSoft } },
  first: { tag: "Recommended first", tone: "#4A3FB8", dot: { backgroundColor: color.surface, borderWidth: 3, borderColor: color.lavender } },
};

export function Trail({ queue, answers, showEnglish }: { queue: Item[]; answers: Record<string, { correct: boolean }>; showEnglish: boolean }) {
  const stops = trail(queue, answers);
  const today = stops.filter((s) => s.kind !== "first").map((s) => s.skill);
  const lever = bestLever(today);
  const next = opensNext(today, answers);
  let firstQueueStop = true;

  return (
    <View testID="trail">
      {stops.map((s, i) => {
        const k = KIND[s.kind];
        const name = skillName(s.skill);
        const isFirstQueue = s.kind !== "first" && firstQueueStop;
        if (isFirstQueue) firstQueueStop = false;
        const last = i === stops.length - 1;
        return (
          <View key={s.skill} style={styles.row}>
            <View style={styles.rail}>
              <View style={[styles.dot, k.dot]} />
              {!last && <View style={[styles.line, s.kind === "first" && styles.lineDashed]} />}
            </View>
            <Pressable
              testID={`trail-stop-${i}`}
              accessibilityRole="button"
              onPress={() => router.push({ pathname: "/skill/[id]", params: { id: s.skill } })}
              style={({ pressed }) => [styles.body, s.kind === "first" && styles.bodyFirst, pressed && { opacity: 0.6 }]}
            >
              <Txt size={11} weight="semibold" tone={k.tone} style={styles.tag}>
                {k.tag.toUpperCase()}
              </Txt>
              <Txt testID={isFirstQueue ? "today-skill" : undefined} size={16} weight="medium">
                {pick(name)}
              </Txt>
              {showEnglish && name.si && (
                <Txt size={12} tone="muted">
                  {name.en}
                </Txt>
              )}
              <Txt size={13} tone="muted">
                {s.why}
              </Txt>
            </Pressable>
          </View>
        );
      })}
      {(lever || next) && (
        <View style={styles.notes}>
          {lever && (
            <Txt testID="trail-lever" size={13} tone="muted">
              {`Best lever: ${pick(skillName(lever.skill))} holds up ${lever.count} other skills.`}
            </Txt>
          )}
          {next && (
            <Txt testID="trail-opens" size={13} tone="muted">
              {`After today: ${pick(skillName(next))} opens up.`}
            </Txt>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 14 },
  rail: { width: 22, alignItems: "center" },
  dot: { width: 18, height: 18, borderRadius: 9, marginTop: 2 },
  line: { flex: 1, minHeight: 14, width: 0, borderLeftWidth: 2, borderColor: color.hairline },
  lineDashed: { borderStyle: "dashed", borderColor: color.faint },
  body: { flex: 1, gap: 2, paddingBottom: 16 },
  bodyFirst: { padding: 12, marginBottom: 14, borderRadius: 16, backgroundColor: "#F3F5FA" },
  tag: { letterSpacing: 0.5 },
  notes: { gap: 4, marginTop: 2, marginBottom: 6 },
});
