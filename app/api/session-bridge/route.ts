import { MOCK_RESPONSES } from "../../../lib/mock";
import { requests } from "../_schemas";
import { json } from "../_response";
import { containsBannedLanguage } from "../../../lib/safety";
import type { SessionBridge } from "../../../lib/types";
const safe = (text: string) => containsBannedLanguage(text) ? "" : text;
function callScript(language: string, budget: number, mode: string): string {
  if (/tamil|^ta(?:-|$)/i.test(language)) return `Vanakkam. Naan mudhal murai oru appointment patri ketka virumbugiren. Tamil-il pesa virumbugiren. Enakku ${mode === "online" ? "online" : mode === "in_person" ? "neril" : "online alladhu neril"} sandhippu vasadhiyaaga irukkum. Oru sandhippukku en budget Rs ${budget}. Ungal kattanam enna, kuraindha kattanathil sandhikka mudiyumaa? Endha naal, nerathil appointment kidaikkum? Mudhal sandhippu evvalavu neram irukkum? Naan pagirum vishayangal eppadi ragasiyamaaga vaikkappadum? Munnaal edhaavadhu kondu vara vendumaa? Ungal badhilai poruththu naan mudivu seiya virumbugiren. Nandri.`;
  if (/hindi|^hi(?:-|$)/i.test(language)) return `Namaste. Main pehli mulaqat ke liye appointment ke baare mein poochhna chahta ya chahti hoon. Main Hindi mein baat karna pasand karoonga ya karoongi. ${mode === "online" ? "Online" : mode === "in_person" ? "Aamne saamne" : "Online ya aamne saamne"} mulaqat theek rahegi. Har session ka mera budget Rs ${budget} hai. Aapki fees kya hai? Kya kam fees ka vikalp hai? Aap kab mil sakte hain? Pehli mulaqat kitni der chalegi? Meri baatein kaise private rahengi? Kya kuch saath laana hoga? Dhanyavaad.`;
  return `Hello, I would like to ask about a first appointment. I would prefer to speak in ${safe(language) || "English"}, and ${mode === "either" ? "either an online or in-person session" : mode === "online" ? "an online session" : "an in-person session"} would suit me. My budget is up to INR ${budget} per session. Could you tell me about your fees, any lower-cost options, and your availability? I would also like to know how long the first appointment lasts and how you keep what I share confidential. Thank you.`;
}
export async function POST(req: Request): Promise<Response> {
  try {
    const input = requests.sessionBridge.parse(await req.json());
    const checkins = [...new Map(input.checkins.map(c => [c.date, c])).values()].sort((a, b) => a.date.localeCompare(b.date));
    const latest = Date.parse(checkins.at(-1)?.date ?? "");
    const recent = checkins.filter(c => latest - Date.parse(c.date) < 30 * 86400000);
    const relevant = recent.filter(c => c.userLabel === "bad" || c.driftFeedback === "struggling" || (c.features?.matchedSignalIds.length ?? 0) > 0);
    const chosen = (relevant.length ? relevant : recent).slice(-8);
    const bridge: SessionBridge = {
      inMyWords: safe(input.inMyWords), whatIWantFromSupport: safe(input.whatIWantFromSupport),
      whatsBeenHappening: chosen.flatMap(c => { const text = safe(c.hardNote) || safe(c.goodNote); if (!text) return []; const quote = text.match(/^(?:\S+\s+){0,14}\S+/)?.[0] ?? text; return [{ date: c.date, text, quote }]; }),
      patternsINoticed: input.profile.signals.filter(s => s.active).map(s => safe(s.text)).filter(Boolean),
      whatHelps: input.profile.helpfulActions.map(safe).filter(Boolean), whatHasntHelped: [],
      practical: { languages: input.profile.prefs.languages.map(safe).filter(Boolean), budget: input.profile.prefs.budgetPerSession === 0 ? "Free options" : `Up to INR ${input.profile.prefs.budgetPerSession} per session`, mode: input.profile.prefs.mode, availability: safe(input.availability) },
      questionsToAsk: [...MOCK_RESPONSES.sessionBridge.bridge.questionsToAsk],
      callScript: callScript(input.language, input.profile.prefs.budgetPerSession, input.profile.prefs.mode), generatedAt: new Date().toISOString(),
    };
    bridge.whatsBeenHappening = bridge.whatsBeenHappening.map(item => {
      const source = checkins.find(c => c.date === item.date);
      return item.quote && source && (source.goodNote.includes(item.quote) || source.hardNote.includes(item.quote)) ? item : { date: item.date, text: item.text };
    });
    return json({ bridge, degraded: true });
  } catch { return json({ ...MOCK_RESPONSES.sessionBridge, degraded: true }); }
}
