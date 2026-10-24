import type { AppState, Checkin, FeatureKey, Profile, UserModel } from "../types";
import { clip, vector, type Vector } from "./features";
export function defaultModel(): UserModel {
  return { weights: { bias: -2, valenceDrop: 1, energyDrop: .6, socialDrop: .8, lowSleep: .8, signalCount3d: .9, gapDays: .5, badThemeLoad: .4 }, nLabels: 0, updatedAt: "" };
}
export function score(model: UserModel, x: Vector): number {
  const logit = Object.entries(x).reduce((sum, [key, value]) => sum + model.weights[key as FeatureKey] * value, model.weights.bias);
  return 1 / (1 + Math.exp(-logit));
}
export function applyFeedback(model: UserModel, state: AppState, checkin: Checkin, y: 0 | 1): UserModel {
  const x = vector(state, checkin), delta = .25 * (y - score(model, x));
  const weights = { ...model.weights, bias: clip(model.weights.bias + delta, -4, 1) };
  for (const key of Object.keys(x) as FeatureKey[]) weights[key] = clip(weights[key] + delta * x[key], -1, 3);
  return { weights, nLabels: model.nLabels + 1, updatedAt: checkin.date };
}
export function mergeLearnedSignals(profile: Profile, matchedIds: string[], candidates: {id:string;text:string}[]): Profile {
  const signals = profile.signals.map(s => ({ ...s })), touched = new Set<string>();
  for (const id of new Set(matchedIds)) { const s = signals.find(s => s.id === id); if (s) { s.count++; touched.add(s.id); } }
  for (const candidate of candidates.slice(0, 2)) {
    if (!candidate.id.trim() || !candidate.text.trim()) continue;
    const existing = signals.find(s => s.id === candidate.id || s.text.trim().toLowerCase() === candidate.text.trim().toLowerCase());
    if (existing) { if (!touched.has(existing.id)) { existing.count++; touched.add(existing.id); } }
    else { signals.push({ ...candidate, source: "learned", count: 1, active: false }); touched.add(candidate.id); }
  }
  return { ...profile, signals: signals.map(s => ({ ...s, active: s.source === "survey" || s.count >= 2 || s.active })) };
}
