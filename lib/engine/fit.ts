import type { CareLevel, Preferences, Provider, ProviderMatch } from "../types";
export function rankProviders(providers: Provider[], level: CareLevel, prefs: Preferences): ProviderMatch[] {
  const kinds: Record<number, string[]> = { 2: ["helpline"], 3: ["counsellor", "psychologist"], 4: ["psychiatrist", "hospital"], 5: ["emergency", "hospital"] };
  const matches = providers.map(provider => {
    let score = 0;
    const reasons: string[] = [], unknowns: string[] = [];
    function add(points: number, reason: string) { score += points; reasons.push(reason); }
    if (kinds[level]?.includes(provider.kind)) add(3, "Right kind of help for this step");
    if (provider.languages?.length) { const overlap = provider.languages.find(l => prefs.languages.some(p => p.toLowerCase() === l.toLowerCase())); if (overlap) add(3, `Speaks ${overlap}`); else score -= 2; }
    else unknowns.push("Languages they speak");
    if (provider.feeMax !== undefined) { if (provider.feeMax === 0) add(2, "Free"); else if (provider.feeMax <= prefs.budgetPerSession) add(2, "Within your budget"); else score--; }
    else unknowns.push("Session fee");
    if (provider.modes?.length) { const matched = prefs.mode === "either" ? provider.modes.find(m => m === "online" || m === "in_person") : provider.modes.find(m => m === prefs.mode); if (matched) add(2, `Offers ${matched === "in_person" ? "in-person" : "online"}`); }
    else unknowns.push("Online or in-person");
    if (prefs.providerGender !== "any" && provider.gender === prefs.providerGender) add(1, "Matches your provider gender preference");
    if (provider.distanceKm !== undefined && provider.distanceKm <= 15) add(provider.distanceKm <= 5 ? 2 : 1, `${provider.distanceKm.toFixed(1)} km away`);
    if (provider.credential === "verified") add(2, provider.isDemoListing ? "Registration verified (fictional demo)" : "Registration verified");
    else if (provider.credential === "public_service") add(1, "Government/public service");
    return { provider, score, reasons, unknowns };
  });
  const pinned = (p: Provider) => (level === 2 || level === 3) && p.source === "national" && p.feeMax === 0 ? 1 : 0;
  return matches.sort((a, b) => pinned(b.provider) - pinned(a.provider) || b.score - a.score || (a.provider.distanceKm ?? Infinity) - (b.provider.distanceKm ?? Infinity));
}
