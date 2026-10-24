import type { z } from "zod";
export function json(body: unknown): Response {
  return Response.json(body, { status: 200, headers: { "Cache-Control": "no-store, max-age=0" } });
}
export async function stub<T>(req: Request, schema: z.ZodType<T>, mock: unknown): Promise<Response> {
  try { schema.parse(await req.json()); } catch { /* All failures use the same safe fallback. */ }
  return json({ ...(mock as object), degraded: true });
}
