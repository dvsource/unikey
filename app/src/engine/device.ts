import AsyncStorage from "@react-native-async-storage/async-storage";
import { packs } from "../content/pack";
import { StudySession, studyContent } from "./study";

let device: StudySession | undefined;
export function deviceSession() {
  return device ??= new StudySession(studyContent(packs), AsyncStorage, Date.now() >>> 0);
}
