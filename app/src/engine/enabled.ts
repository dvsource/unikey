export function adaptiveToday(mode: string) {
  return mode === "today" && process.env.EXPO_PUBLIC_STUDY_ENGINE === "1";
}
