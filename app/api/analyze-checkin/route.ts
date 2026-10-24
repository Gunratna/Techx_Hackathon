import { keywordSafety } from "../../../lib/safety";
import type { CheckinFeatures } from "../../../lib/types";
import { requests } from "../_schemas";
import { json } from "../_response";

export async function POST(req: Request): Promise<Response> {
  let raw: unknown;
  try { raw = await req.json(); } catch { raw = null; }
  const rawObject = raw && typeof raw === "object" ? raw as Record<string, unknown> : {};
  const good = typeof rawObject.goodNote === "string" ? rawObject.goodNote : "";
  const hard = typeof rawObject.hardNote === "string" ? rawObject.hardNote : "";
  const parsed = requests.analyzeCheckin.safeParse(raw);
  const features: CheckinFeatures = {
    valence: 0, energy: 0, social: 0, sleepHours: parsed.success ? parsed.data.sleepHoursInput : null,
    themes: [], matchedSignalIds: parsed.success ? parsed.data.signals.filter(s => s.text.trim() && `${good}\n${hard}`.toLowerCase().includes(s.text.toLowerCase())).map(s => s.id) : [],
    safety: keywordSafety(`${good}\n${hard}`), evidence: [],
  };
  return json({ features, degraded: true });
}
