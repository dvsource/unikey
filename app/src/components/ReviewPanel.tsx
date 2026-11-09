import { useEffect, useState } from "react";
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Item, Variant } from "../content/pack";
import { Issue, ReviewRecord } from "../state/store";
import { color, font } from "../theme";
import { Txt } from "./Txt";
import { Button, Chip } from "./ui";

const ISSUES: { id: Issue; label: string }[] = [
  { id: "wrong-physics", label: "Wrong physics" },
  { id: "bad-sinhala", label: "Bad Sinhala" },
  { id: "bad-distractor", label: "Bad distractor" },
  { id: "other", label: "Other" },
];

export const LETTERS = "ABCDEFGH";

type Props = {
  visible: boolean;
  item: Item;
  variant: Variant;
  variantLabel: string | null;
  existing?: ReviewRecord;
  reviewerName: string;
  onSetReviewerName: (name: string) => void;
  onSave: (r: ReviewRecord) => void;
  onClear: () => void;
  onClose: () => void;
};

export function ReviewPanel({ visible, item, variant, variantLabel, existing, reviewerName, onSetReviewerName, onSave, onClear, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const [ok, setOk] = useState(false);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [picked, setPicked] = useState<number[]>([]);
  const [note, setNote] = useState("");
  const [name, setName] = useState(reviewerName);

  useEffect(() => {
    if (!visible) return;
    setOk(existing?.verdict === "ok");
    setIssues(existing?.issues ?? []);
    setPicked(existing?.distractors.map((d) => d.index) ?? []);
    setNote(existing?.note ?? "");
    setName(reviewerName);
  }, [visible, existing, reviewerName]);

  const toggleIssue = (id: Issue) => {
    setOk(false);
    setIssues((list) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]));
  };
  const togglePick = (i: number) => setPicked((list) => (list.includes(i) ? list.filter((x) => x !== i) : [...list, i].sort()));

  const needsDistractor = issues.includes("bad-distractor") && picked.length === 0;
  const canSave = !!name.trim() && (ok || issues.length > 0) && !needsDistractor;

  const save = () => {
    const reviewer = name.trim();
    if (reviewer !== reviewerName) onSetReviewerName(reviewer);
    onSave({
      item_id: item.id,
      variant_id: variant.vid,
      variant_values: variant.values,
      item_version: item.version,
      spec_version: item.spec_version,
      pack: item.pack,
      verdict: ok ? "ok" : "issues",
      issues: ok ? [] : issues,
      distractors: ok || !issues.includes("bad-distractor")
        ? []
        : picked.map((i) => ({
            index: i,
            letter: LETTERS[i],
            text_en: variant.options[i].text.en,
            text_si: variant.options[i].text.si,
            tag: variant.options[i].tag,
          })),
      note: note.trim(),
      reviewer,
      timestamp: new Date().toISOString(),
    });
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} accessibilityLabel="Close review" onPress={onClose} />
        <View style={[styles.sheet, { paddingBottom: insets.bottom + 18 }]}>
          <ScrollView contentContainerStyle={{ gap: 16 }} keyboardShouldPersistTaps="handled">
            <View style={{ gap: 2 }}>
              <Txt size={18} weight="semibold">
                Review this item
              </Txt>
              <Txt size={13} tone="muted">
                {`${item.id} · ${item.layer} ${item.form} · v${item.version}${variantLabel ? ` · ${variantLabel}` : ""}`}
              </Txt>
            </View>

            {!reviewerName && (
              <View style={{ gap: 6 }}>
                <Txt size={14} weight="medium">
                  Your name
                </Txt>
                <TextInput
                  testID="review-name"
                  value={name}
                  onChangeText={setName}
                  placeholder="Shown in the exported results"
                  placeholderTextColor={color.faint}
                  style={styles.input}
                  autoCapitalize="words"
                />
              </View>
            )}

            <View style={styles.chips}>
              <Chip
                testID="review-ok"
                label="OK"
                tone="green"
                active={ok}
                onPress={() => {
                  setOk(!ok);
                  setIssues([]);
                }}
              />
              {ISSUES.map((x) => (
                <Chip key={x.id} testID={`review-${x.id}`} label={x.label} tone="terracotta" active={issues.includes(x.id)} onPress={() => toggleIssue(x.id)} />
              ))}
            </View>

            {issues.includes("bad-distractor") && (
              <View style={{ gap: 8 }}>
                <Txt size={14} weight="medium">
                  Which option?
                </Txt>
                {variant.options.map((o, i) => (
                  <Pressable
                    key={i}
                    testID={`review-distractor-${i}`}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: picked.includes(i), disabled: o.correct }}
                    disabled={o.correct}
                    onPress={() => togglePick(i)}
                    style={[
                      styles.optRow,
                      picked.includes(i) && { borderColor: color.terracotta, backgroundColor: color.terracottaSoft },
                      o.correct && { opacity: 0.5 },
                    ]}
                  >
                    <Txt size={14} weight="semibold" style={{ width: 20 }}>
                      {LETTERS[i]}
                    </Txt>
                    <View style={{ flex: 1 }}>
                      <Txt size={15}>{o.text.si ?? o.text.en}</Txt>
                      <Txt size={12} tone="muted">
                        {o.correct ? "correct answer" : o.tag ?? "no tag"}
                      </Txt>
                    </View>
                  </Pressable>
                ))}
              </View>
            )}

            <View style={{ gap: 6 }}>
              <Txt size={14} weight="medium">
                Note
              </Txt>
              <TextInput
                testID="review-note"
                value={note}
                onChangeText={setNote}
                returnKeyType="done"
                submitBehavior="blurAndSubmit"
                placeholder="What should change? Sinhala or English is fine."
                placeholderTextColor={color.faint}
                multiline
                style={[styles.input, { minHeight: 88, textAlignVertical: "top", paddingTop: 12 }]}
              />
            </View>

            <View style={{ flexDirection: "row", gap: 10 }}>
              {existing ? (
                <Button testID="review-clear" kind="secondary" label="Clear mark" onPress={onClear} style={{ flex: 1 }} />
              ) : (
                <Button testID="review-cancel" kind="secondary" label="Cancel" onPress={onClose} style={{ flex: 1 }} />
              )}
              <Button testID="review-save" label="Save" onPress={save} disabled={!canSave} style={{ flex: 2 }} />
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(27,31,75,0.35)" },
  sheet: {
    maxHeight: "88%",
    backgroundColor: color.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 22,
    width: "100%",
    maxWidth: 560,
    alignSelf: "center",
  },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
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
  optRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: color.hairline,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
});
