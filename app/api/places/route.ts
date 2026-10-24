import { MOCK_RESPONSES } from "../../../lib/mock";
import { requests } from "../_schemas";
import { json } from "../_response";
import { getProvidersWithStatus } from "../../../lib/directory";
import type { Provider, ProviderKind } from "../../../lib/types";
import { z } from "zod";
const placeSchema = z.object({ id: z.string(), displayName: z.object({ text: z.string() }), formattedAddress: z.string().optional(), location: z.object({ latitude: z.number().min(-90).max(90), longitude: z.number().min(-180).max(180) }).optional(), nationalPhoneNumber: z.string().optional(), websiteUri: z.string().url().optional(), googleMapsUri: z.string().url().optional(), rating: z.number().min(0).max(5).optional() });
const queries: Record<number, { text: string; kind: ProviderKind }[]> = { 0: [], 1: [], 2: [], 3: [{ text: "psychologist", kind: "psychologist" }, { text: "counselling centre", kind: "counsellor" }], 4: [{ text: "psychiatrist", kind: "psychiatrist" }, { text: "mental health hospital", kind: "hospital" }], 5: [{ text: "hospital emergency", kind: "emergency" }] };
function distance(a: {lat:number;lng:number}, b: {lat:number;lng:number}): number {
  const radians = (n: number) => n * Math.PI / 180;
  const h = Math.sin(radians(b.lat - a.lat) / 2) ** 2 + Math.cos(radians(a.lat)) * Math.cos(radians(b.lat)) * Math.sin(radians(b.lng - a.lng) / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(Math.min(1, h)));
}
export async function POST(req: Request): Promise<Response> {
  try {
    const input = requests.places.parse(await req.json());
    const directory = await getProvidersWithStatus(input.level, input.city), selected = queries[input.level];
    let degraded = directory.degraded ?? false;
    const key = process.env.GOOGLE_MAPS_API_KEY;
    const google: Provider[] = [];
    if (selected.length && key) {
      const responses = await Promise.allSettled(selected.map(async query => {
        const response = await fetch("https://places.googleapis.com/v1/places:searchText", {
          method: "POST", cache: "no-store", signal: AbortSignal.timeout(7000),
          headers: { "Content-Type": "application/json", "X-Goog-Api-Key": key, "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.location,places.types,places.googleMapsUri,places.nationalPhoneNumber,places.websiteUri,places.rating" },
          body: JSON.stringify({ textQuery: `${query.text} in ${input.city}`, maxResultCount: 10, languageCode: "en", ...(input.location ? { locationBias: { circle: { center: { latitude: input.location.lat, longitude: input.location.lng }, radius: Math.min(50000, input.radiusKm * 1000) } } } : {}) }),
        });
        if (!response.ok) throw new Error("Places unavailable");
        const data = z.object({ places: z.array(placeSchema).optional() }).parse(await response.json());
        return (data.places ?? []).map((p): Provider => ({ id: `g_${p.id}`, source: "google", name: p.displayName.text, kind: query.kind, careLevels: [input.level], address: p.formattedAddress, lat: p.location?.latitude, lng: p.location?.longitude, phone: p.nationalPhoneNumber, website: p.websiteUri, mapsUrl: p.googleMapsUri, rating: p.rating, credential: "not_verified", isDemoListing: false }));
      }));
      if (responses.some(response => response.status === "rejected")) degraded = true;
      else for (const response of responses) if (response.status === "fulfilled") google.push(...response.value);
    } else if (selected.length) degraded = true;
    const merged = [...directory.providers, ...google].map(p => ({ ...p, ...(input.location && p.lat !== undefined && p.lng !== undefined ? { distanceKm: distance(input.location, { lat: p.lat, lng: p.lng }) } : {}) })).filter(p => p.source !== "google" || p.distanceKm === undefined || p.distanceKm <= input.radiusKm * 1.5);
    const unique = new Map<string, Provider>();
    for (const p of merged) { const id = `${p.name.toLowerCase().trim()}|${(p.address ?? "").toLowerCase().slice(0, 20)}`; if (!unique.has(id)) unique.set(id, p); }
    return json({ providers: [...unique.values()], embedQuery: selected.length ? `${selected[0].text} near ${input.city}` : "", attribution: merged.some(p => p.source === "google") ? "Results from Google Maps" : "", ...(degraded ? { degraded: true } : {}) });
  } catch { return json({ ...MOCK_RESPONSES.places, degraded: true }); }
}
