import { z } from "zod";
import directory from "../data/providers.json";
import type { CareLevel, Provider } from "./types";
const levelSchema = z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]);
export const providerSchema = z.object({
  id: z.string(), source: z.enum(["national", "curated", "google"]), name: z.string(), kind: z.enum(["helpline", "counsellor", "psychologist", "psychiatrist", "hospital", "emergency"]), careLevels: z.array(levelSchema),
  address: z.string().optional(), city: z.string().optional(), lat: z.number().min(-90).max(90).optional(), lng: z.number().min(-180).max(180).optional(), distanceKm: z.number().nonnegative().optional(),
  phone: z.string().optional(), website: z.string().url().optional(), mapsUrl: z.string().url().optional(), rating: z.number().min(0).max(5).optional(),
  languages: z.array(z.string()).optional(), modes: z.array(z.enum(["phone", "online", "in_person"])).optional(), gender: z.enum(["female", "male"]).optional(), feeMin: z.number().nonnegative().optional(), feeMax: z.number().nonnegative().optional(),
  credential: z.enum(["verified", "not_verified", "public_service"]), isDemoListing: z.boolean(),
});
export function directoryProviders(level?: CareLevel, city?: string): Provider[] {
  return (directory as Provider[]).filter(p => (level === undefined || p.careLevels.includes(level)) && (!city || p.city === "national" || p.city?.toLowerCase() === city.trim().toLowerCase())).map(p => ({ ...p }));
}
// Bundled directory only; no database client, remote lookup, or persistence.
export async function getProvidersWithStatus(level?: CareLevel, city?: string): Promise<{ providers: Provider[]; degraded?: boolean }> {
  return { providers: directoryProviders(level, city) };
}
export async function getProviders(level?: CareLevel, city?: string): Promise<Provider[]> { return (await getProvidersWithStatus(level, city)).providers; }
