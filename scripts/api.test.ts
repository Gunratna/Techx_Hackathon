import assert from "node:assert/strict";
import { POST as analyze } from "../app/api/analyze-checkin/route";
import { POST as profile } from "../app/api/build-profile/route";
import { POST as learn } from "../app/api/learn/route";
import { POST as providers } from "../app/api/providers/route";
import { POST as places } from "../app/api/places/route";
import { POST as bridge } from "../app/api/session-bridge/route";
import { POST as suggest } from "../app/api/suggest/route";
import { POST as apply } from "../app/api/provider-apply/route";
import { MOCK_PROFILE } from "../lib/mock";
import { containsBannedLanguage } from "../lib/safety";
import { featuresSchema, profileSchema } from "../app/api/_schemas";
import { providerSchema } from "../lib/directory";
type Route = (req: Request) => Promise<Response>;
async function call(route: Route, body: unknown) {
  const response = await route(new Request("http://localhost/api/test", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }));
  assert.equal(response.status, 200); assert.ok(response.headers.get("Cache-Control")?.includes("no-store"));
  return response.json();
}
async function main() {
  delete process.env.ANTHROPIC_API_KEY; delete process.env.GOOGLE_MAPS_API_KEY;
  const originalFetch = globalThis.fetch;
  let networkCalls = 0;
  globalThis.fetch = async () => { networkCalls++; throw new Error("No network expected"); };
  for (const route of [analyze, profile, learn, providers, places, bridge, suggest, apply]) {
    const response = await route(new Request("http://localhost/api/test", { method: "POST", body: "{invalid" }));
    assert.equal(response.status, 200); assert.equal((await response.json()).degraded, true);
  }
  const notes = { goodNote: "Work was fine.", hardNote: "Skipped dinner again, stayed up till 3, didn't reply to Riya.", sleepHoursInput: 4, signals: MOCK_PROFILE.signals };
  const extracted = await call(analyze, notes); featuresSchema.parse(extracted.features);
  assert.equal(extracted.features.sleepHours, 4); assert.equal(extracted.features.matchedSignalIds.length, 3);
  for (const e of extracted.features.evidence) assert.ok(notes.goodNote.includes(e.quote) || notes.hardNote.includes(e.quote));
  assert.equal((await call(analyze, { ...notes, hardNote: "i want to end my life" })).features.safety, "urgent");
  assert.equal((await call(analyze, { goodNote: "want to die", signals: "invalid" })).features.safety, "urgent");
  const built = await call(profile, { name: "Local Test", who5: [1, 2, 3, 4, 5], badDayDescription: "I stay up late", earlySigns: "skipping dinner, not replying to Riya, sleeping after 2am", helpfulActions: "walk on the terrace, call Amma", trustedPerson: null, prefs: MOCK_PROFILE.prefs });
  profileSchema.parse(built.profile); assert.equal(built.profile.name, "Local Test"); assert.equal(built.profile.who5Raw, 15); assert.equal(built.profile.signals.length, 3);
  const learned = await call(learn, { text: notes.hardNote, signals: [] }); assert.ok(learned.newCandidates.length <= 2);
  for (const candidate of learned.newCandidates) assert.ok(notes.hardNote.includes(candidate.text));
  const directory = await call(providers, { level: 3, city: "chennai" });
  assert.ok(directory.providers.some((p: {id:string}) => p.id === "tele_manas"));
  for (const p of directory.providers) { providerSchema.parse(p); assert.ok(p.city === "national" || p.city === "Chennai"); }
  const placeInput = { level: 3, location: { lat: 13.0067, lng: 80.2574 }, city: "Chennai", radiusKm: 5 };
  const fallback = await call(places, placeInput); assert.equal(fallback.degraded, true); assert.equal(fallback.attribution, "");
  assert.ok(fallback.providers.every((p: {source:string}) => p.source !== "google"));
  const checkin = { id: "test", date: "2026-10-24", ...notes, inputMode: "text", userLabel: "bad", features: extracted.features, modelP: .8, driftFeedback: null };
  const session = await call(bridge, { profile: MOCK_PROFILE, checkins: [checkin], inMyWords: "I would like to talk", whatIWantFromSupport: "A first conversation", availability: "Weekends", language: "Tamil" });
  assert.equal(containsBannedLanguage(session.bridge), false); assert.ok(session.bridge.callScript.startsWith("Vanakkam"));
  for (const item of session.bridge.whatsBeenHappening) if (item.quote) assert.ok(notes.goodNote.includes(item.quote) || notes.hardNote.includes(item.quote));
  const suggestions = await call(suggest, { explanations: [], themes: ["food"], helpfulActions: ["My own small step"] });
  assert.deepEqual(suggestions.ownActions, ["My own small step"]); assert.ok(suggestions.cards.length <= 3); assert.equal(suggestions.cards[0].card.id, "simple_meal");
  assert.deepEqual(await call(apply, { name: "Fictional Test", kind: "counsellor" }), { ok: false, degraded: true });
  assert.equal(networkCalls, 0, "No-key mode must make no external requests");
  // Google fixtures exercise normalization, dedupe, distance, missing optional fields and failure handling without a real key.
  process.env.GOOGLE_MAPS_API_KEY = "test-placeholder";
  let calls = 0;
  globalThis.fetch = async (url, init) => {
    calls++; assert.equal(url, "https://places.googleapis.com/v1/places:searchText"); assert.equal(init?.cache, "no-store");
    return Response.json({ places: [{ id: "near", displayName: { text: "Fixture Clinic" }, formattedAddress: "Fixture Street", location: { latitude: 13.0067, longitude: 80.2574 } }, { id: "far", displayName: { text: "Far Fixture" }, location: { latitude: 28.6, longitude: 77.2 } }] });
  };
  const live = await call(places, placeInput); assert.equal(calls, 2); assert.equal(live.attribution, "Results from Google Maps");
  assert.equal(live.providers.filter((p: {source:string}) => p.source === "google").length, 1);
  const google = live.providers.find((p: {source:string}) => p.source === "google"); assert.equal(google.credential, "not_verified"); assert.equal(google.distanceKm, 0); assert.equal(google.languages, undefined);
  globalThis.fetch = async () => { throw new Error("Fixture outage"); };
  assert.equal((await call(places, placeInput)).degraded, true);
  delete process.env.GOOGLE_MAPS_API_KEY; globalThis.fetch = originalFetch;
  console.log("All eight route contracts, malformed input, keyless crisis, exact quotes, no-network mode, and Places fixtures passed.");
}
main().catch(error => { console.error("Synthetic API contract test failed:", error); process.exitCode = 1; });
