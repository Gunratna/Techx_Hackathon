import type { AppState, Checkin, FeatureKey } from "../types";
export type Vector = Record<FeatureKey, number>;
export const clip = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));
export const day = (date: string) => Date.parse(`${date.slice(0, 10)}T00:00:00Z`) / 86400000;
export function history(state: AppState, current: Checkin): Checkin[] {
  const dates = new Map<string, Checkin>();
  for (const c of state.checkins) if (c.date < current.date) dates.set(c.date, c);
  return [...dates.values()].sort((a, b) => a.date.localeCompare(b.date));
}
export function vector(state: AppState, current: Checkin): Vector {
  const prior = history(state, current), available = prior.filter(c => c.features !== null);
  let baseline = available.filter(c => c.userLabel !== "bad").slice(-14);
  if (baseline.length < 5) baseline = available;
  function drop(key: "valence" | "energy" | "social"): number {
    if (!current.features || (key === "social" && current.features.social === 0)) return 0;
    const values = baseline.map(c => c.features![key]);
    const mean = values.length < 3 ? .2 : values.reduce((a, b) => a + b, 0) / values.length;
    const std = values.length < 3 ? .4 : Math.max(.15, Math.sqrt(values.reduce((sum, n) => sum + (n - mean) ** 2, 0) / values.length));
    return clip((mean - current.features[key]) / std, 0, 3);
  }
  const active = new Set(state.profile?.signals.filter(s => s.active).map(s => s.id) ?? []);
  const recent = [...prior, current].filter(c => day(current.date) - day(c.date) < 3);
  const signals = new Set(recent.flatMap(c => c.features?.matchedSignalIds ?? []).filter(id => active.has(id)));
  const sleep = current.sleepHoursInput ?? current.features?.sleepHours;
  return { valenceDrop: drop("valence"), energyDrop: drop("energy"), socialDrop: drop("social"),
    lowSleep: sleep == null ? 0 : sleep < 5 ? 1.5 : sleep < 6 ? .75 : 0, signalCount3d: clip(signals.size, 0, 3),
    gapDays: prior.length ? clip(day(current.date) - day(prior[prior.length - 1].date) - 1, 0, 3) : 0,
    badThemeLoad: clip(.5 * new Set(current.features?.themes.filter(t => ["loneliness", "self_worth", "sleep", "food"].includes(t)) ?? []).size, 0, 3) };
}
