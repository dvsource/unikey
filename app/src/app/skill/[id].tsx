import { router, useLocalSearchParams } from "expo-router";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import { Txt } from "../../components/Txt";
import { Button, Divider, Sky } from "../../components/ui";
import { studyEnabled } from "../../engine/enabled";
import { STATE } from "../../components/skillStates";
import { inGraph, mixedUpWith, node, opens, pastPaperCount, prerequisites, SkillState, skillName, skillState, standsOn } from "../../content/graph";
import { itemsForSkill, Lang, layerLabel, pick } from "../../content/pack";
import { useStore } from "../../state/store";
import { color, gutter } from "../../theme";

export default function SkillScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { settings, reviews, progress } = useStore();
  const name = skillName(id);
  const g = node(id);
  const list = itemsForSkill(id);
  const state = skillState(id, progress.answers);
  const needs = prerequisites(id);
  const opened = opens(id);
  const mixups = mixedUpWith(id);
  const up = standsOn(id).length;
  const papers = pastPaperCount(id);
  // C: suggest a missing prerequisite first, if it has questions to play.
  const first = needs.find((p) => itemsForSkill(p).length > 0 && !["mastered", "practising"].includes(skillState(p, progress.answers)));
  const play = (skill: string) => {
    if (studyEnabled()) return router.push({ pathname: "/session", params: { mode: "skill", skill } });
    const start = itemsForSkill(skill)[0];
    if (start) router.push({ pathname: "/session", params: { mode: "skill", skill, start: start.id } });
  };

  const statusOf = (itemId: string) => {
    const marks = Object.values(reviews).filter((r) => r.item_id === itemId);
    if (!marks.length) return null;
    return marks.some((r) => r.verdict === "issues") ? "issues" : "ok";
  };

  return (
    <Sky>
      <ScrollView contentContainerStyle={[styles.page, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 40 }]}>
        <Pressable testID="back" accessibilityRole="button" accessibilityLabel="Back" onPress={() => router.back()} style={styles.back}>
          <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
            <Path d="M15 5l-7 7 7 7" stroke={color.muted} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
          <Txt size={15} tone="muted">
            Back
          </Txt>
        </Pressable>
        <View style={{ gap: 4 }}>
          <Txt testID="skill-title" size={26} weight="medium">
            {pick(name)}
          </Txt>
          {settings.showEnglish && name.si && <Txt tone="muted">{name.en}</Txt>}
          <Txt size={14} tone="muted">
            {g ? `${g.subtopic} · ${g.ref} · ${g.type} · about ${g.minutes} min` : `${list.length} items`}
          </Txt>
          <StateChip state={state} />
        </View>

        {g && (
          <View testID="skill-graph" style={styles.card}>
            <Txt size={12} weight="semibold" tone="muted" style={styles.label}>
              NEEDS
            </Txt>
            {needs.length ? (
              <View style={styles.grid}>
                {needs.map((n) => (
                  <SkillTile key={n} id={n} state={skillState(n, progress.answers)} />
                ))}
              </View>
            ) : (
              <Txt size={13} tone="muted">
                Nothing before it. A starting skill.
              </Txt>
            )}
            <View style={styles.stem} />
            <View style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
              <View style={styles.thisSkill}>
                <Txt size={12} tone="#C9C3F0">
                  This skill
                </Txt>
                <Txt size={16} weight="medium" tone="#FFFFFF">
                  {pick(name)}
                </Txt>
              </View>
              {mixups.length > 0 && (
                <Pressable
                  testID="skill-mixup"
                  accessibilityRole="button"
                  onPress={() => router.push({ pathname: "/skill/[id]", params: { id: mixups[0] } })}
                  style={styles.mixup}
                >
                  <Txt size={11} weight="semibold" tone={color.terracottaInk}>
                    MIXED UP WITH
                  </Txt>
                  <Txt size={13}>{pick(skillName(mixups[0]))}</Txt>
                </Pressable>
              )}
            </View>
            <View style={styles.stem} />
            <Txt size={12} weight="semibold" tone="muted" style={styles.label}>
              OPENS
            </Txt>
            {opened.length ? (
              <View style={styles.chips}>
                {opened.map((o) => (
                  <Pressable key={o} accessibilityRole="button" onPress={() => router.push({ pathname: "/skill/[id]", params: { id: o } })} style={styles.chip}>
                    <Txt size={13}>{pick(skillName(o))}</Txt>
                  </Pressable>
                ))}
              </View>
            ) : (
              <Txt size={13} tone="muted">
                Nothing new. It is a finishing skill.
              </Txt>
            )}
          </View>
        )}

        {g && (
          <View style={{ flexDirection: "row", gap: 10 }}>
            <View style={styles.stat}>
              <Txt testID="stands-on" size={30} weight="light">
                {String(up)}
              </Txt>
              <Txt size={13} tone="muted">
                {up === 1 ? "skill stands on this one" : "skills stand on this one"}
              </Txt>
            </View>
            <View style={styles.stat}>
              <Txt testID="past-papers" size={30} weight="light">
                {String(papers)}
              </Txt>
              <Txt size={13} tone="muted">
                {`past-paper MCQ${papers === 1 ? "" : "s"} in 10 years (Paper I)`}
              </Txt>
            </View>
          </View>
        )}

        {list.length > 0 ? (
          <View style={styles.card}>
            {first && (
              <Txt testID="recommended-first" size={14} tone="muted">
                {`Recommended first: ${pick(skillName(first))}`}
              </Txt>
            )}
            <View style={{ flexDirection: "row", gap: 10 }}>
              {first && <Button testID="do-first" label="Do that first" onPress={() => play(first)} style={{ flex: 1 }} />}
              <Button
                testID="start-skill"
                kind={first ? "secondary" : "primary"}
                label={studyEnabled() ? "Study this topic" : first ? "Start this anyway" : "Start this skill"}
                onPress={() => play(id)}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        ) : (
          <Txt testID="no-questions" size={14} tone="muted">
            No questions for this skill in the sample yet.
          </Txt>
        )}

        {list.length > 0 && (
          <Txt size={12} weight="semibold" tone="muted" style={styles.label}>
            {`QUESTIONS · ${list.length}`}
          </Txt>
        )}

        <View style={[styles.list, !list.length && { display: "none" }]}>
          {list.map((it, i) => {
            const status = statusOf(it.id);
            const answer = progress.answers[it.id];
            return (
              <View key={it.id}>
                {i > 0 && <Divider />}
                <Pressable
                  accessibilityRole="button"
                  testID={`item-${it.id}`}
                  onPress={() => router.push({ pathname: "/session", params: { mode: "skill", skill: id, start: it.id } })}
                  style={({ pressed }) => [styles.row, pressed && { opacity: 0.6 }]}
                >
                  <View style={{ flex: 1, gap: 4 }}>
                    <Txt size={12} tone="muted">
                      {`${layerLabel[it.layer]} · ${it.layer} ${it.form}${it.n_variants ? ` · ${it.n_variants} variants` : ""}`}
                    </Txt>
                    <Txt size={15} numberOfLines={2}>
                      {pick(it.variants[0].stem)}
                    </Txt>
                    {settings.reviewerMode && (
                      <Txt size={11} tone="muted">
                        {it.id}
                      </Txt>
                    )}
                  </View>
                  {settings.reviewerMode ? (
                    <Badge status={status} />
                  ) : answer ? (
                    <Badge status={answer.correct ? "ok" : "issues"} />
                  ) : null}
                </Pressable>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </Sky>
  );
}


function StateChip({ state }: { state: SkillState }) {
  const s = STATE[state];
  return (
    <View testID="skill-state" style={[styles.stateChip, { backgroundColor: s.bg }]}>
      <View style={[styles.stateDot, { backgroundColor: s.dot }]} />
      <Txt size={12} weight="medium" tone={s.ink}>
        {s.label}
      </Txt>
    </View>
  );
}

function SkillTile({ id, state }: { id: string; state: SkillState }) {
  const s = STATE[state];
  const name: Lang = skillName(id);
  const tappable = inGraph(id);
  return (
    <Pressable
      accessibilityRole="button"
      disabled={!tappable}
      onPress={() => router.push({ pathname: "/skill/[id]", params: { id } })}
      style={[styles.tile, { backgroundColor: s.bg }, state === "new" || state === "none" ? styles.tileDashed : null]}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
        <View style={[styles.stateDot, { backgroundColor: s.dot }]} />
        <Txt size={12} weight="medium" tone={s.ink}>
          {tappable ? s.label : "Other unit or maths"}
        </Txt>
      </View>
      <Txt size={14}>{pick(name)}</Txt>
    </Pressable>
  );
}

function Badge({ status }: { status: "ok" | "issues" | null }) {
  if (!status)
    return <View style={[styles.badge, { borderWidth: 1.5, borderColor: color.track }]} accessibilityLabel="Not reviewed" />;
  const ok = status === "ok";
  return (
    <View style={[styles.badge, { backgroundColor: ok ? color.greenSoft : color.terracottaSoft }]} accessibilityLabel={ok ? "OK" : "Has issues"}>
      <Txt size={13} weight="semibold" tone={ok ? color.greenInk : color.terracottaInk}>
        {ok ? "✓" : "!"}
      </Txt>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { paddingHorizontal: gutter, gap: 18, maxWidth: 520, width: "100%", alignSelf: "center" },
  back: { flexDirection: "row", alignItems: "center", gap: 2, height: 44, marginLeft: -6, alignSelf: "flex-start" },
  list: { backgroundColor: color.surface, borderRadius: 22, borderWidth: 1, borderColor: color.hairline, paddingHorizontal: 18 },
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 14 },
  badge: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  card: { backgroundColor: color.surface, borderRadius: 26, borderWidth: 1, borderColor: color.hairline, padding: 16, gap: 10 },
  label: { letterSpacing: 0.6 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  tile: { flexBasis: "47%", flexGrow: 1, padding: 12, borderRadius: 18, gap: 6 },
  tileDashed: { borderWidth: 1.5, borderStyle: "dashed", borderColor: color.faint, backgroundColor: color.surface },
  stem: { alignSelf: "center", width: 2, height: 16, backgroundColor: color.faint },
  thisSkill: { flex: 1, padding: 16, borderRadius: 20, backgroundColor: color.ink, gap: 4 },
  mixup: { width: 120, padding: 12, borderRadius: 18, borderWidth: 1.5, borderColor: "#F3D2C1", backgroundColor: color.terracottaSoft, gap: 4 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: "#F3F5FA" },
  stat: { flex: 1, backgroundColor: color.surface, borderWidth: 1, borderColor: color.hairline, borderRadius: 22, padding: 14, gap: 2 },
  stateChip: { flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, marginTop: 4 },
  stateDot: { width: 9, height: 9, borderRadius: 5 },
});
