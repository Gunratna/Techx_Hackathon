import { MOCK_RESPONSES } from "../../../lib/mock";
import { requests } from "../_schemas";
import { json } from "../_response";
import { getProvidersWithStatus } from "../../../lib/directory";
export async function POST(req: Request): Promise<Response> {
  try { const input = requests.providers.parse(await req.json()); return json(await getProvidersWithStatus(input.level, input.city)); }
  catch { return json({ ...MOCK_RESPONSES.providers, degraded: true }); }
}
