import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useState, type ReactNode } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import { LETTERS, ReviewPanel } from "../components/ReviewPanel";
import { Txt } from "../components/Txt";
import { Button, Chip, Figure, ProgressBar } from "../components/ui";
import { constantsLine, currentPack, getSkill, Item, layerLabel, mistakeMessage, Option, reviewVariants } from "../content/pack";
import { figureSvg } from "../content/figureEngines";
import { buildSession, SessionMode } from "../state/session";
import { reviewKey, useStore } from "../state/store";
import { color, gutter, radius } from "../theme";
import { EngineStudy } from "../engine/EngineStudy";
import { node } from "../content/graph";
import { adaptiveStudy } from "../engine/enabled";

// English UI names for the four error-tag groups (§7).
const GROUP_LABEL: Record<string, string> = {
  Method: "Wrong method",
  Execution: "Slip in the working",
  Reading: "Misread the question",
  Concept: "Concept trap",
};
const groupLabel = (g?: string) => (g ? GROUP_LABEL[g.split(" ")[0]] ?? g : "");

function Both({ text, size, weight, showEnglish }: { text?: { en: string; si?: string }; size: number; weight?: "regular" | "medium" | "semibold"; showEnglish: boolean }) {
  if (!text) return null;
  const si = text.si ?? text.en;
  return (
    <View style={{ gap: 2 }}>
      <Txt size={size} weight={weight}>
        {si}
      </Txt>
      {showEnglish && text.en !== si && (
        <Txt size={Math.max(12, size - 3)} tone="muted">
          {text.en}
        </Txt>
      )}
    </View>
  );
}

type Params = { mode?: SessionMode; skill?: string; start?: string; size?: string; pack?: string };
const leaveScreen = () => router.back();

function SessionBody({ children }: { children: ReactNode }) {
  return <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.body}>{children}</ScrollView>;
}

export default function SessionScreen() {
  const params = useLocalSearchParams<Params>();
  const mode: SessionMode = params.mode ?? "today";
  const insets = useSafeAreaInsets();
  const store = useStore();
  if (adaptiveStudy(mode, params.start)) {
    const unit = currentPack(params.pack ?? store.settings.unit);
    const topic = (mode === "skill" && params.skill ? node(params.skill)?.topic : undefined) ?? unit.graph?.topics[0]?.id;
    return (
      <View style={[styles.screen, { paddingTop: insets.top + 10 }]}>
        <SessionBody>
          <EngineStudy topic={topic} onExit={leaveScreen} />
        </SessionBody>
      </View>
    );
  }
  return <PrototypeSession params={params} mode={mode} insets={insets} store={store} />;
}

