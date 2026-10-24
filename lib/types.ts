export type DayLabel = "good" | "okay" | "bad";
export type Safety = "none" | "concern" | "urgent";
export type DriftState = "learning" | "steady" | "drift" | "crisis"; // UI: Learning / As usual / Different from usual / Need help now

export const THEMES = ["work","study","family","friends","relationship","sleep","food",
  "health","money","self_worth","loneliness","achievement","rest"] as const;
export type Theme = typeof THEMES[number];

export interface Evidence { feature: string; quote: string }   // quote MUST be an exact substring of the note

export interface CheckinFeatures {
  valence: number; energy: number; social: number;             // each -1..1; social 0 if people not mentioned
  sleepHours: number | null;
  themes: Theme[];
  matchedSignalIds: string[];
  safety: Safety;
  evidence: Evidence[];
}

export interface Checkin {
  id: string; date: string;                                     // YYYY-MM-DD; one per day, latest wins
  goodNote: string; hardNote: string;                           // either may be ""
  inputMode: "text" | "voice";
  userLabel: DayLabel | null;
  sleepHoursInput: number | null;
  features: CheckinFeatures | null;
  modelP: number | null;
  driftFeedback: "struggling" | "fine" | null;
}

export interface PersonalSignal { id: string; text: string; source: "survey" | "learned"; count: number; active: boolean }

export interface Preferences {
  languages: string[];
  budgetPerSession: number;                                     // INR max; 0 = free only
  mode: "online" | "in_person" | "either";
  providerGender: "any" | "female" | "male";
  readiness: "tips_first" | "talk_to_someone" | "see_professional";
  city: string;
  location: { lat: number; lng: number } | null;
}

export interface Profile {
  name: string; who5Raw: number;                                // WHO-5 sum 0..25 (never shown as a score)
  badDayDescription: string; helpfulActions: string[];
  trustedPerson: { name: string; relation: string; phone?: string } | null;
  signals: PersonalSignal[];
  prefs: Preferences;
  createdAt: string;
}

export type FeatureKey = "valenceDrop" | "energyDrop" | "socialDrop" | "lowSleep"
  | "signalCount3d" | "gapDays" | "badThemeLoad";
export interface UserModel { weights: Record<FeatureKey | "bias", number>; nLabels: number; updatedAt: string }
export interface Explanation { feature: FeatureKey; contribution: number; message: string; quotes: string[] }
export interface EngineResult { p: number; state: DriftState; driftDaysLast7: number; explanations: Explanation[] }

export type CareLevel = 0 | 1 | 2 | 3 | 4 | 5;
// 0 self-care · 1 trusted person · 2 free helpline · 3 counsellor/psychologist · 4 psychiatrist/hospital OPD · 5 emergency
export const CARE_LEVEL_LABELS: Record<CareLevel, string> = {
  0: "Small steps for today", 1: "Reach out to someone you trust", 2: "Talk to a free helpline",
  3: "Talk to a counsellor or psychologist", 4: "See a psychiatrist or hospital clinic", 5: "Get help right now" };
export interface CarePath { recommended: CareLevel; alsoOffer: CareLevel[]; reasons: string[] }

export type ProviderKind = "helpline" | "counsellor" | "psychologist" | "psychiatrist" | "hospital" | "emergency";
export interface Provider {
  id: string; source: "google" | "national" | "curated";
  name: string; kind: ProviderKind; careLevels: CareLevel[];
  address?: string; city?: string; lat?: number; lng?: number; distanceKm?: number;
  phone?: string; website?: string; mapsUrl?: string; rating?: number;
  languages?: string[]; modes?: ("phone" | "online" | "in_person")[]; gender?: "female" | "male";
  feeMin?: number; feeMax?: number;
  credential: "verified" | "not_verified" | "public_service";
  isDemoListing: boolean;
}
export interface ProviderMatch { provider: Provider; score: number; reasons: string[]; unknowns: string[] }

export interface SessionBridge {
  inMyWords: string;
  whatsBeenHappening: { date: string; text: string; quote?: string }[];
  patternsINoticed: string[];
  whatHelps: string[]; whatHasntHelped: string[];
  whatIWantFromSupport: string;
  practical: { languages: string[]; budget: string; mode: string; availability: string };
  questionsToAsk: string[];
  callScript: string;
  generatedAt: string;
}

export interface ResourceCard { id: string; title: string; body: string; tags: string[]; kind: "self_help" | "info" }

export interface AppState { profile: Profile | null; model: UserModel | null; checkins: Checkin[]; consentAt: string | null }

export interface Degradable { degraded?: boolean }
