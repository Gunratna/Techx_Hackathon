import { replay } from "@/lib/engine";
import type { AppState } from "@/lib/types";

const KEY = "mannsetu:v1";
const empty = (): AppState => ({ profile: null, model: null, checkins: [], consentAt: null });
export function load(): AppState {
  try {
    if (typeof window === "undefined") return empty();
    const value: AppState = JSON.parse(window.localStorage.getItem(KEY) ?? "null");
    if (!value || !Array.isArray(value.checkins) || !(value.consentAt === null || typeof value.consentAt === "string")) return empty();
    if (value.profile && (!Array.isArray(value.profile.signals) || !Array.isArray(value.profile.helpfulActions) || !Array.isArray(value.profile.prefs?.languages))) return empty();
    if (value.model && (!value.model.weights || typeof value.model.nLabels !== "number")) return empty();
    return { profile: value.profile ?? null, model: value.model ?? null, checkins: value.checkins, consentAt: value.consentAt };
  } catch { return empty(); }
}
export function save(state: AppState): boolean { try { window.localStorage.setItem(KEY, JSON.stringify(state)); return true; } catch { return false; } }
export function reset(): boolean { try { window.localStorage.removeItem(KEY); return true; } catch { return false; } }
export async function loadDemo(): Promise<AppState> {
  if (!load().consentAt) throw new Error("Please confirm your age and consent before loading the fictional demo.");
  const response = await fetch("/demo-user.json", { cache: "no-store" });
  if (!response.ok) throw new Error("The fictional demo history is not available yet. You can still get started with your own profile.");
  const raw = await response.json();
  const state: AppState = { profile: raw.profile, model: raw.model ?? null, checkins: raw.checkins, consentAt: load().consentAt };
  if (!state.profile || !Array.isArray(state.profile.signals) || !Array.isArray(state.checkins)) throw new Error("The demo history could not be loaded.");
  const replayed = replay(state);
  const next = { ...state, profile: replayed.profile, model: replayed.model, checkins: state.checkins.map(c => ({ ...c, modelP: replayed.results[c.id]?.p ?? c.modelP })) };
  if (!save(next)) throw new Error("Your browser could not save the demo. Please allow local storage and try again.");
  return next;
}
export function localDate(date = new Date()): string { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`; }
