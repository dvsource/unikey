import { router } from "expo-router";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Txt } from "../../components/Txt";
import { UnitPicker } from "../../components/UnitPicker";
import { Button, Card, Divider, ProgressBar, Sigiriya, Sky, Sun } from "../../components/ui";
import { currentPack, getSkill, items, packs, pick } from "../../content/pack";
import { buildSession, masteredSkills } from "../../state/session";
import { reviewedItemIds, streak, today, useStore } from "../../state/store";
import { color, gutter } from "../../theme";

const DAY_LETTERS = ["M", "T", "W", "T", "F", "S", "S"];

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
}

function weekDays() {
  const d = new Date();
  const monday = new Date(d);
  monday.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(monday);
    day.setDate(monday.getDate() + i);
    return today(day);
  });
}

export default function TodayScreen() {
  const insets = useSafeAreaInsets();
  const { settings, progress, reviews } = useStore();
  const pack = currentPack(settings.unit);
  const session = buildSession("today", { pack: pack.id, cursor: progress.cursors[pack.id] ?? 0, reviews });
  const mainSkill = getSkill(session[0]?.skills[0] ?? "");
  const otherSkills = new Set(session.map((it) => it.skills[0])).size - 1;

  const days = weekDays();
  const now = today();
  const activeDays = days.filter((d) => (progress.days[d] ?? 0) > 0).length;
  const n = streak(progress.days);

  const reviewedIds = reviewedItemIds(reviews);
  const reviewed = pack.items.filter((it) => reviewedIds.has(it.id)).length;
  const reviewedAll = reviewedIds.size;

  return (
    <Sky>
      <ScrollView contentContainerStyle={[styles.page, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 120 }]}>
        <View style={styles.header}>
          <View style={{ gap: 2 }}>
            <Txt size={15} tone="muted">
              {greeting()}
            </Txt>
            <Txt size={32} style={{ letterSpacing: -0.6 }}>
              {settings.reviewerName || "Kasun"}
            </Txt>
          </View>
          <View testID="streak" style={styles.streak} accessibilityLabel={`${n} day streak`}>
            <Sun />
            <Txt size={17} weight="medium">
              {String(n)}
            </Txt>
            <Txt size={14} tone="muted">
              {n === 1 ? "day" : "days"}
            </Txt>
          </View>
        </View>

        <UnitPicker />

        <Card style={styles.todayCard}>
          <View style={styles.bigSun} />
          <Txt size={15} tone="muted">
            Today · 5 min
          </Txt>
          <Txt testID="today-skill" size={27} weight="medium" style={{ marginRight: 70 }}>
            {pick(mainSkill?.name)}
          </Txt>
          <Txt size={15} tone="muted">
            {otherSkills > 0 ? `plus ${otherSkills} more ${otherSkills === 1 ? "skill" : "skills"} · ${session.length} questions` : `${session.length} questions`}
          </Txt>
          <Button testID="start-today" label="Start" onPress={() => router.push({ pathname: "/session", params: { mode: "today" } })} style={{ marginTop: 16 }} />
        </Card>

        {settings.reviewerMode && (
          <Card style={{ gap: 10, padding: 18 }}>
            <View style={styles.rowBetween}>
              <Txt size={15} weight="medium">
                Teacher review
              </Txt>
              <Txt testID="reviewed-count" size={14} tone="muted">
                {`Reviewed ${reviewed} of ${pack.items.length}`}
              </Txt>
            </View>
            <ProgressBar value={reviewed / pack.items.length} />
            {packs.length > 1 && (
              <Txt testID="reviewed-total" size={13} tone="muted">
                {`${pack.unit.name_si} · all units: ${reviewedAll} of ${items.length}`}
              </Txt>
            )}
            <View style={{ flexDirection: "row", gap: 10, marginTop: 4 }}>
              <Button
                testID="review-next"
                small
                label={reviewed < pack.items.length ? "Review next 10" : "All reviewed"}
                disabled={reviewed >= pack.items.length}
                onPress={() => router.push({ pathname: "/session", params: { mode: "review", pack: pack.id } })}
                style={{ flex: 1 }}
              />
              <Button testID="today-send-results" small kind="secondary" label="Send results" onPress={() => router.navigate("/progress")} style={{ flex: 1 }} />
            </View>
          </Card>
        )}

        <View style={{ gap: 10 }}>
          <View style={styles.rowBetween}>
            <Txt size={15} tone="muted">
              This week
            </Txt>
            <Txt testID="week-days" size={15}>{`${activeDays} of 7 days`}</Txt>
          </View>
          <View style={styles.bars}>
            {days.map((d) => {
              const count = progress.days[d] ?? 0;
              const isToday = d === now;
              if (isToday)
                return (
                  <View
                    key={d}
                    style={[styles.bar, { height: 44, backgroundColor: color.yellowSoft, borderWidth: 1.5, borderColor: color.yellowEdge }]}
                  />
                );
              if (!count) return <View key={d} style={[styles.bar, { height: 6, borderRadius: 3, backgroundColor: color.track }]} />;
              return <View key={d} style={[styles.bar, { height: 14 + Math.min(30, count * 3), backgroundColor: color.lavender }]} />;
            })}
          </View>
          <View style={styles.bars}>
            {days.map((d, i) => (
              <Txt key={d} size={12} tone={d === now ? "ink" : "muted"} weight={d === now ? "semibold" : "regular"} style={styles.dayLetter}>
                {DAY_LETTERS[i]}
              </Txt>
            ))}
          </View>
        </View>

        {[pack].map((p) => {
          const skillIds = p.skills.map((s) => s.id);
          const mastered = masteredSkills(skillIds, progress.answers).length;
          return (
            <View key={p.id} style={{ gap: 6 }}>
              <Divider style={{ marginBottom: 8 }} />
              <View style={styles.rowBetween}>
                <Txt size={16} weight="medium">
                  {p.unit.name_si}
                </Txt>
                <Txt size={14} tone="muted">{`${mastered} of ${skillIds.length} skills`}</Txt>
              </View>
              <Sigiriya drawn={mastered / skillIds.length} />
            </View>
          );
        })}
      </ScrollView>
    </Sky>
  );
}

const styles = StyleSheet.create({
  page: { paddingHorizontal: gutter, gap: 22, maxWidth: 520, width: "100%", alignSelf: "center" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  streak: { flexDirection: "row", alignItems: "center", gap: 7, paddingTop: 4 },
  todayCard: { overflow: "hidden", gap: 4 },
  bigSun: {
    position: "absolute",
    right: -38,
    top: -38,
    width: 124,
    height: 124,
    borderRadius: 62,
    backgroundColor: color.yellow,
    boxShadow: "0 0 50px rgba(240,170,60,0.5)",
  },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" },
  bars: { flexDirection: "row", gap: 10, alignItems: "flex-end" },
  bar: { flex: 1, borderRadius: 7 },
  dayLetter: { flex: 1, textAlign: "center" },
});
