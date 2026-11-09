import { StyleSheet, View } from "react-native";
import { currentPack, packs } from "../content/pack";
import { useStore } from "../state/store";
import { Chip } from "./ui";

// Unit chips (Sinhala names). The pick is one shared setting: Today, Learn and
// "Review next 10" all follow it. The chips wrap rather than scroll, so every unit
// stays visible on narrow phones. Hidden while only one pack is bundled.
export function UnitPicker() {
  const { settings, setSettings } = useStore();
  if (packs.length < 2) return null;
  const selected = currentPack(settings.unit).id;
  return (
    <View style={styles.row} accessibilityRole="tablist" testID="unit-picker">
      {packs.map((p) => (
        <Chip key={p.id} testID={`unit-${p.id}`} label={p.unit.name_si} active={p.id === selected} onPress={() => setSettings({ unit: p.id })} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({ row: { flexDirection: "row", flexWrap: "wrap", gap: 8 } });
