import type { CheckinFeatures, Profile, Provider, ResourceCard, SessionBridge, UserModel } from "./types";

export const MOCK_MODEL: UserModel = { weights: { bias: -2, valenceDrop: 1, energyDrop: .6, socialDrop: .8, lowSleep: .8, signalCount3d: .9, gapDays: .5, badThemeLoad: .4 }, nLabels: 0, updatedAt: "2026-10-24" };
export const MOCK_PROFILE: Profile = {
  name: "Ananya (fictional demo user)", who5Raw: 13,
  badDayDescription: "I stop eating properly, stay up late and go quiet",
  helpfulActions: ["walk on the terrace", "call Amma", "make a simple to-do list"],
  trustedPerson: { name: "Riya", relation: "friend" },
  signals: [
    { id: "skipped_meals", text: "skipping dinner", source: "survey", count: 0, active: true },
    { id: "late_nights", text: "sleeping after 2am", source: "survey", count: 0, active: true },
    { id: "ignoring_riya", text: "not replying to Riya", source: "survey", count: 0, active: true },
  ],
  prefs: { languages: ["English", "Tamil"], budgetPerSession: 1500, mode: "either", providerGender: "any", readiness: "talk_to_someone", city: "Chennai", location: null },
  createdAt: "2026-09-24",
};
export const MOCK_FEATURES: CheckinFeatures = { valence: 0, energy: -.2, social: -.5, sleepHours: null, themes: ["food", "sleep"], matchedSignalIds: ["skipped_meals", "ignoring_riya"], safety: "none", evidence: [{ feature: "signal", quote: "Skipped dinner again" }, { feature: "social", quote: "didn't reply to Riya" }] };
export const MOCK_PROVIDERS: Provider[] = [
  { id: "tele_manas", source: "national", name: "Tele-MANAS", kind: "helpline", careLevels: [2, 3], city: "national", phone: "14416", languages: ["English", "Hindi", "Tamil", "Telugu", "Kannada", "Malayalam", "Marathi", "Bengali"], modes: ["phone"], feeMin: 0, feeMax: 0, credential: "public_service", isDemoListing: false },
  { id: "government_opd", source: "national", name: "Government hospital psychiatry OPD (district/medical college)", kind: "hospital", careLevels: [4], city: "national", feeMin: 0, feeMax: 100, mapsUrl: "https://www.google.com/maps/search/government+hospital+psychiatry+OPD+near+me", credential: "public_service", isDemoListing: false },
  { id: "demo_kaveri", source: "curated", name: "Demo: Kaveri Counselling Studio", kind: "counsellor", careLevels: [3], city: "Chennai", languages: ["Tamil", "English"], modes: ["online", "in_person"], gender: "female", feeMin: 800, feeMax: 1200, credential: "verified", isDemoListing: true },
  { id: "demo_marina", source: "curated", name: "Demo: Marina Psychology", kind: "psychologist", careLevels: [3], city: "Chennai", languages: ["Tamil", "English"], modes: ["in_person"], feeMin: 1500, feeMax: 2000, credential: "verified", isDemoListing: true },
  { id: "demo_clinic", source: "curated", name: "Demo: Banyan Consultation Clinic", kind: "psychiatrist", careLevels: [4], city: "Chennai", feeMin: 1000, feeMax: 1500, credential: "verified", isDemoListing: true },
  { id: "demo_unverified", source: "curated", name: "Demo: Local Support Centre", kind: "counsellor", careLevels: [3], city: "Chennai", credential: "not_verified", isDemoListing: true },
];
export const MOCK_RESOURCES: ResourceCard[] = [
  { id: "walk_10min", title: "A little time outside", body: "If it feels manageable, try a short walk. You can choose a familiar route and turn back whenever you like.", tags: ["energyDrop", "rest"], kind: "self_help" },
  { id: "simple_meal", title: "Something simple to eat", body: "A familiar, easy meal can be a small next step. It does not have to be elaborate.", tags: ["food", "badThemeLoad"], kind: "self_help" },
  { id: "reach_out", title: "A small hello", body: "You could send someone you trust a short hello. You can share as much or as little as feels comfortable.", tags: ["socialDrop", "loneliness", "friends"], kind: "self_help" },
];
export const MOCK_BRIDGE: SessionBridge = {
  inMyWords: "", whatsBeenHappening: [], patternsINoticed: [], whatHelps: [], whatHasntHelped: [], whatIWantFromSupport: "",
  practical: { languages: [], budget: "Confirm by phone", mode: "Confirm by phone", availability: "Confirm by phone" },
  questionsToAsk: ["How do you keep what I share confidential?", "What approach do you usually use?", "What is the fee, and is there a sliding scale?", "Can we do sessions online?", "What if I feel we're not a good fit?"],
  callScript: "Hello, I would like to ask about a first appointment. Could you tell me about your fees and availability?", generatedAt: "2026-10-24",
};
export const MOCK_RESPONSES = {
  buildProfile: { profile: MOCK_PROFILE, model: MOCK_MODEL }, analyzeCheckin: { features: MOCK_FEATURES },
  learn: { matchedExistingIds: [] as string[], newCandidates: [] as { id: string; text: string }[] },
  providers: { providers: MOCK_PROVIDERS }, places: { providers: MOCK_PROVIDERS, embedQuery: "psychologist near Chennai", attribution: "" },
  sessionBridge: { bridge: MOCK_BRIDGE }, suggest: { ownActions: [] as string[], cards: MOCK_RESOURCES.map(card => ({ card, framing: "" })) }, providerApply: { ok: false },
};
