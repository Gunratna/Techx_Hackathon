import type { CheckinFeatures, Evidence, PersonalSignal, Theme } from "../../../lib/types";
import { keywordSafety } from "../../../lib/safety";

// Deliberately limited, inspectable rules. No model, network calls, or hidden inference.
export const BEHAVIOURS = [
  { category: /eat|food|meal|dinner/i, id: "skipped_meals", pattern: /(?:skipp(?:ed|ing) (?:dinner|meals?|lunch)|didn['’]t eat(?: properly| dinner)?|not eating(?: properly)?|ate only snacks)/i },
  { category: /sleep|night|late|2am/i, id: "late_nights", pattern: /(?:stay(?:ed|ing) up (?:till|until) [234](?:\s*(?:am|a\.m\.))?|slept at [234]|sleeping after 2\s*am|stay up late)/i },
  { category: /reply|repl|friend|message|riya|quiet|people/i, id: "ignoring_riya", pattern: /(?:didn['’]t reply to [\p{L}]+|not replying to [\p{L}]+|ignored (?:everyone['’]s )?messages|go quiet|cancelled plans)/iu },
] as const;
export function matchingSignals(notes: string[], signals: PersonalSignal[]): { ids: string[]; evidence: Evidence[] } {
  const ids: string[] = [], evidence: Evidence[] = [];
  for (const signal of signals) {
    if (!signal.text.trim()) continue;
    let quote = "";
    for (const note of notes) {
      const index = note.toLowerCase().indexOf(signal.text.toLowerCase());
      if (index >= 0) quote = note.slice(index, index + signal.text.length);
      if (!quote) for (const rule of BEHAVIOURS) if (rule.category.test(signal.text)) { quote = note.match(rule.pattern)?.[0] ?? ""; if (quote) break; }
      if (quote) break;
    }
    if (quote) { ids.push(signal.id); evidence.push({ feature: "signal", quote }); }
  }
  return { ids: [...new Set(ids)], evidence };
}
export function localFeatures(goodNote: string, hardNote: string, sleepInput: number | null, signals: PersonalSignal[]): CheckinFeatures {
  const notes = [goodNote, hardNote], text = notes.join("\n"), matched = matchingSignals(notes, signals);
  const evidence = [...matched.evidence];
  const socialNegative = notes.flatMap(n => n.match(BEHAVIOURS[2].pattern)?.[0] ?? [])[0];
  const socialPositive = notes.flatMap(n => n.match(/(?:dinner with [\p{L}]+|called [\p{L}]+|with friends)/iu)?.[0] ?? [])[0];
  if (socialNegative || socialPositive) evidence.push({ feature: "social", quote: socialNegative ?? socialPositive });
  const sleepMatch = notes.map(n => n.match(/slept\s+(\d+(?:\.\d+)?)\s*hours/i)).find(Boolean);
  const interval = notes.map(n => n.match(/slept at (\d{1,2}),? (?:woke|up) at (\d{1,2})/i)).find(Boolean);
  const inferred = sleepMatch ? Number(sleepMatch[1]) : interval ? (Number(interval[2]) - Number(interval[1]) + 24) % 24 : null;
  const sleepHours = sleepInput ?? (inferred !== null && inferred <= 24 ? inferred : null);
  if (sleepMatch || interval) evidence.push({ feature: "sleep", quote: (sleepMatch ?? interval)![0] });
  const themes: Theme[] = [];
  const themeRules: [Theme, RegExp][] = [["food", /dinner|meal|eat|food|snacks/i], ["sleep", /sleep|slept|stayed up|night/i], ["work", /work|sprint|build|meetings/i], ["friends", /riya|friend/i], ["family", /amma|family/i], ["rest", /walk|terrace|run/i], ["self_worth", /useless|worthless/i], ["loneliness", /lonely|alone/i]];
  for (const [theme, pattern] of themeRules) { const quote = notes.map(n => n.match(pattern)?.[0]).find(Boolean); if (quote) { themes.push(theme); evidence.push({ feature: "theme", quote }); } }
  const hard = notes.map(n => n.match(/(?:everything feels heavy|felt useless|couldn['’]t get out of bed|drained|exhausted)/i)?.[0]).find(Boolean);
  const positive = notes.map(n => n.match(/(?:went for a run|walked on the terrace|finished the sprint|dinner with [\p{L}]+|actually did it)/iu)?.[0]).find(Boolean);
  if (hard || positive) evidence.push({ feature: "valence", quote: hard ?? positive! });
  return { valence: hard ? -.4 : positive ? .3 : 0, energy: hard ? -.3 : positive ? .2 : 0, social: socialNegative ? -.2 : socialPositive ? .3 : 0, sleepHours,
    themes, matchedSignalIds: matched.ids, safety: keywordSafety(text),
    evidence: evidence.filter(e => e.quote.trim().split(/\s+/).length <= 15 && notes.some(n => n.includes(e.quote))).slice(0, 4) };
}
