export function studyEnabled() {
  return process.env.EXPO_PUBLIC_STUDY_ENGINE === "1";
}

export function adaptiveStudy(mode: string, requestedItem?: string) {
  return studyEnabled() && (mode === "today" || (mode === "skill" && !requestedItem));
}
