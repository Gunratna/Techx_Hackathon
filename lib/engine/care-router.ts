import type { CareLevel, CarePath, EngineResult, Profile } from "../types";
import type { EvaluatedResult } from "./nudge";
export function carePath(result: EngineResult, profile: Profile): CarePath {
  const shortSleep = (result as Partial<EvaluatedResult>).shortSleepNightsLast7 ?? 0;
  let recommended: CareLevel, alsoOffer: CareLevel[];
  const reasons: string[] = [];
  if (result.state === "crisis") return { recommended: 5, alsoOffer: [2], reasons: ["Help is available right now."] };
  if (result.state === "drift") {
    reasons.push(`Different from your usual on ${result.driftDaysLast7} of the last 7 days`);
    if (shortSleep >= 5) reasons.push(`Short sleep on ${shortSleep} nights`);
    if (result.driftDaysLast7 >= 5 || shortSleep >= 5) { recommended = 4; alsoOffer = [2, 3]; }
    else if (result.driftDaysLast7 >= 3) { recommended = 3; alsoOffer = [2, 1]; }
    else { recommended = profile.trustedPerson ? 1 : 0; alsoOffer = [2, 3]; }
  } else {
    recommended = { tips_first: 0, talk_to_someone: 2, see_professional: 3 }[profile.prefs.readiness] as CareLevel;
    alsoOffer = [2, 3]; reasons.push(profile.prefs.readiness === "tips_first" ? "You said you'd like to start with small steps" : "You said you'd like to talk to someone");
  }
  if (profile.prefs.readiness === "see_professional" && recommended < 3) recommended = 3;
  if (recommended !== 2) alsoOffer.push(2);
  return { recommended, alsoOffer: [...new Set(alsoOffer)].filter(l => l !== recommended), reasons };
}
