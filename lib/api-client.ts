import { z } from "zod";
import { defaultModel } from "@/lib/engine";
import { MOCK_RESPONSES } from "@/lib/mock";
import { keywordSafety } from "@/lib/safety";
import { load, localDate } from "@/lib/store";
import type { CareLevel, Checkin, CheckinFeatures, Degradable, Explanation, PersonalSignal, Preferences, Profile, Provider, ResourceCard, SessionBridge, Theme, UserModel } from "@/lib/types";

export type BuildProfileRequest = { name: string; who5: number[]; badDayDescription: string; earlySigns: string; helpfulActions: string; trustedPerson: Profile["trustedPerson"]; prefs: Preferences };
export type AnalyzeRequest = { goodNote: string; hardNote: string; sleepHoursInput: number | null; signals: PersonalSignal[] };
export type LearnRequest = { text: string; signals: PersonalSignal[] };
export type PlacesRequest = { level: CareLevel; location: Preferences["location"]; city: string; radiusKm: number };
export type BridgeRequest = { profile: Profile; checkins: Checkin[]; inMyWords: string; whatIWantFromSupport: string; availability: string; language: string };
export type SuggestRequest = { explanations: Explanation[]; themes: Theme[]; helpfulActions: string[] };
export type PlacesResponse = { providers: Provider[]; embedQuery: string; attribution: string } & Degradable;
export type SuggestResponse = { ownActions: string[]; cards: { card: ResourceCard; framing: string }[] } & Degradable;
export type ProviderApplication = { name: string; kind: Provider["kind"]; city?: string; languages?: string[]; modes?: ("phone" | "online" | "in_person")[]; fee_min?: number; fee_max?: number; registration_body?: "RCI" | "NMC" | "Other"; registration_number?: string; email?: string; phone?: string };
const routes = { "/api/build-profile": "buildProfile", "/api/analyze-checkin": "analyzeCheckin", "/api/learn": "learn", "/api/places": "places", "/api/providers": "providers", "/api/session-bridge": "sessionBridge", "/api/suggest": "suggest", "/api/provider-apply": "providerApply" } as const;
type Route = keyof typeof routes;
const split = (value: string) => [...new Set(value.split(/[\n;,]+/).map(s => s.trim()).filter(Boolean))];

// Current MVP uses local templates. No personal text is sent to an AI provider,
// Supabase, or an API. Future HTTP calls must stay behind this boundary.
export async function post<T>(route: Route, body: unknown): Promise<T> {
  if (!load().consentAt) throw new Error("Please confirm your age and consent before continuing.");
  let result: unknown = { ...structuredClone(MOCK_RESPONSES[routes[route]]), degraded: true };
  if (route === "/api/build-profile") {
    const request = body as BuildProfileRequest;
    const who5 = z.array(z.number().int().min(0).max(5)).length(5).parse(request.who5);
    const profile: Profile = { name: request.name.trim(), who5Raw: who5.reduce((sum, n) => sum + n, 0), badDayDescription: request.badDayDescription.trim(), helpfulActions: split(request.helpfulActions), trustedPerson: request.trustedPerson, signals: split(request.earlySigns).map((text, i) => ({ id: `survey_${i + 1}`, text, source: "survey", count: 0, active: true })), prefs: request.prefs, createdAt: localDate() };
    result = { profile, model: defaultModel(), degraded: true };
  } else if (route === "/api/analyze-checkin") {
    const request = body as AnalyzeRequest;
    const text = `${request.goodNote}\n${request.hardNote}`;
    const matched = request.signals.filter(s => s.active && s.text.trim() && text.toLocaleLowerCase().includes(s.text.toLocaleLowerCase()));
    const features: CheckinFeatures = { valence: 0, energy: 0, social: 0, sleepHours: request.sleepHoursInput, themes: [], matchedSignalIds: matched.map(s => s.id), safety: keywordSafety(text), evidence: matched.slice(0, 3).map(s => { const start = text.toLocaleLowerCase().indexOf(s.text.toLocaleLowerCase()); return { feature: "signal", quote: text.slice(start, start + s.text.length) }; }) };
    result = { features, degraded: true };
  } else if (route === "/api/learn") {
    const request = body as LearnRequest;
    result = { matchedExistingIds: request.signals.filter(s => s.text.trim() && request.text.toLocaleLowerCase().includes(s.text.toLocaleLowerCase())).map(s => s.id), newCandidates: [], degraded: true };
  } else if (route === "/api/suggest") {
    const request = body as SuggestRequest;
    result = { ...MOCK_RESPONSES.suggest, ownActions: request.helpfulActions, degraded: true };
  } else if (route === "/api/places") {
    const request = body as PlacesRequest;
    result = { ...MOCK_RESPONSES.places, embedQuery: `${request.level === 4 ? "hospital psychiatry" : "counsellor psychologist"} near ${request.city || "me"}`, attribution: "", degraded: true };
  } else if (route === "/api/session-bridge") {
    const request = body as BridgeRequest;
    const bridge: SessionBridge = { ...structuredClone(MOCK_RESPONSES.sessionBridge.bridge), inMyWords: request.inMyWords, whatsBeenHappening: request.checkins.slice(-30).map(c => ({ date: c.date, text: [c.goodNote, c.hardNote].filter(Boolean).join(" · "), quote: c.features?.evidence.find(e => `${c.goodNote}\n${c.hardNote}`.includes(e.quote))?.quote })), patternsINoticed: request.profile.signals.filter(s => s.active).map(s => s.text), whatHelps: request.profile.helpfulActions, whatIWantFromSupport: request.whatIWantFromSupport, practical: { languages: request.profile.prefs.languages, budget: request.profile.prefs.budgetPerSession === 0 ? "Free options only" : `Up to ₹${request.profile.prefs.budgetPerSession} per session`, mode: request.profile.prefs.mode.replace("_", " "), availability: request.availability }, generatedAt: localDate() };
    result = { bridge, degraded: true };
  }
  return result as T;
}
export const buildProfile = (body: BuildProfileRequest) => post<{ profile: Profile; model: UserModel } & Degradable>("/api/build-profile", body);
export const analyzeCheckin = (body: AnalyzeRequest) => post<{ features: CheckinFeatures } & Degradable>("/api/analyze-checkin", body);
export const learn = (body: LearnRequest) => post<{ matchedExistingIds: string[]; newCandidates: { id: string; text: string }[] } & Degradable>("/api/learn", body);
export const places = (body: PlacesRequest) => post<PlacesResponse>("/api/places", body);
export const providers = (body: { level?: CareLevel; city?: string }) => post<{ providers: Provider[] } & Degradable>("/api/providers", body);
export const sessionBridge = (body: BridgeRequest) => post<{ bridge: SessionBridge } & Degradable>("/api/session-bridge", body);
export const suggest = (body: SuggestRequest) => post<SuggestResponse>("/api/suggest", body);
export const providerApply = (body: ProviderApplication) => post<{ ok: boolean } & Degradable>("/api/provider-apply", body);
