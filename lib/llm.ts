import type { z } from "zod";
/** Reserved interface only. AI processing is disabled by the product owner's decision. */
export async function callJSON<T>(system: string, user: string, schema: z.ZodType<T>, maxTokens = 1200): Promise<T> {
  void system; void user; void schema; void maxTokens;
  throw new Error("AI processing is disabled; use deterministic local routes");
}