function PrototypeSession({ params, mode, insets, store }: {
  params: Params; mode: SessionMode; insets: ReturnType<typeof useSafeAreaInsets>; store: ReturnType<typeof useStore>;
}) {
  const { settings, reviews } = store;

  // Fixed for the life of the session, even as reviews/progress change underneath.
  // Today advances its cursor item by item, so a session cut short (app killed)
  // resumes after the last answered item instead of replaying the whole 10.
  // Today and review play one unit: the one passed in, else the one picked on Today/Learn.
  const [pack] = useState(params.pack ?? currentPack(settings.unit).id);
  const [startCursor] = useState(store.progress.cursors[pack] ?? 0);
  const queue = useMemo<Item[]>(
    () =>
      buildSession(mode, {
        pack,
        cursor: startCursor,
        reviews,
        skill: params.skill,
        start: params.start,
        size: params.size ? Number(params.size) : undefined,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const [index, setIndex] = useState(0);
  const [variantPos, setVariantPos] = useState(0);
  const [chosen, setChosen] = useState<number | null>(null);
  const [results, setResults] = useState<boolean[]>([]);
  const [reviewOpen, setReviewOpen] = useState(false);

  const item = queue[index];
  if (!item) {
    return (
      <View style={[styles.empty, { paddingTop: insets.top + 40 }]}>
        <Txt size={18}>Nothing left to play here.</Txt>
        <Button label="Back" onPress={leaveScreen} />
      </View>
    );
  }

  const variantList = reviewVariants(item);
  const vIndex = variantList[variantPos] ?? 0;
  const variant = item.variants[vIndex];
  const figure = figureSvg(variant.figure);
  const existing = reviews[reviewKey(item.id, variant.vid)];
  const answered = chosen != null;
  const picked: Option | null = answered ? variant.options[chosen] : null;
  const isRight = !!picked?.correct;
  const mistake = picked && !picked.correct ? mistakeMessage(picked) : null;
  const hasPictures = variant.options.some((o) => o.svg);
  const variantLabel = variantList.length > 1 ? `Example ${variantPos + 1} of ${variantList.length} (${variant.vid})` : variant.vid;

  const choose = (i: number) => {
    if (answered) return;
    setChosen(i);
    if (results.length === index) {
      const right = !!variant.options[i].correct;
      setResults((r) => [...r, right]);
      store.recordAnswer(item.id, right);
      if (mode === "today") store.setCursor(pack, startCursor + index + 1);
    }
  };

  const changeVariant = (step: number) => {
    setVariantPos((p) => (p + step + variantList.length) % variantList.length);
    setChosen(null);
  };

  const next = () => {
    if (index + 1 < queue.length) {
      setIndex(index + 1);
      setVariantPos(0);
      setChosen(null);
      return;
    }
    const right = results.filter(Boolean).length;
    const mainSkill = getSkill(queue[0].skills[0]);
    router.replace({
      pathname: "/done",
      params: { mode, pack, right: String(right), total: String(queue.length), skill: queue[0].skills[0], skillName: mainSkill?.name.si ?? "" },
    });
  };

  const optionStyle = (o: Option, i: number) => {
    if (!answered) return styles.option;
    if (o.correct) return [styles.option, styles.optionRight];
    if (i === chosen) return [styles.option, styles.optionWrong];
    return [styles.option, { opacity: 0.6 }];
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 10 }]}>
      <View style={styles.top}>
        <Pressable testID="close-session" accessibilityRole="button" accessibilityLabel="Close session" onPress={leaveScreen} style={styles.close}>
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
            <Path d="M6 6l12 12M18 6L6 18" stroke={color.muted} strokeWidth={1.6} strokeLinecap="round" />
          </Svg>
        </Pressable>
        <View style={{ flex: 1 }}>
          <ProgressBar value={(index + (answered ? 1 : 0)) / queue.length} />
        </View>
        <Txt testID="session-counter" size={14} tone="muted">{`${index + 1} / ${queue.length}`}</Txt>
        <Chip testID="toggle-english" label="EN" active={settings.showEnglish} onPress={() => store.setSettings({ showEnglish: !settings.showEnglish })} />
      </View>

      <SessionBody>
        <View style={styles.metaRow}>
          <Txt testID="layer-label" size={14} tone="muted">
            {layerLabel[item.layer]}
          </Txt>
          {settings.reviewerMode && (
            <Pressable testID="review-open" accessibilityRole="button" onPress={() => setReviewOpen(true)} style={[styles.reviewTag, existing && (existing.verdict === "ok" ? styles.reviewOk : styles.reviewIssue)]}>
              <Txt size={13} weight="medium" tone={existing ? (existing.verdict === "ok" ? color.greenInk : color.terracottaInk) : "ink"}>
                {existing ? (existing.verdict === "ok" ? "Reviewed · OK" : "Reviewed · issues") : "Review"}
              </Txt>
            </Pressable>
          )}
        </View>

        {settings.reviewerMode && (
          <View style={styles.reviewMeta}>
            <Txt testID="item-meta" size={12} tone="muted" style={{ flex: 1 }}>
              {`${item.id} · ${item.layer} ${item.form} · ${item.source_ref}${variantLabel ? ` · ${variantLabel}` : ""}`}
            </Txt>
            {variantList.length > 1 && (
              <View style={{ flexDirection: "row", gap: 6 }}>
                <Chip testID="variant-prev" label="‹" onPress={() => changeVariant(-1)} />
                <Chip testID="variant-next" label="›" onPress={() => changeVariant(1)} />
              </View>
            )}
          </View>
        )}

        <Both text={variant.stem} size={20} showEnglish={settings.showEnglish} />

        {Object.keys(item.constants).length > 0 && (
          <View testID="constants" style={styles.constants}>
            <Txt size={13} tone="muted">
              {constantsLine(item.constants)}
            </Txt>
          </View>
        )}

        {figure && (
          <View testID="figure" style={styles.figureCard}>
            <Figure svg={figure} maxWidth={300} />
          </View>
        )}

        <View style={hasPictures ? styles.pictureGrid : { gap: 8 }}>
          {variant.options.map((o, i) => (
            <Pressable
              key={`${variant.vid}-${i}`}
              testID={`option-${i}`}
              accessibilityRole="button"
              accessibilityState={{ disabled: answered }}
              onPress={() => choose(i)}
              style={[optionStyle(o, i), hasPictures && styles.pictureOption]}
            >
              {o.svg && <Figure svg={o.svg} maxWidth={170} />}
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                {settings.reviewerMode && (
                  <Txt size={13} weight="semibold" tone="muted">
                    {LETTERS[i]}
                  </Txt>
                )}
                <View style={{ flex: 1 }}>
                  <Both text={o.text} size={hasPictures ? 14 : 16} showEnglish={settings.showEnglish} />
                </View>
                {answered && o.correct && <Tick />}
              </View>
              {settings.reviewerMode && answered && o.tag && (
                <Txt size={11} tone="muted">
                  {o.tag}
                </Txt>
              )}
            </Pressable>
          ))}
        </View>
      </SessionBody>

      {answered && (
        <View testID="feedback" style={[styles.sheet, { paddingBottom: insets.bottom + 18 }]}>
          <ScrollView style={{ maxHeight: 260 }} contentContainerStyle={{ gap: 8 }}>
            <Txt testID="feedback-title" size={15} weight="semibold" tone={isRight ? color.green : color.terracotta}>
              {isRight ? "Correct" : mistake?.group ? groupLabel(mistake.group) : "Not quite"}
            </Txt>
            {mistake && (
              <View testID="mistake-message" style={{ gap: 2 }}>
                <Both text={mistake.text} size={15} weight="medium" showEnglish={settings.showEnglish} />
                {settings.reviewerMode && (!mistake.text.si || mistake.proposed) && (
                  <Txt testID="tag-note" size={11} tone="muted">
                    {[mistake.proposed && `Proposed tag (${picked?.tag}), not yet approved`, !mistake.text.si && "Tag message has no Sinhala yet"]
                      .filter(Boolean)
                      .join(" · ")}
                  </Txt>
                )}
              </View>
            )}
            <View testID="explanation">
              <Both text={item.explanation} size={15} showEnglish={settings.showEnglish} />
            </View>
          </ScrollView>
          <View style={{ flexDirection: "row", gap: 10, marginTop: 12 }}>
            {settings.reviewerMode && <Button testID="review-open-sheet" kind="secondary" label={existing ? "Edit review" : "Review"} onPress={() => setReviewOpen(true)} style={{ flex: 1 }} />}
            <Button testID="continue" label={index + 1 < queue.length ? "Continue" : "Finish"} onPress={next} style={{ flex: 2 }} />
          </View>
        </View>
      )}

      <ReviewPanel
        visible={reviewOpen}
        item={item}
        variant={variant}
        variantLabel={variantLabel}
        existing={existing}
        reviewerName={settings.reviewerName}
        onSetReviewerName={(reviewerName) => store.setSettings({ reviewerName })}
        onSave={(r) => {
          store.saveReview(r);
          setReviewOpen(false);
        }}
        onClear={() => {
          store.clearReview(reviewKey(item.id, variant.vid));
          setReviewOpen(false);
        }}
        onClose={() => setReviewOpen(false)}
      />
    </View>
  );
}

