import type { AppState, Checkin, DriftState, EngineResult, Explanation, FeatureKey, UserModel } from "../types";
import { day, history, vector, type Vector } from "./features";
import { defaultModel, score } from "./model";
// Serializable metadata supplies sleep history through the fixed carePath signature.
export type EvaluatedResult = EngineResult & { shortSleepNightsLast7: number };
function driftState(c: Checkin, count: number, model: UserModel, p: number, previous: number, x: Vector): DriftState {
  if (c.features?.safety === "urgent") return "crisis";
  if (count < 4 && model.nLabels < 3) return "learning";
  if (p >= .7 || (p >= .55 && (previous >= .45 || x.signalCount3d >= 2))) return "drift";
  return c.features?.safety === "concern" ? "drift" : "steady";
}
function explain(state: AppState, current: Checkin, model: UserModel, x: Vector): Explanation[] {
  const prior = history(state, current), recent = [...prior, current].filter(c => day(current.date) - day(c.date) < 3);
  const ids = new Set(recent.flatMap(c => c.features?.matchedSignalIds ?? []));
  const signals = state.profile?.signals.filter(s => s.active && ids.has(s.id)) ?? [];
  const themes = current.features?.themes.filter(t => ["loneliness", "self_worth", "sleep", "food"].includes(t)) ?? [];
  const messages: Record<FeatureKey, string> = {
    signalCount3d: `You've said ${signals.map(s => s.text).join(", ")} tend to come before your harder weeks.`,
    socialDrop: "You're mentioning people less than you usually do.", valenceDrop: "Your notes sound flatter than your usual.", energyDrop: "Your notes sound more drained than usual.",
    lowSleep: `Short sleep recently (${current.sleepHoursInput ?? current.features?.sleepHours} hours).`,
    gapDays: `It's been ${prior.length ? day(current.date) - day(prior[prior.length - 1].date) : 0} days since your last check-in.`,
    badThemeLoad: `Today touches on ${themes.join(", ")}, which has come up on harder days.` };
  const evidenceFeatures: Record<FeatureKey, string[]> = { valenceDrop: ["valence"], energyDrop: ["energy"], socialDrop: ["social"], lowSleep: ["sleep"], signalCount3d: ["signal"], gapDays: ["valence", "energy", "social", "sleep", "signal", "theme"], badThemeLoad: ["theme"] };
  return (Object.keys(x) as FeatureKey[]).map(feature => {
    const sources = feature === "signalCount3d" ? recent.filter(c => c.features?.matchedSignalIds.some(id => signals.some(s => s.id === id))) : feature === "gapDays" ? prior.slice(-1) : [current];
    const quotes = [...new Set(sources.flatMap(c => (c.features?.evidence ?? []).filter(e => evidenceFeatures[feature].includes(e.feature) && e.quote.length > 0 && (c.goodNote.includes(e.quote) || c.hardNote.includes(e.quote))).map(e => e.quote)))].slice(0, 3);
    return { feature, contribution: model.weights[feature] * x[feature], message: messages[feature], quotes };
  }).filter(e => e.contribution > .15 && e.quotes.length > 0).sort((a, b) => b.contribution - a.contribution).slice(0, 3);
}
export function evaluateCheckin(state: AppState, checkin: Checkin): EngineResult {
  const model = state.model ?? defaultModel(), all = [...history(state, checkin), checkin];
  let previous = 0, count = 0, currentP = 0, currentState: DriftState = "learning", driftDaysLast7 = 0;
  for (const item of all) {
    const x = vector(state, item), p = score(model, x), itemState = driftState(item, count, model, p, previous, x);
    if (day(checkin.date) - day(item.date) < 7 && (itemState === "drift" || itemState === "crisis")) driftDaysLast7++;
    if (item.features) count++;
    previous = p; currentP = p; currentState = itemState;
  }
  const result: EvaluatedResult = { p: currentP, state: currentState, driftDaysLast7, explanations: explain(state, checkin, model, vector(state, checkin)),
    shortSleepNightsLast7: all.filter(c => day(checkin.date) - day(c.date) < 7 && (c.sleepHoursInput ?? c.features?.sleepHours ?? 24) < 5).length };
  return result;
}
