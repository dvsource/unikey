import AsyncStorage from "@react-native-async-storage/async-storage";
import { packs } from "../content/pack";
import { StudySession, studyContent, STUDY_KEY } from "./study";

// Native getItem in AsyncStorage 2.2.0 treats "" as absent. multiGet returns
// the stored string verbatim, which lets recovery preserve a blank value.
async function readStudyValue(key: string) {
  const [pair] = await AsyncStorage.multiGet([key]);
  return pair?.[1] ?? null;
}
export async function hasSavedStudy() {
  return await readStudyValue(STUDY_KEY) !== null;
}

const storage = {
  getItem: readStudyValue,
  setItem: (key: string, value: string) => AsyncStorage.setItem(key, value),
};

let device: StudySession | undefined;
export function deviceSession() {
  return device ??= new StudySession(studyContent(packs), storage, Date.now() >>> 0);
}
