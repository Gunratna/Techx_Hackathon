import Link from "next/link";
import { CARE_LEVEL_LABELS } from "@/lib/types";
import type { CareLevel, Profile } from "@/lib/types";
import { Icon } from "./Icon";

const descriptions: Record<CareLevel, string> = {
  0: "Something familiar and manageable can be a place to begin. Start with what you already know helps.",
  1: "You can share a little with someone who knows you. A small hello is enough to start.",
  2: "A free, confidential conversation can help you explore a next step. Tele-MANAS is available around the clock.",
  3: "A conversation with a counsellor or psychologist might help you make room for what’s been happening.",
  4: "A psychiatrist or hospital clinic might help you explore more support, at a pace you can discuss together.",
  5: "Help is available right now. You can call, or go to the nearest hospital emergency department.",
};
export function CareLevelCard({ level, profile, recommended = false, reasons = [], onCrisis }: { level: CareLevel; profile: Profile; recommended?: boolean; reasons?: string[]; onCrisis: () => void }) {
  const trusted = profile.trustedPerson;
  const phone = trusted?.phone?.replace(/[^+\d]/g, "");
  return <article className={`panel care-level ${recommended ? "soft-panel" : ""}`}><div className="actions" style={{ justifyContent: "space-between", marginBottom: 12 }}><span className="badge">{recommended ? "A SUGGESTED NEXT STEP" : "ANOTHER OPTION"}</span><Icon name={level <= 1 ? "heart" : "phone"} size={21} /></div><h2 className="serif" style={{ fontSize: recommended ? 31 : 26 }}>{CARE_LEVEL_LABELS[level]}</h2><p className="muted">{descriptions[level]}</p>{reasons.length > 0 && <ul className="care-reasons">{reasons.map(reason => <li key={reason}>{reason}</li>)}</ul>}{level === 0 && <><div className="chips" style={{ marginBottom: 18 }}>{profile.helpfulActions.slice(0, 3).map(action => <span className="chip" key={action}>{action}</span>)}</div><Link className="button" href="/checkin#small-steps">See small steps<Icon name="arrow" size={15} /></Link></>}{level === 1 && <><p>{trusted ? `Maybe message ${trusted.name}?` : "Maybe message someone you trust?"}</p>{phone ? <div className="actions"><a className="button" href={`sms:${phone}?body=${encodeURIComponent("Hi, could we talk for a little while?")}`}>Open a message</a><a className="button secondary" href={`tel:${phone}`}>Call {trusted?.name}</a></div> : <p className="helper">You could say: “Could we talk for a little while?” Nothing is sent from here.</p>}</>}{level === 2 && <a className="button" href="tel:14416"><Icon name="phone" size={15} />Call Tele-MANAS 14416</a>}{(level === 3 || level === 4) && <Link className="button" href={`/find-help?level=${level}`}>Find options<Icon name="arrow" size={15} /></Link>}{level === 5 && <button type="button" className="crisis-button" onClick={onCrisis}>Open immediate support</button>}</article>;
}
