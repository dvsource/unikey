import { router, useLocalSearchParams } from "expo-router";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import { Txt } from "../../components/Txt";
import { Divider, Sky } from "../../components/ui";
import { getSkill, itemsForSkill, layerLabel, pick } from "../../content/pack";
import { reviewKey, useStore } from "../../state/store";
import { color, gutter } from "../../theme";

export default function SkillScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { settings, reviews, progress } = useStore();
  const skill = getSkill(id);
  const list = itemsForSkill(id);

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
            Learn
          </Txt>
        </Pressable>
        <View style={{ gap: 2 }}>
          <Txt size={26} weight="medium">
            {pick(skill?.name)}
          </Txt>
          {settings.showEnglish && <Txt tone="muted">{skill?.name.en ?? ""}</Txt>}
          <Txt size={14} tone="muted">{`${list.length} items · ${skill?.type ?? ""}`}</Txt>
        </View>

        <View style={styles.list}>
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
});
