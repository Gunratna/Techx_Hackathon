import { z } from "zod";
import { defaultModel } from "@/lib/engine";
import { MOCK_RESPONSES } from "@/lib/mock";
import { keywordSafety, maxSafety } from "@/lib/safety";
import { load, localDate } from "@/lib/store";
import { THEMES } from "@/lib/types";
import type { CareLevel, Checkin, CheckinFeatures, Degradable, Explanation, PersonalSignal, Preferences, Profile, Provider, ResourceCard, SessionBridge, Theme, UserModel } from "@/lib/types";

export type ClientStatus = Degradable & { offline?: boolean };
export type BuildProfileRequest = { name: string; who5: number[]; badDayDescription: string; earlySigns: string; helpfulActions: string; trustedPerson: Profile["trustedPerson"]; prefs: Preferences };
export type AnalyzeRequest = { goodNote: string; hardNote: string; sleepHoursInput: number | null; signals: PersonalSignal[] };
export type LearnRequest = { text: string; signals: PersonalSignal[] };
export type PlacesRequest = { level: CareLevel; location: Preferences["location"]; city: string; radiusKm: number };
export type BridgeRequest = { profile: Profile; checkins: Checkin[]; inMyWords: string; whatIWantFromSupport: string; availability: string; language: string };
export type SuggestRequest = { explanations: Explanation[]; themes: Theme[]; helpfulActions: string[] };
export type PlacesResponse = { providers: Provider[]; embedQuery: string; attribution: string } & ClientStatus;
export type SuggestResponse = { ownActions: string[]; cards: { card: ResourceCard; framing: string }[] } & ClientStatus;
export type ProviderApplication = { name: string; kind: Provider["kind"]; city?: string; languages?: string[]; modes?: ("phone" | "online" | "in_person")[]; fee_min?: number; fee_max?: number; registration_body?: "RCI" | "NMC" | "Other"; registration_number?: string; email?: string; phone?: string };
const routes = { "/api/build-profile": "buildProfile", "/api/analyze-checkin": "analyzeCheckin", "/api/learn": "learn", "/api/places": "places", "/api/providers": "providers", "/api/session-bridge": "sessionBridge", "/api/suggest": "suggest", "/api/provider-apply": "providerApply" } as const;
type Route = keyof typeof routes;
const split = (value: string) => [...new Set(value.split(/[\n;,]+/).map(s => s.trim()).filter(Boolean))];
const strings = z.array(z.string());
const level = z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]);
const kind = z.enum(["helpline", "counsellor", "psychologist", "psychiatrist", "hospital", "emergency"]);
const signal = z.object({ id: z.string(), text: z.string(), source: z.enum(["survey", "learned"]), count: z.number().nonnegative(), active: z.boolean() });
const prefs = z.object({ languages: strings, budgetPerSession: z.number().nonnegative(), mode: z.enum(["online", "in_person", "either"]), providerGender: z.enum(["any", "female", "male"]), readiness: z.enum(["tips_first", "talk_to_someone", "see_professional"]), city: z.string(), location: z.object({ lat: z.number().min(-90).max(90), lng: z.number().min(-180).max(180) }).nullable() });
const profile = z.object({ name: z.string(), who5Raw: z.number().min(0).max(25), badDayDescription: z.string(), helpfulActions: strings, trustedPerson: z.object({ name: z.string(), relation: z.string(), phone: z.string().optional() }).nullable(), signals: z.array(signal), prefs, createdAt: z.string() });
const model = z.object({ weights: z.object({ bias: z.number(), valenceDrop: z.number(), energyDrop: z.number(), socialDrop: z.number(), lowSleep: z.number(), signalCount3d: z.number(), gapDays: z.number(), badThemeLoad: z.number() }), nLabels: z.number().nonnegative(), updatedAt: z.string() });
const features = z.object({ valence: z.number().min(-1).max(1), energy: z.number().min(-1).max(1), social: z.number().min(-1).max(1), sleepHours: z.number().min(0).max(24).nullable(), themes: z.array(z.enum(THEMES)), matchedSignalIds: strings, safety: z.enum(["none", "concern", "urgent"]), evidence: z.array(z.object({ feature: z.string(), quote: z.string() })) });
const provider = z.object({ id: z.string(), source: z.enum(["google", "national", "curated"]), name: z.string(), kind, careLevels: z.array(level), address: z.string().optional(), city: z.string().optional(), lat: z.number().optional(), lng: z.number().optional(), distanceKm: z.number().optional(), phone: z.string().optional(), website: z.string().optional(), mapsUrl: z.string().optional(), rating: z.number().optional(), languages: strings.optional(), modes: z.array(z.enum(["phone", "online", "in_person"])).optional(), gender: z.enum(["female", "male"]).optional(), feeMin: z.number().optional(), feeMax: z.number().optional(), credential: z.enum(["verified", "not_verified", "public_service"]), isDemoListing: z.boolean() });
const bridge = z.object({ inMyWords: z.string(), whatsBeenHappening: z.array(z.object({ date: z.string(), text: z.string(), quote: z.string().optional() })), patternsINoticed: strings, whatHelps: strings, whatHasntHelped: strings, whatIWantFromSupport: z.string(), practical: z.object({ languages: strings, budget: z.string(), mode: z.string(), availability: z.string() }), questionsToAsk: strings, callScript: z.string(), generatedAt: z.string() });
const degraded = { degraded: z.boolean().optional() };
const schemas = {
  "/api/build-profile": z.object({ profile, model, ...degraded }),
  "/api/analyze-checkin": z.object({ features, ...degraded }),
  "/api/learn": z.object({ matchedExistingIds: strings, newCandidates: z.array(z.object({ id: z.string(), text: z.string() })).max(2), ...degraded }),
  "/api/places": z.object({ providers: z.array(provider), embedQuery: z.string(), attribution: z.string(), ...degraded }),
  "/api/providers": z.object({ providers: z.array(provider), ...degraded }),
  "/api/session-bridge": z.object({ bridge, ...degraded }),
  "/api/suggest": z.object({ ownActions: strings, cards: z.array(z.object({ card: z.object({ id: z.string(), title: z.string(), body: z.string(), tags: strings, kind: z.enum(["self_help", "info"]) }), framing: z.string() })), ...degraded }),
  "/api/provider-apply": z.object({ ok: z.boolean(), ...degraded }),
};
function fallback(route: Route, body: unknown): unknown {
  const base = { ...structuredClone(MOCK_RESPONSES[routes[route]]), degraded: true, offline: true };
  if (route === "/api/build-profile") {
    const request = body as BuildProfileRequest;
    return { profile: { name: request.name, who5Raw: request.who5.reduce((a, b) => a + b, 0), badDayDescription: request.badDayDescription, helpfulActions: split(request.helpfulActions), trustedPerson: request.trustedPerson, signals: split(request.earlySigns).slice(0, 6).map((text, i) => ({ id: `survey_${i}`, text, source: "survey", count: 0, active: true })), prefs: request.prefs, createdAt: localDate() }, model: defaultModel(), degraded: true, offline: true };
  }
  if (route === "/api/analyze-checkin") {
    const request = body as AnalyzeRequest;
    const text = `${request.goodNote}\n${request.hardNote}`;
    const safeFeatures: CheckinFeatures = { valence: 0, energy: 0, social: 0, sleepHours: request.sleepHoursInput, themes: [], matchedSignalIds: request.signals.filter(s => s.active && s.text.trim() && text.toLowerCase().includes(s.text.toLowerCase())).map(s => s.id), safety: keywordSafety(text), evidence: MOCK_RESPONSES.analyzeCheckin.features.evidence.filter(e => e.quote && (request.goodNote.includes(e.quote) || request.hardNote.includes(e.quote))) };
    return { features: safeFeatures, degraded: true, offline: true };
  }
  if (route === "/api/suggest") return { ...base, ownActions: (body as SuggestRequest).helpfulActions };
  if (route === "/api/learn") return { matchedExistingIds: [], newCandidates: [], degraded: true, offline: true };
  if (route === "/api/session-bridge") {
    const input = body as BridgeRequest;
    return { bridge: { ...structuredClone(MOCK_RESPONSES.sessionBridge.bridge), inMyWords: input.inMyWords, whatIWantFromSupport: input.whatIWantFromSupport, patternsINoticed: input.profile.signals.filter(s => s.active).map(s => s.text), whatHelps: input.profile.helpfulActions, practical: { languages: input.profile.prefs.languages, budget: input.profile.prefs.budgetPerSession === 0 ? "Free options" : `Up to INR ${input.profile.prefs.budgetPerSession}`, mode: input.profile.prefs.mode, availability: input.availability }, generatedAt: new Date().toISOString() }, degraded: true, offline: true };
  }
  return base;
}
export async function post<T>(route: Route, body: unknown): Promise<T> {
  // Provider application submission is intentionally disabled; never transmit it.
  if (route === "/api/provider-apply") return { ok: false, degraded: true } as T;
  if (!load().consentAt) throw new Error("Please confirm your age and consent before continuing.");
  try {
    const response = await fetch(route, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body), cache: "no-store", credentials: "omit", signal: AbortSignal.timeout(12000) });
    if (!response.ok) throw new Error("Request unavailable");
    const parsed = schemas[route].parse(await response.json());
    if (route === "/api/analyze-checkin" && "features" in parsed) {
      const request = body as AnalyzeRequest;
      parsed.features.safety = maxSafety(parsed.features.safety, keywordSafety(`${request.goodNote}\n${request.hardNote}`));
      parsed.features.evidence = parsed.features.evidence.filter(e => e.quote.trim() && (request.goodNote.includes(e.quote) || request.hardNote.includes(e.quote)));
    }
    if (route === "/api/build-profile" && "profile" in parsed) {
      const request = body as BuildProfileRequest;
      if (parsed.profile.name !== request.name || parsed.profile.badDayDescription !== request.badDayDescription) throw new Error("Profile did not match your answers");
    }
    return parsed as T;
  } catch { return fallback(route, body) as T; }
}
export const buildProfile = (body: BuildProfileRequest) => post<{ profile: Profile; model: UserModel } & ClientStatus>("/api/build-profile", body);
export const analyzeCheckin = (body: AnalyzeRequest) => post<{ features: CheckinFeatures } & ClientStatus>("/api/analyze-checkin", body);
export const learn = (body: LearnRequest) => post<{ matchedExistingIds: string[]; newCandidates: { id: string; text: string }[] } & ClientStatus>("/api/learn", body);
export const places = (body: PlacesRequest) => post<PlacesResponse>("/api/places", body);
export const providers = (body: { level?: CareLevel; city?: string }) => post<{ providers: Provider[] } & ClientStatus>("/api/providers", body);
export const sessionBridge = (body: BridgeRequest) => post<{ bridge: SessionBridge } & ClientStatus>("/api/session-bridge", body);
export const suggest = (body: SuggestRequest) => post<SuggestResponse>("/api/suggest", body);
export const providerApply = (body: ProviderApplication) => post<{ ok: boolean } & ClientStatus>("/api/provider-apply", body);
