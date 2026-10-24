import { z } from "zod";
import { THEMES } from "../../lib/types";

const text = z.string().max(20000);
export const signalSchema = z.object({ id: z.string().min(1).max(100), text: text, source: z.enum(["survey", "learned"]), count: z.number().int().nonnegative(), active: z.boolean() });
export const locationSchema = z.object({ lat: z.number().min(-90).max(90), lng: z.number().min(-180).max(180) });
export const prefsSchema = z.object({ languages: z.array(z.string().max(100)).max(30), budgetPerSession: z.number().nonnegative(), mode: z.enum(["online", "in_person", "either"]), providerGender: z.enum(["any", "female", "male"]), readiness: z.enum(["tips_first", "talk_to_someone", "see_professional"]), city: z.string().max(200), location: locationSchema.nullable() });
const trustedSchema = z.object({ name: text, relation: text, phone: z.string().max(50).optional() }).nullable();
export const profileSchema = z.object({ name: text, who5Raw: z.number().min(0).max(25), badDayDescription: text, helpfulActions: z.array(text).max(100), trustedPerson: trustedSchema, signals: z.array(signalSchema).max(100), prefs: prefsSchema, createdAt: z.string() });
export const featuresSchema = z.object({ valence: z.number(), energy: z.number(), social: z.number(), sleepHours: z.number().min(0).max(24).nullable(), themes: z.array(z.enum(THEMES)).max(13), matchedSignalIds: z.array(z.string()).max(100), safety: z.enum(["none", "concern", "urgent"]), evidence: z.array(z.object({ feature: z.string(), quote: text })).max(4) });
export const checkinSchema = z.object({ id: z.string(), date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), goodNote: text, hardNote: text, inputMode: z.enum(["text", "voice"]), userLabel: z.enum(["good", "okay", "bad"]).nullable(), sleepHoursInput: z.number().min(0).max(24).nullable(), features: featuresSchema.nullable(), modelP: z.number().min(0).max(1).nullable(), driftFeedback: z.enum(["struggling", "fine"]).nullable() });
export const explanationSchema = z.object({ feature: z.enum(["valenceDrop", "energyDrop", "socialDrop", "lowSleep", "signalCount3d", "gapDays", "badThemeLoad"]), contribution: z.number(), message: text, quotes: z.array(text) });
const level = z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]);
export const requests = {
  analyzeCheckin: z.object({ goodNote: text, hardNote: text, sleepHoursInput: z.number().min(0).max(24).nullable(), signals: z.array(signalSchema).max(100) }),
  buildProfile: z.object({ name: text, who5: z.array(z.number().int().min(0).max(5)).length(5), badDayDescription: text, earlySigns: text, helpfulActions: text, trustedPerson: trustedSchema, prefs: prefsSchema }),
  learn: z.object({ text, signals: z.array(signalSchema).max(100) }),
  places: z.object({ level, location: locationSchema.nullable(), city: z.string().max(200), radiusKm: z.number().positive().max(50) }),
  providers: z.object({ level: level.optional(), city: z.string().max(200).optional() }),
  sessionBridge: z.object({ profile: profileSchema, checkins: z.array(checkinSchema).max(30), inMyWords: text, whatIWantFromSupport: text, availability: text, language: z.string().max(100) }),
  suggest: z.object({ explanations: z.array(explanationSchema).max(7), themes: z.array(z.enum(THEMES)).max(13), helpfulActions: z.array(text).max(100) }),
  providerApply: z.object({ name: z.string().min(1).max(200), kind: z.enum(["helpline", "counsellor", "psychologist", "psychiatrist", "hospital", "emergency"]), city: z.string().max(200).optional(), languages: z.array(z.string()).optional(), modes: z.array(z.enum(["phone", "online", "in_person"])).optional(), fee_min: z.number().int().nonnegative().optional(), fee_max: z.number().int().nonnegative().optional(), registration_body: z.enum(["RCI", "NMC", "Other"]).optional(), registration_number: z.string().max(200).optional(), email: z.string().email().optional(), phone: z.string().max(50).optional() }),
};
