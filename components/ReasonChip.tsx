import type { Checkin } from "@/lib/types";
export function ReasonChip({ message, quotes, checkins }: { message: string; quotes: string[]; checkins: Checkin[] }) {
  return <div className="reason"><p>{message}</p>{quotes.map(quote => { const source = [...checkins].reverse().find(c => `${c.goodNote}\n${c.hardNote}`.includes(quote)); if (!source || !quote.trim()) return null; return <blockquote key={quote}><span>“{quote}”</span><time dateTime={source.date}>{new Date(`${source.date}T12:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</time></blockquote>; })}</div>;
}
