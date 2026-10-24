import { MOCK_RESPONSES } from "../../../lib/mock";
import { requests } from "../_schemas";
import { json } from "../_response";
import resources from "../../../data/resources.json";
export async function POST(req: Request): Promise<Response> {
  try {
    const input = requests.suggest.parse(await req.json());
    const tags = new Set<string>([...input.themes, ...input.explanations.map(e => e.feature)]);
    const cards = resources.map(card => ({ card, matches: card.tags.filter(t => tags.has(t)).length })).filter(c => c.matches > 0).sort((a, b) => b.matches - a.matches).slice(0, 3).map(({ card }) => ({ card, framing: "" }));
    return json({ ownActions: input.helpfulActions, cards, degraded: true });
  } catch { return json({ ...MOCK_RESPONSES.suggest, degraded: true }); }
}
