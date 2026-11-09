// "Dawn" tokens. Source: docs/living/ux-design.md#design-system-dawn and DR-0025.
// Each colour means one thing only: yellow = today / you, lavender = progress,
// green = correct / mastered, terracotta = fading / where marks slip.

export const color = {
  skyTop: "#E3ECFB",
  skyMid: "#F4F2F2",
  skyBottom: "#FDEAD6",
  sessionGround: "#EEF2FB",
  doneGround: "#F8F7F3",
  sunriseTop: "#BFD5F5",
  sunriseMid: "#DDE5F5",
  sunriseLow: "#FBDDBD",
  sunriseBottom: "#F8BE93",

  ink: "#1B1F4B",
  muted: "#555A80",
  faint: "#B4BAD3",

  surface: "#FFFFFF",
  hairline: "#D8DFEF",
  track: "#D8DFEF",
  trackSoft: "#E3E8F6",

  yellow: "#F6C453",
  yellowEdge: "#D49A1E",
  yellowSoft: "rgba(246,196,83,0.35)",
  lavender: "#7569D6",
  green: "#23694D",
  greenEdge: "#3E9470",
  greenSoft: "#DDF1E6",
  greenInk: "#1C5A41",
  terracotta: "#C4693F",
  terracottaSoft: "#F8E4DA",
  terracottaInk: "#8E4322",
} as const;

export const radius = { card: 26, sheet: 24, option: 16, pill: 999, bar: 7 } as const;

export const font = {
  light: "Geist_300Light",
  regular: "Geist_400Regular",
  medium: "Geist_500Medium",
  semibold: "Geist_600SemiBold",
  siRegular: "NotoSansSinhala_400Regular",
  siMedium: "NotoSansSinhala_500Medium",
} as const;

export const fontFiles = {
  [font.light]: require("@expo-google-fonts/geist/300Light/Geist_300Light.ttf"),
  [font.regular]: require("@expo-google-fonts/geist/400Regular/Geist_400Regular.ttf"),
  [font.medium]: require("@expo-google-fonts/geist/500Medium/Geist_500Medium.ttf"),
  [font.semibold]: require("@expo-google-fonts/geist/600SemiBold/Geist_600SemiBold.ttf"),
  [font.siRegular]: require("@expo-google-fonts/noto-sans-sinhala/400Regular/NotoSansSinhala_400Regular.ttf"),
  [font.siMedium]: require("@expo-google-fonts/noto-sans-sinhala/500Medium/NotoSansSinhala_500Medium.ttf"),
};

export const gutter = 24;