function Tick() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path d="M5 13l4 4 10-10" stroke={color.greenInk} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: color.sessionGround },
  empty: { flex: 1, alignItems: "center", gap: 20, backgroundColor: color.sessionGround },
  top: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: gutter - 12, paddingRight: gutter, maxWidth: 560, width: "100%", alignSelf: "center" },
  close: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  body: { paddingHorizontal: gutter, paddingTop: 8, paddingBottom: 32, gap: 14, maxWidth: 560, width: "100%", alignSelf: "center" },
  metaRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", minHeight: 32 },
  reviewMeta: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: -8 },
  reviewTag: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.pill, borderWidth: 1, borderColor: color.hairline, backgroundColor: color.surface },
  reviewOk: { backgroundColor: color.greenSoft, borderColor: color.greenEdge },
  reviewIssue: { backgroundColor: color.terracottaSoft, borderColor: color.terracotta },
  constants: { alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill, backgroundColor: color.trackSoft },
  figureCard: { backgroundColor: color.surface, borderWidth: 1, borderColor: color.hairline, borderRadius: 20, padding: 12 },
  option: {
    minHeight: 50,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: radius.option,
    borderWidth: 1,
    borderColor: color.hairline,
    backgroundColor: color.surface,
    justifyContent: "center",
    gap: 6,
  },
  optionRight: { borderWidth: 1.5, borderColor: color.greenEdge, backgroundColor: color.greenSoft },
  optionWrong: { borderWidth: 1.5, borderColor: color.terracotta, backgroundColor: color.terracottaSoft },
  pictureGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  pictureOption: { width: "48.5%", paddingHorizontal: 10 },
  sheet: {
    backgroundColor: color.surface,
    borderTopWidth: 1,
    borderColor: color.hairline,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: gutter,
    paddingTop: 18,
    width: "100%",
    maxWidth: 560,
    alignSelf: "center",
  },
});
