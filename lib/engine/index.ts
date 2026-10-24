import type { AppState, EngineResult, Profile, UserModel } from "../types";
import { defaultModel, applyFeedback, mergeLearnedSignals } from "./model";
import { evaluateCheckin } from "./nudge";
export { defaultModel, applyFeedback, mergeLearnedSignals, evaluateCheckin };
export { carePath } from "./care-router";
export { rankProviders } from "./fit";
export function replay(state: AppState): { model: UserModel; profile: Profile; results: Record<string, EngineResult> } {
  if (!state.profile) throw new Error("A profile is required to replay check-ins");
  let profile = { ...state.profile, signals: state.profile.signals.map(s => ({ ...s })) };
  let model = state.model ? { ...state.model, weights: { ...state.model.weights } } : defaultModel();
  const results: Record<string, EngineResult> = {}, checkins = [...new Map(state.checkins.map(c => [c.date, c])).values()].sort((a, b) => a.date.localeCompare(b.date));
  const past: AppState["checkins"] = [];
  for (const checkin of checkins) {
    const current: AppState = { ...state, profile, model, checkins: past };
    const result = evaluateCheckin(current, checkin); results[checkin.id] = result;
    const feedback = checkin.driftFeedback === "struggling" ? 1 : checkin.driftFeedback === "fine" ? 0 : checkin.userLabel === "bad" ? 1 : checkin.userLabel === "good" ? 0 : null;
    if (feedback !== null) model = applyFeedback(model, current, checkin, feedback);
    if (checkin.userLabel === "bad") profile = mergeLearnedSignals(profile, checkin.features?.matchedSignalIds ?? [], []);
    past.push({ ...checkin, modelP: result.p });
  }
  return { profile, model, results };
}
