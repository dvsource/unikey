import { useState } from "react";
import { Alert, Platform, ScrollView, StyleSheet, Switch, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Txt } from "../../components/Txt";
import { Button, Card, Divider, ProgressBar, Sky } from "../../components/ui";
import { items, packs } from "../../content/pack";
import { shareExportFile, shareExportText } from "../../state/exportReviews";
import { reviewedItemIds, useStore } from "../../state/store";
import { color, font, gutter } from "../../theme";

function notify(title: string, message: string) {
  if (Platform.OS === "web") window.alert(`${title}\n\n${message}`);
  else Alert.alert(title, message);
}

export default function ProgressScreen() {
  const insets = useSafeAreaInsets();
  const { settings, setSettings, reviews, progress, resetProgress } = useStore();
  const [busy, setBusy] = useState(false);

  const marks = Object.values(reviews);
  const reviewedIds = reviewedItemIds(reviews);
  const reviewed = reviewedIds.size;
  const flagged = new Set(marks.filter((r) => r.verdict === "issues").map((r) => r.item_id)).size;
  const answered = Object.values(progress.answers);
  const right = answered.filter((a) => a.correct).length;

  const send = async (asText: boolean) => {
    if (!settings.reviewerName.trim()) return notify("Add your name first", "Your name goes into the exported results.");
    if (!marks.length) return notify("Nothing to send yet", "Mark at least one item first.");
    setBusy(true);
    try {
      await (asText ? shareExportText : shareExportFile)(reviews, settings.reviewerName.trim());
    } catch (e) {
      notify("Couldn't share", String((e as Error).message ?? e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Sky>
      <ScrollView
        contentContainerStyle={[styles.page, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 120 }]}
        keyboardShouldPersistTaps="handled"
      >
        <Txt size={32} style={{ letterSpacing: -0.6 }}>
          Progress
        </Txt>

        <Card style={{ gap: 6, padding: 18 }}>
          <Txt size={15} tone="muted">
            Readiness, unit rings and fading skills come with the scheduler.
          </Txt>
          <Txt size={15}>{`${answered.length} ${answered.length === 1 ? "question" : "questions"} answered · ${right} right`}</Txt>
        </Card>

        <View style={{ gap: 12 }}>
          <Txt size={18} weight="medium">
            Teacher review
          </Txt>
          <Card style={{ gap: 12, padding: 18 }}>
            <View style={styles.rowBetween}>
              <Txt testID="progress-reviewed" size={15}>{`Reviewed ${reviewed} of ${items.length}`}</Txt>
              <Txt testID="progress-flagged" size={14} tone="muted">{`${flagged} with issues`}</Txt>
            </View>
            <ProgressBar value={reviewed / items.length} />
            {packs.map((p) => {
              const done = p.items.filter((it) => reviewedIds.has(it.id)).length;
              return (
                <View key={p.id} style={{ gap: 2 }}>
                  <View style={styles.rowBetween}>
                    <Txt size={15}>{p.unit.name_si}</Txt>
                    <Txt testID={`progress-reviewed-${p.id}`} size={14} tone="muted">{`${done} of ${p.items.length}`}</Txt>
                  </View>
                  <Txt size={12} tone="muted">{`${p.id} · spec ${p.spec_version} · ${p.status}`}</Txt>
                </View>
              );
            })}
            <Divider />
            <View style={{ gap: 6 }}>
              <Txt size={14} weight="medium">
                Your name
              </Txt>
              <TextInput
                testID="progress-name"
                value={settings.reviewerName}
                onChangeText={(reviewerName) => setSettings({ reviewerName })}
                placeholder="Shown in the exported results"
                placeholderTextColor={color.faint}
                style={styles.input}
                autoCapitalize="words"
              />
            </View>
            <Button testID="send-results" label="Send results" onPress={() => send(false)} disabled={busy} />
            <Button testID="send-text" kind="secondary" label="Send as text" onPress={() => send(true)} disabled={busy} />
            <Txt size={13} tone="muted">
              Opens the share sheet with a JSON file, so you can send it on WhatsApp. "Send as text" pastes the same data as a message.
            </Txt>
          </Card>
        </View>

        <Card style={{ gap: 4, padding: 18 }}>
          <Toggle
            testID="toggle-reviewer-mode"
            label="Reviewer mode"
            hint="Item ids, a Review button on every item, and examples for templates."
            value={settings.reviewerMode}
            onChange={(reviewerMode) => setSettings({ reviewerMode })}
          />
          <Divider />
          <Toggle
            testID="toggle-show-english"
            label="Show English"
            hint="English under the Sinhala, for checking translations."
            value={settings.showEnglish}
            onChange={(showEnglish) => setSettings({ showEnglish })}
          />
          <Divider />
          <View style={{ paddingTop: 10 }}>
            <Button testID="reset-progress" kind="ghost" small label="Reset student progress" onPress={resetProgress} />
          </View>
        </Card>
      </ScrollView>
    </Sky>
  );
}

function Toggle({ label, hint, value, onChange, testID }: { label: string; hint: string; value: boolean; onChange: (v: boolean) => void; testID?: string }) {
  return (
    <View style={styles.toggle}>
      <View style={{ flex: 1, gap: 2 }}>
        <Txt size={15} weight="medium">
          {label}
        </Txt>
        <Txt size={13} tone="muted">
          {hint}
        </Txt>
      </View>
      <Switch
        testID={testID}
        value={value}
        onValueChange={onChange}
        trackColor={{ true: color.lavender, false: color.track }}
        thumbColor={color.surface}
        {...(Platform.OS === "web" ? { activeThumbColor: color.surface } : {})}
        accessibilityLabel={label}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  page: { paddingHorizontal: gutter, gap: 22, maxWidth: 520, width: "100%", alignSelf: "center" },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: color.hairline,
    borderRadius: 14,
    paddingHorizontal: 14,
    fontFamily: font.regular,
    fontSize: 15,
    color: color.ink,
  },
  toggle: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10 },
});
