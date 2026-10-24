import { MOCK_RESPONSES } from "../../../lib/mock";
import { requests } from "../_schemas";
import { stub } from "../_response";
export async function POST(req: Request): Promise<Response> {
  return stub(req, requests.buildProfile, MOCK_RESPONSES.buildProfile);
}