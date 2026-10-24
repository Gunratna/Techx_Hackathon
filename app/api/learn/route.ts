import { MOCK_RESPONSES } from "../../../lib/mock";
import { requests } from "../_schemas";
import { json } from "../_response";
import { matchingSignals, BEHAVIOURS } from "../analyze-checkin/_local";
import { containsBannedLanguage } from "../../../lib/safety";
export async function POST(req: Request): Promise<Response> {
  try {
    const input = requests.learn.parse(await req.json());
    const matched = matchingSignals([input.text], input.signals);
    const newCandidates = BEHAVIOURS.flatMap(rule => {
      const text = input.text.match(rule.pattern)?.[0];
      if (!text || containsBannedLanguage(text) || input.signals.some(s => rule.category.test(s.text))) return [];
      return [{ id: rule.id, text }];
    }).filter(s => s.text.trim().split(/\s+/).length >= 2 && s.text.trim().split(/\s+/).length <= 5).slice(0, 2);
    return json({ matchedExistingIds: matched.ids, newCandidates, degraded: true });
  } catch { return json({ ...MOCK_RESPONSES.learn, degraded: true }); }
}
