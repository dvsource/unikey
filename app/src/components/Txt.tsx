import { ReactNode } from "react";
import { StyleProp, Text, TextProps, TextStyle } from "react-native";
import { color, font } from "../theme";

// Mixed-script text. Sinhala runs are set in Noto Sans Sinhala, everything else
// (numbers, symbols, English UI words) stays in Geist (DR-0024). Lines that hold
// Sinhala get a taller line height and slightly smaller headings.

type Weight = "light" | "regular" | "medium" | "semibold";

const SINHALA = /[඀-෿]/;
const JOINER = /[‌‍]/;

const latinFont: Record<Weight, string> = {
  light: font.light,
  regular: font.regular,
  medium: font.medium,
  semibold: font.semibold,
};
const sinhalaFont: Record<Weight, string> = {
  light: font.siRegular,
  regular: font.siRegular,
  medium: font.siMedium,
  semibold: font.siMedium,
};

export function hasSinhala(s: string) {
  return SINHALA.test(s);
}

function runs(s: string) {
  const out: { si: boolean; text: string }[] = [];
  for (const ch of s) {
    const si = SINHALA.test(ch) || JOINER.test(ch);
    const neutral = /\s/.test(ch);
    const last = out[out.length - 1];
    if (last && (neutral || last.si === si)) last.text += ch;
    else out.push({ si, text: ch });
  }
  return out;
}

type Props = TextProps & {
  children?: ReactNode;
  size?: number;
  weight?: Weight;
  tone?: "ink" | "muted" | string;
  style?: StyleProp<TextStyle>;
};

export function Txt({ children, size = 16, weight = "regular", tone = "ink", style, ...rest }: Props) {
  const flat = typeof children === "string" ? children : null;
  const si = flat != null && hasSinhala(flat);
  const shown = si && size >= 20 ? Math.round(size * 0.92) : size;
  const base: TextStyle = {
    fontFamily: latinFont[weight],
    fontSize: shown,
    lineHeight: Math.round(shown * (si ? 1.6 : 1.3)),
    color: tone === "ink" ? color.ink : tone === "muted" ? color.muted : tone,
  };
  if (!si || flat == null) {
    return (
      <Text style={[base, style]} {...rest}>
        {children}
      </Text>
    );
  }
  return (
    <Text style={[base, style]} {...rest}>
      {runs(flat).map((r, i) =>
        r.si ? (
          <Text key={i} style={{ fontFamily: sinhalaFont[weight] }}>
            {r.text}
          </Text>
        ) : (
          r.text
        ),
      )}
    </Text>
  );
}
