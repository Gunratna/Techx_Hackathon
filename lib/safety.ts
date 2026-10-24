import type { Safety } from "./types";

const urgent = ["kill myself", "end my life", "want to die", "wanna die", "suicide", "suicidal", "self harm", "self-harm", "cut myself", "hurt myself", "no reason to live", "better off dead", "marna hai", "mar jaana", "mar jaun", "jeena nahi", "khud ko khatam", "saaga poren", "saaganum", "uyir vida"];
const concern = ["hopeless", "no point", "can't go on", "give up on everything", "kuch matlab nahi"];
export function keywordSafety(text: string): Safety {
  const normalized = text.toLowerCase().replace(/[’‘]/g, "'").replace(/\s+/g, " ").trim();
  return urgent.some(p => normalized.includes(p)) ? "urgent" : concern.some(p => normalized.includes(p)) ? "concern" : "none";
}
export function maxSafety(a: Safety, b: Safety): Safety {
  const levels: Safety[] = ["none", "concern", "urgent"];
  return levels[Math.max(levels.indexOf(a), levels.indexOf(b))];
}
export function containsBannedLanguage(value: unknown): boolean {
  if (typeof value === "string") return /\b(depressed|depression|disorder|diagnosis|suicidal)\b|\brisk\s+score\b|\byou\s+need\b/i.test(value);
  if (Array.isArray(value)) return value.some(containsBannedLanguage);
  return value !== null && typeof value === "object" && Object.values(value).some(containsBannedLanguage);
}
