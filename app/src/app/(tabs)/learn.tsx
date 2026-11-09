import { router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Txt } from "../../components/Txt";
import { UnitPicker } from "../../components/UnitPicker";
import { Divider, Sky } from "../../components/ui";
import { currentPack, itemsForSkill, pick } from "../../content/pack";
import { reviewedItemIds, useStore } from "../../state/store";
import { color, gutter } from "../../theme";

export default function LearnScreen() {
  const insets = useSafeAreaInsets();
  const { settings, reviews, progress } = useStore();
  const reviewed = reviewedItemIds(reviews);

  return (
    <Sky>
      <ScrollView contentContainerStyle={[styles.page, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 120 }]}>
        <Txt size={32} style={{ letterSpacing: -0.6 }}>
          Learn
        </Txt>
        <UnitPicker />
        {[currentPack(settings.unit)].map((p) => (
          <View key={p.id} style={{ gap: 4 }}>
            <View style={styles.rowBetween}>
              <Txt size={18} weight="medium">
                {p.unit.name_si}
              </Txt>
              <Txt size={14} tone="muted">{`${p.skills.length} skills`}</Txt>
            </View>
            {settings.showEnglish && (
              <Txt size={13} tone="muted">
                {p.unit.name_en}
              </Txt>
            )}
            <View style={styles.list}>
              {p.skills.map((s, i) => {
                const list = itemsForSkill(s.id);
                const done = list.filter((it) => reviewed.has(it.id)).length;
                const right = list.filter((it) => progress.answers[it.id]?.correct).length;
                return (
                  <View key={s.id}>
                    {i > 0 && <Divider />}
                    <Pressable
                      accessibilityRole="button"
                      testID={`skill-${s.id}`}
                      onPress={() => router.push({ pathname: "/skill/[id]", params: { id: s.id } })}
                      style={({ pressed }) => [styles.row, pressed && { opacity: 0.6 }]}
                    >
                      <View style={{ flex: 1, gap: 2 }}>
                        <Txt size={16}>{pick(s.name)}</Txt>
                        {settings.showEnglish && (
                          <Txt size={13} tone="muted">
                            {s.name.en}
                          </Txt>
                        )}
                        <Txt size={13} tone="muted">
                          {settings.reviewerMode
                            ? `${list.length} items · reviewed ${done}`
                            : `${list.length} questions · ${right} right`}
                        </Txt>
                      </View>
                      <Dots total={list.length} filled={settings.reviewerMode ? done : right} />
                    </Pressable>
                  </View>
                );
              })}
            </View>
          </View>
        ))}
      </ScrollView>
    </Sky>
  );
}

function Dots({ total, filled }: { total: number; filled: number }) {
  const full = filled >= total && total > 0;
  return (
    <View
      style={{
        width: 30,
        height: 30,
        borderRadius: 15,
        borderWidth: 3,
        borderColor: full ? color.lavender : filled > 0 ? color.lavender : color.track,
        borderStyle: filled > 0 && !full ? "dashed" : "solid",
        backgroundColor: full ? color.lavender : "transparent",
      }}
      accessibilityLabel={`${filled} of ${total}`}
    />
  );
}

const styles = StyleSheet.create({
  page: { paddingHorizontal: gutter, gap: 22, maxWidth: 520, width: "100%", alignSelf: "center" },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" },
  list: { marginTop: 10, backgroundColor: color.surface, borderRadius: 22, borderWidth: 1, borderColor: color.hairline, paddingHorizontal: 18 },
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 14, minHeight: 56 },
});
