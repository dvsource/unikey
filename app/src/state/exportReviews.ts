import Constants from "expo-constants";
import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import { Platform, Share } from "react-native";
import { packs } from "../content/pack";
import { ReviewRecord } from "./store";

// Review export: one JSON file, shared through the system share sheet so it can
// go over WhatsApp. scripts/merge-review.mjs merges it into the pack's
// review-results.json.

export function buildExport(reviews: Record<string, ReviewRecord>, reviewer: string) {
  const results = Object.values(reviews).sort(
    (a, b) => a.item_id.localeCompare(b.item_id) || String(a.variant_id).localeCompare(String(b.variant_id)),
  );
  return {
    format: "unikey-review/1",
    exported_at: new Date().toISOString(),
    reviewer,
    app_version: Constants.expoConfig?.version ?? "dev",
    packs: packs.map((p) => ({ id: p.id, spec_version: p.spec_version, built_at: p.built_at, items: p.items.length })),
    results,
  };
}

export function fileName(reviewer: string) {
  // Sinhala names have no Latin letters, so fall back to "reviewer" (the name is inside the file too).
  const who = reviewer.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "reviewer";
  const stamp = new Date().toISOString().slice(0, 16).replace(/[:T]/g, "-");
  return `unikey-review-${who}-${stamp}.json`;
}

export async function shareExportFile(reviews: Record<string, ReviewRecord>, reviewer: string) {
  const json = JSON.stringify(buildExport(reviews, reviewer), null, 1);
  const name = fileName(reviewer);
  if (Platform.OS === "web") {
    const url = URL.createObjectURL(new Blob([json], { type: "application/json" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
    return;
  }
  const file = new File(Paths.cache, name);
  file.create({ overwrite: true });
  await file.write(json);
  if (!(await Sharing.isAvailableAsync())) throw new Error("Sharing is not available on this device");
  await Sharing.shareAsync(file.uri, { mimeType: "application/json", dialogTitle: "Send review results", UTI: "public.json" });
}

// Fallback: the same JSON as plain text, for apps that won't take a file.
export async function shareExportText(reviews: Record<string, ReviewRecord>, reviewer: string) {
  const json = JSON.stringify(buildExport(reviews, reviewer));
  await Share.share({ message: json, title: fileName(reviewer) });
}
