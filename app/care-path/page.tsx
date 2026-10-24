"use client";
import Link from "next/link";
import { useMemo } from "react";
import { carePath, evaluateCheckin } from "@/lib/engine";
import { localDate } from "@/lib/store";
import type { CareLevel, Checkin } from "@/lib/types";
import { useApp } from "@/components/AppShell";
import { RequireProfile } from "@/components/RequireProfile";
import { CareLevelCard } from "@/components/CareLevelCard";
import { Icon } from "@/components/Icon";

export default function CarePathPage() { return <RequireProfile><CarePathContent /></RequireProfile>; }
function CarePathContent() {
  const { state, openCrisis } = useApp();
  const profile = state.profile!;
  const path = useMemo(() => {
    const latest: Checkin = state.checkins.at(-1) ?? { id: "starting-point", date: localDate(), goodNote: "", hardNote: "", inputMode: "text", userLabel: null, sleepHoursInput: null, features: null, modelP: null, driftFeedback: null };
    // Pass the complete result, including serializable short-sleep metadata.
    return carePath(evaluateCheckin({ ...state, checkins: state.checkins.filter(c => c.id !== latest.id) }, latest), state.profile!);
  }, [state]);
  const alternatives = [...new Set<CareLevel>([...path.alsoOffer, ...(path.recommended !== 2 ? [2 as const] : [])])];
  return <div className="page"><p className="eyebrow">Support, one step at a time</p><h1 style={{ fontSize: "clamp(36px, 5vw, 52px)" }}>A path you get to choose.</h1><p className="lead">Start where you feel comfortable. These are options to explore, with free support always within reach.</p><div className="care-grid"><CareLevelCard level={path.recommended} profile={profile} recommended reasons={path.reasons} onCrisis={openCrisis} /><aside className="stack"><div className="panel"><Icon name="leaf" size={24} /><h2 style={{ marginTop: 16 }}>Your pace matters.</h2><p className="muted">You can move to another kind of support whenever you’d like. A suggestion is never a requirement.</p><Link className="text-button" href="/find-help">Explore all options</Link></div><div className="notice"><strong>Free support, any time</strong><p style={{ marginTop: 6 }}><a className="text-button" href="tel:14416">Tele-MANAS 14416</a> · Free, 24×7.</p></div></aside></div><section style={{ marginTop: 36 }}><p className="eyebrow">There’s more than one way forward</p><h2>Other steps you can take</h2><div className="grid-two">{alternatives.map(level => <CareLevelCard key={level} level={level} profile={profile} onCrisis={openCrisis} />)}</div></section><p className="helper" style={{ marginTop: 24 }}>You can always choose a different level.</p></div>;
}
