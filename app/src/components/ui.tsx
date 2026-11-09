import { LinearGradient } from "expo-linear-gradient";
import { ReactNode } from "react";
import { Pressable, StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import Svg, { Circle, Path, SvgXml } from "react-native-svg";
import { color, radius } from "../theme";
import { Txt } from "./Txt";

export function Sky({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <LinearGradient
      colors={[color.skyTop, color.skyMid, color.skyBottom]}
      locations={[0, 0.62, 1]}
      style={[{ flex: 1 }, style]}
    >
      {children}
    </LinearGradient>
  );
}

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

type ButtonProps = {
  label: string;
  onPress: () => void;
  kind?: "primary" | "secondary" | "ghost";
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  small?: boolean;
  testID?: string;
};

// Yellow pill with indigo text for the main action; outlined indigo pill for secondary.
export function Button({ label, onPress, kind = "primary", disabled, style, small, testID }: ButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      testID={testID}
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        small && { height: 40, paddingHorizontal: 16 },
        kind === "primary" && { backgroundColor: color.yellow },
        kind === "secondary" && { borderWidth: 1.5, borderColor: color.ink },
        kind === "ghost" && { backgroundColor: color.trackSoft },
        disabled && { opacity: 0.4 },
        pressed && { opacity: 0.75 },
        style,
      ]}
    >
      <Txt size={small ? 14 : 16} weight={kind === "primary" ? "semibold" : "medium"}>
        {label}
      </Txt>
    </Pressable>
  );
}

export function Chip({
  label,
  active,
  onPress,
  tone = "ink",
  testID,
}: {
  testID?: string;
  label: string;
  active?: boolean;
  onPress?: () => void;
  tone?: "ink" | "green" | "terracotta";
}) {
  const on = { ink: color.ink, green: color.green, terracotta: color.terracotta }[tone];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: !!active }}
      testID={testID}
      onPress={onPress}
      style={[
        styles.chip,
        active ? { backgroundColor: on, borderColor: on } : { backgroundColor: color.surface, borderColor: color.hairline },
      ]}
    >
      <Txt size={14} weight="medium" tone={active ? "#FFFFFF" : "ink"}>
        {label}
      </Txt>
    </Pressable>
  );
}

export function Sun({ size = 16, glow = 10 }: { size?: number; glow?: number }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color.yellow,
        boxShadow: `0 0 ${glow}px rgba(240,170,60,0.6)`,
      }}
    />
  );
}

export function ProgressBar({ value, height = 6 }: { value: number; height?: number }) {
  return (
    <View style={{ height, borderRadius: height / 2, backgroundColor: color.track, overflow: "hidden" }}>
      <View
        style={{ width: `${Math.round(Math.max(0, Math.min(1, value)) * 100)}%`, height, borderRadius: height / 2, backgroundColor: color.lavender }}
      />
    </View>
  );
}

export function Divider({ style }: { style?: StyleProp<ViewStyle> }) {
  return <View style={[{ height: 1, backgroundColor: color.hairline }, style]} />;
}

// Content drawings (card options and F44 figures), scaled to the available width.
export function Figure({ svg, maxWidth = 320, label }: { svg: string; maxWidth?: number; label?: string }) {
  const vb = svg.match(/viewBox="([\d.\s-]+)"/)?.[1].split(/\s+/).map(Number) ?? [0, 0, 170, 120];
  const ratio = vb[3] / vb[2];
  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={label}
      // Drawings never take touches: inside a picture option the tap must reach the option.
      style={{ width: "100%", maxWidth, aspectRatio: 1 / ratio, alignSelf: "center", pointerEvents: "none" }}
    >
      <SvgXml xml={svg} width="100%" height="100%" />
    </View>
  );
}

// Sigiriya line art in draw order (rock, terraces, ground, bushes) with each stroke's length.
const SIGIRIYA: [string, number][] = [
  ["M92 130C104 126 112 112 118 96C122 84 120 66 128 52C132 44 140 40 152 38L214 36C226 36 232 42 236 52C244 72 242 92 252 108C258 118 266 126 278 130", 303.1],
  ["M134 62C150 58 190 58 230 60", 96.2],
  ["M124 88C152 82 200 84 240 88", 116.4],
  ["M114 110C150 104 210 106 250 112", 136.4],
  ["M0 130H342", 342],
  ["M14 130c-2-12 16-12 14 0", 26.4],
  ["M32 130c-1-8 12-8 11 0", 18.7],
  ["M300 130c-2-12 16-12 14 0", 26.4],
  ["M318 130c-1-8 12-8 11 0", 18.7],
];
const SIGIRIYA_TOTAL = SIGIRIYA.reduce((n, [, len]) => n + len, 0);

// Sigiriya line art, drawn in indigo over a faint dashed outline as skills are mastered.
export function Sigiriya({ drawn, width = 342 }: { drawn: number; width?: number }) {
  let left = Math.max(0, Math.min(1, drawn)) * SIGIRIYA_TOTAL;
  return (
    <Svg width={width} height={(width * 118) / 342} viewBox="0 12 342 124" fill="none">
      <Circle cx={298} cy={36} r={15} fill={color.yellow} />
      {SIGIRIYA.map(([d], i) => (
        <Path key={`o${i}`} d={d} stroke={color.faint} strokeWidth={1.2} strokeDasharray="3 4" strokeLinecap="round" />
      ))}
      {SIGIRIYA.map(([d, len], i) => {
        const show = Math.min(len, left);
        left -= show;
        if (show <= 0) return null;
        return (
          <Path key={`d${i}`} d={d} stroke={color.ink} strokeWidth={1.5} strokeDasharray={`${show} ${len}`} strokeLinecap="round" />
        );
      })}
    </Svg>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: color.surface,
    borderWidth: 1,
    borderColor: color.hairline,
    borderRadius: radius.card,
    padding: 22,
  },
  button: {
    height: 52,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  chip: {
    minHeight: 40,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 1,
    justifyContent: "center",
  },
});
