import { MOCK_RESPONSES } from "../../../lib/mock";
import { requests } from "../_schemas";
import { json } from "../_response";
import { defaultModel } from "../../../lib/engine";
import type { Profile } from "../../../lib/types";
export async function POST(req: Request): Promise<Response> {
  try {
    const input = requests.buildProfile.parse(await req.json());
    const source = input.earlySigns.trim() || input.badDayDescription;
    const phrases = [...new Set(source.split(/[,;\n.!]+|\s+and\s+/i).map(s => s.trim()).filter(Boolean))].slice(0, 6);
    const signals = phrases.map((text, index) => ({ id: text.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "") || `sign_${index + 1}`, text, source: "survey" as const, count: 0, active: true }));
    const now = new Date().toISOString();
    const profile: Profile = { name: input.name, who5Raw: input.who5.reduce((a, b) => a + b, 0), badDayDescription: input.badDayDescription, helpfulActions: input.helpfulActions.split(/[,;\n]+/).map(s => s.trim()).filter(Boolean), trustedPerson: input.trustedPerson, prefs: input.prefs, signals, createdAt: now };
    const model = defaultModel(), survey = `${input.badDayDescription} ${input.earlySigns}`.toLowerCase();
    model.updatedAt = now;
    if (/sleep|night|late/.test(survey)) model.weights.lowSleep *= 1.3;
    if (/friend|reply|message|call|people/.test(survey)) model.weights.socialDrop *= 1.3;
    if (/eat|food|meal|dinner/.test(survey)) model.weights.badThemeLoad *= 1.3;
    if (/tired|energy|bed/.test(survey)) model.weights.energyDrop *= 1.3;
    return json({ profile, model, degraded: true });
  } catch { return json({ ...MOCK_RESPONSES.buildProfile, degraded: true }); }
}
