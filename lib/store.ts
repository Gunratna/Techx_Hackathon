import { replay } from "@/lib/engine";
import type { AppState } from "@/lib/types";

const empty = (): AppState => ({ profile: null, model: null, checkins: [], consentAt: null });
let memory: AppState = empty();

// This module is held by the browser tab. No browser or remote persistence.
export function load(): AppState {
  try { return typeof window === "undefined" ? empty() : structuredClone(memory); }
  catch { return empty(); }
}
export function save(state: AppState): boolean {
  try { if (typeof window === "undefined") return false; memory = structuredClone(state); return true; }
  catch { return false; }
}
export function reset(): boolean { memory = empty(); return true; }
export async function loadDemo(): Promise<AppState> {
  const consentAt = load().consentAt;
  if (!consentAt) throw new Error("Please confirm your age and consent before loading the fictional demo.");
  const response = await fetch("/demo-user.json", { cache: "no-store" });
  if (!response.ok) throw new Error("The fictional demo could not be opened. Please try again.");
  const raw = await response.json();
  if (!raw.profile || !Array.isArray(raw.checkins) || raw.checkins.length > 30) throw new Error("The demo history could not be loaded.");
  // Always replay the original untrained fixture, never the current trained state.
  const original: AppState = { profile: raw.profile, model: raw.model ?? null, checkins: raw.checkins, consentAt };
  const result = replay(original);
  const next: AppState = { ...original, profile: result.profile, model: result.model, checkins: original.checkins.map(c => ({ ...c, modelP: result.results[c.id]?.p ?? c.modelP })) };
  if (!save(next)) throw new Error("This tab could not hold the demo. Please try again.");
  return load();
}
export function localDate(date = new Date()): string { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`; }
