import type { AppState, CareLevel, CarePath, Checkin, EngineResult, Preferences, Profile, Provider, ProviderMatch, UserModel } from "../types";
import { MOCK_MODEL, MOCK_PROFILE } from "../mock";
export function defaultModel(): UserModel { return { ...MOCK_MODEL, weights: { ...MOCK_MODEL.weights } }; }
export function evaluateCheckin(state: AppState, checkin: Checkin): EngineResult {
  void state;
  return { p: .75, state: checkin.features?.safety === "urgent" ? "crisis" : "drift", driftDaysLast7: 4, explanations: [] };
}
export function applyFeedback(model: UserModel, state: AppState, checkin: Checkin, y: 0 | 1): UserModel {
  void state; void y;
  return { ...model, weights: { ...model.weights }, nLabels: model.nLabels + 1, updatedAt: checkin.date };
}
export function mergeLearnedSignals(profile: Profile, matchedIds: string[], candidates: {id:string;text:string}[]): Profile {
  void matchedIds; void candidates; return { ...profile, signals: profile.signals.map(s => ({ ...s })) };
}
export function replay(state: AppState): { model: UserModel; profile: Profile; results: Record<string, EngineResult> } {
  return { model: state.model ?? defaultModel(), profile: state.profile ?? structuredClone(MOCK_PROFILE), results: Object.fromEntries(state.checkins.map(c => [c.id, evaluateCheckin(state, c)])) };
}
export function carePath(result: EngineResult, profile: Profile): CarePath {
  void profile; return result.state === "crisis" ? { recommended: 5, alsoOffer: [2], reasons: ["Help is available right now."] } : { recommended: 3, alsoOffer: [2, 1], reasons: [`Different from your usual on ${result.driftDaysLast7} of the last 7 days`] };
}
export function rankProviders(providers: Provider[], level: CareLevel, prefs: Preferences): ProviderMatch[] {
  void level; void prefs; return providers.map(provider => ({ provider, score: 0, reasons: [], unknowns: ["Session fee", "Languages they speak"] }));
}
