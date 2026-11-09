import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef } from "react";
import { AccessibilityInfo, Animated, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import { Txt } from "../components/Txt";
import { Button, Card, Divider, ProgressBar, Sigiriya } from "../components/ui";
import { getPack, getSkill, itemsForSkill, packs } from "../content/pack";
import { masteredSkills } from "../state/session";
import { reviewedItemIds, streak, useStore } from "../state/store";
import { color, gutter } from "../theme";

export default function DoneScreen() {
  const p = useLocalSearchParams<{ mode: string; pack?: string; right: string; total: string; skill: string; skillName: string }>();
  const insets = useSafeAreaInsets();
  const { progress, reviews, settings } = useStore();
  const n = streak(progress.days);
  const right = Number(p.right ?? 0);
  const total = Number(p.total ?? 0);

  const skillItems = itemsForSkill(p.skill ?? "");
  const skillRight = skillItems.filter((it) => progress.answers[it.id]?.correct).length;
  const pack = getPack(p.pack ?? "") ?? getPack(getSkill(p.skill ?? "")?.pack ?? "") ?? packs[0];
  const mastered = masteredSkills(pack.skills.map((s) => s.id), progress.answers).length;
  const reviewedIds = reviewedItemIds(reviews);
  const reviewed = pack.items.filter((it) => reviewedIds.has(it.id)).length;

  // The sun rises on session done (off with reduced motion).
  const rise = useRef(new Animated.Value(40)).current;
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then((reduce) => {
      if (reduce) rise.setValue(0);
      else Animated.timing(rise, { toValue: 0, duration: 900, useNativeDriver: true }).start();
    });
  }, [rise]);

  return (
    <View testID="done-screen" style={styles.screen}>
      <LinearGradient
        colors={[color.sunriseTop, color.sunriseMid, color.sunriseLow, color.sunriseBottom]}
        locations={[0, 0.42, 0.78, 1]}
        style={[styles.sky, { height: 300 + insets.top }]}
      >
        <Animated.View style={[styles.sun, { top: 66 + insets.top, transform: [{ translateY: rise }] }]}>
          <Txt size={76} weight="light" style={{ lineHeight: 80, letterSpacing: -2 }}>
            {String(n)}
          </Txt>
          <Txt testID="done-streak" size={15}>{n === 1 ? "day in a row" : "days in a row"}</Txt>
        </Animated.View>
        <Svg style={styles.hill} width="100%" height={96} viewBox="0 0 390 96" preserveAspectRatio="none">
          <Path d="M0 74C60 44 120 44 190 66C250 84 320 62 390 40V96H0Z" fill={color.doneGround} />
        </Svg>
      </LinearGradient>

      <View style={[styles.body, { paddingBottom: insets.bottom + 22 }]}>
        <View style={{ gap: 8 }}>
          <View style={styles.rowBetween}>
            <Txt size={18} weight="medium" style={{ flex: 1 }}>
              {p.skillName ?? ""}
            </Txt>
            <Txt size={17}>{`${skillRight} of ${skillItems.length}`}</Txt>
          </View>
          <ProgressBar value={skillItems.length ? skillRight / skillItems.length : 0} />
          <Txt testID="done-score" size={14} tone="muted">{`${right} of ${total} right`}</Txt>
        </View>

        {settings.reviewerMode && (
          <Card style={{ padding: 18, gap: 3 }}>
            <Txt size={14} weight="medium" tone={color.green}>
              Review progress
            </Txt>
            <Txt size={20} weight="medium">{`Reviewed ${reviewed} of ${pack.items.length}`}</Txt>
            <Txt size={14} tone="muted">
              Send results from the Progress tab when you're ready.
            </Txt>
          </Card>
        )}

        <Divider />
        <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
          <Sigiriya drawn={mastered / pack.skills.length} width={92} />
          <Txt size={14} tone="muted" style={{ flex: 1 }}>
            {`${mastered} of ${pack.skills.length} skills drawn on your Sigiriya.`}
          </Txt>
        </View>

        <View style={styles.actions}>
          <Button testID="done-for-today" kind="secondary" label="Done for today" onPress={() => router.dismissTo("/")} style={{ flex: 1 }} />
          <Button
            testID="five-more"
            kind="secondary"
            label="5 more"
            onPress={() => router.replace({ pathname: "/session", params: { mode: p.mode === "review" ? "review" : "today", pack: pack.id, size: "5" } })}
            style={{ flex: 1 }}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: color.doneGround },
  sky: { overflow: "hidden" },
  sun: {
    position: "absolute",
    alignSelf: "center",
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: color.yellow,
    boxShadow: "0 0 80px rgba(255,190,90,0.75)",
    alignItems: "center",
    paddingTop: 36,
  },
  hill: { position: "absolute", left: 0, bottom: 0 },
  body: { flex: 1, paddingHorizontal: gutter, paddingTop: 8, gap: 20, maxWidth: 520, width: "100%", alignSelf: "center" },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline", gap: 12 },
  actions: { marginTop: "auto", flexDirection: "row", gap: 10 },
});
